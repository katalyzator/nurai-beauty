import "server-only";

import { buildTelegramBookingConfirmationText } from "@/lib/domain/booking-notifications";
import { createAdminClient } from "@/lib/supabase/admin";

type BookingNotificationRow = {
  id: string;
  start_at: string;
  telegram_user_id: number | null;
  salons: { address: string; name: string } | { address: string; name: string }[] | null;
  services: { name: string } | { name: string }[] | null;
  salon_staff: { full_name: string } | { full_name: string }[] | null;
};

export async function sendTelegramBookingConfirmation(bookingId: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        start_at,
        telegram_user_id,
        salons(name,address),
        services(name),
        salon_staff(full_name)
      `,
    )
    .eq("id", bookingId)
    .single();

  if (error) throw new Error(error.message);

  const booking = data as BookingNotificationRow;
  if (!booking.telegram_user_id) {
    return { delivered: false, reason: "no_telegram_user" as const };
  }

  const salon = pickRelation(booking.salons);
  const service = pickRelation(booking.services);
  const staff = pickRelation(booking.salon_staff);
  const text = buildTelegramBookingConfirmationText({
    salonAddress: salon?.address ?? "Адрес уточнит салон",
    salonName: salon?.name ?? "Салон nurAI",
    serviceName: service?.name ?? "Услуга",
    staffName: staff?.full_name ?? null,
    startAt: booking.start_at,
  });
  const { data: notification } = await supabase
    .from("notifications")
    .insert({
      booking_id: booking.id,
      channel: "telegram",
      payload: { text },
      recipient_phone: null,
      telegram_user_id: booking.telegram_user_id,
      template: "booking_confirmation",
    })
    .select("id")
    .single();

  if (!botToken) {
    return { delivered: false, reason: "missing_bot_token" as const };
  }

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      body: JSON.stringify({
        chat_id: booking.telegram_user_id,
        disable_web_page_preview: true,
        parse_mode: "HTML",
        text,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: AbortSignal.timeout(4000),
    },
  );

  if (!response.ok) {
    return { delivered: false, reason: "telegram_rejected" as const };
  }

  if (notification?.id) {
    await supabase
      .from("notifications")
      .update({ delivered_at: new Date().toISOString() })
      .eq("id", notification.id);
  }

  return { delivered: true, reason: null };
}

function pickRelation<T>(relation: T | T[] | null): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation;
}
