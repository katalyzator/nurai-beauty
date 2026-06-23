import { z } from "zod";
import type { Booking, BookingInput } from "@/lib/domain/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const bookingInputSchema = z.object({
  salonId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().nullable(),
  clientName: z.string().min(2).max(120),
  clientPhone: z.string().min(7).max(32),
  telegramUserId: z.number().int().positive().nullable().optional(),
  startAt: z.iso.datetime(),
  source: z.enum(["web", "telegram", "merchant_manual"]),
  notes: z.string().max(500).optional(),
});

export function calculateEndAt(
  startAt: string,
  durationMinutes: number,
): string {
  return new Date(
    new Date(startAt).getTime() + durationMinutes * 60_000,
  ).toISOString();
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  const parsed = bookingInputSchema.parse(input);
  if (parsed.source === "telegram" && !parsed.telegramUserId) {
    throw new Error("Telegram authorization is required");
  }

  const supabase = createAdminClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes,salon_id,is_active")
    .eq("id", parsed.serviceId)
    .single();

  if (serviceError) throw new Error(serviceError.message);
  if (
    !service.is_active ||
    service.salon_id !== parsed.salonId
  ) {
    throw new Error("Service is not available for this salon");
  }

  const { data: salon, error: salonError } = await supabase
    .from("salons")
    .select("status")
    .eq("id", parsed.salonId)
    .single();

  if (salonError) throw new Error(salonError.message);
  if (salon.status !== "active") {
    throw new Error("Salon is not available for booking");
  }

  if (parsed.staffId) {
    const { data: staff, error: staffError } = await supabase
      .from("salon_staff")
      .select("salon_id,is_active")
      .eq("id", parsed.staffId)
      .single();

    if (staffError) throw new Error(staffError.message);
    if (!staff.is_active || staff.salon_id !== parsed.salonId) {
      throw new Error("Staff member is not available for this salon");
    }
  }

  const endAt = calculateEndAt(parsed.startAt, service.duration_minutes);
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      salon_id: parsed.salonId,
      service_id: parsed.serviceId,
      staff_id: parsed.staffId,
      client_name: parsed.clientName,
      client_phone: parsed.clientPhone,
      telegram_user_id: parsed.telegramUserId ?? null,
      start_at: parsed.startAt,
      end_at: endAt,
      source: parsed.source,
      notes: parsed.notes ?? null,
    })
    .select(
      "id,salon_id,service_id,staff_id,client_name,client_phone,telegram_user_id,start_at,end_at,status,source",
    )
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    salonId: data.salon_id,
    serviceId: data.service_id,
    staffId: data.staff_id,
    clientName: data.client_name,
    clientPhone: data.client_phone,
    telegramUserId: data.telegram_user_id,
    startAt: data.start_at,
    endAt: data.end_at,
    status: data.status,
    source: data.source,
  };
}
