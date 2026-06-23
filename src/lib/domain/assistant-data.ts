import "server-only";

import type {
  AssistantCatalogSalon,
  AssistantContext,
  AssistantOwnBooking,
} from "@/lib/domain/assistant";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

type ServiceRow = {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
  price_kgs: number;
};

type StaffRow = {
  id: string;
  full_name: string;
  role_title: string;
};

type CatalogSalonRow = {
  id: string;
  name: string;
  slug: string;
  address: string;
  rating: number;
  review_count: number;
  services: ServiceRow[] | null;
  salon_staff: StaffRow[] | null;
};

type BookingRow = {
  id: string;
  start_at: string;
  status: string;
  salons: { name: string } | { name: string }[] | null;
  services: { name: string } | { name: string }[] | null;
  salon_staff: { full_name: string } | { full_name: string }[] | null;
};

export async function getAssistantContext(params: {
  telegramUserId?: number | null;
}): Promise<AssistantContext> {
  const [salons, ownBookings] = await Promise.all([
    getAssistantCatalog(),
    params.telegramUserId
      ? getOwnBookingsForAssistant(params.telegramUserId)
      : Promise.resolve([]),
  ]);

  return {
    currentDate: getBishkekDate(),
    timezone: "Asia/Bishkek",
    isTelegramAuthenticated: Boolean(params.telegramUserId),
    salons,
    ownBookings,
  };
}

export async function getAssistantCatalog(): Promise<AssistantCatalogSalon[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("salons")
    .select(
      `
        id,
        name,
        slug,
        address,
        rating,
        review_count,
        services(
          id,
          name,
          category,
          duration_minutes,
          price_kgs
        ),
        salon_staff(
          id,
          full_name,
          role_title
        )
      `,
    )
    .eq("status", "active")
    .eq("services.is_active", true)
    .eq("salon_staff.is_active", true)
    .order("rating", { ascending: false })
    .limit(8);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CatalogSalonRow[]).map((salon) => ({
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    address: salon.address,
    rating: Number(salon.rating),
    reviewCount: salon.review_count,
    services: (salon.services ?? []).slice(0, 8).map((service) => ({
      id: service.id,
      name: service.name,
      category: service.category,
      durationMinutes: service.duration_minutes,
      priceKgs: service.price_kgs,
    })),
    staff: (salon.salon_staff ?? []).slice(0, 8).map((member) => ({
      id: member.id,
      fullName: member.full_name,
      roleTitle: member.role_title,
    })),
  }));
}

export async function getOwnBookingsForAssistant(
  telegramUserId: number,
): Promise<AssistantOwnBooking[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        start_at,
        status,
        salons(name),
        services(name),
        salon_staff(full_name)
      `,
    )
    .eq("telegram_user_id", telegramUserId)
    .order("start_at", { ascending: false })
    .limit(6);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as BookingRow[]).map((booking) => {
    const salon = pickRelation(booking.salons);
    const service = pickRelation(booking.services);
    const staff = pickRelation(booking.salon_staff);

    return {
      id: booking.id,
      salonName: salon?.name ?? "Салон",
      serviceName: service?.name ?? "Услуга",
      staffName: staff?.full_name ?? null,
      startAt: booking.start_at,
      status: booking.status,
    };
  });
}

function pickRelation<T>(relation: T | T[] | null): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation;
}

function getBishkekDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bishkek",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
