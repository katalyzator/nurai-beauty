import { z } from "zod";
import { getTelegramSession } from "@/lib/auth/telegram-session";
import type { TelegramSession } from "@/lib/domain/telegram";
import type { Booking } from "@/lib/domain/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const merchantBookingStatusLabels: Record<Booking["status"], string> = {
  cancelled: "Отменена",
  completed: "Завершена",
  confirmed: "Подтверждена",
  new: "Новая",
  no_show: "Не пришел",
};

const merchantBookingStatusTransitions: Record<
  Booking["status"],
  Booking["status"][]
> = {
  cancelled: [],
  completed: [],
  confirmed: ["completed", "cancelled", "no_show"],
  new: ["confirmed", "cancelled"],
  no_show: [],
};

export function canTransitionMerchantBookingStatus(
  from: Booking["status"],
  to: Booking["status"],
) {
  if (from === to) return true;
  return merchantBookingStatusTransitions[from].includes(to);
}

const merchantOnboardingInputSchema = z.object({
  address: z.string().trim().min(4).max(240),
  instagramUrl: z.string().trim().max(120).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  masterName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(32),
  salonName: z.string().trim().min(2).max(120),
  serviceDurationMinutes: z.coerce.number().int().min(10).max(600),
  serviceName: z.string().trim().min(2).max(120),
  servicePriceKgs: z.coerce.number().int().min(0).max(1_000_000),
});

export type MerchantOnboardingInput = z.input<
  typeof merchantOnboardingInputSchema
>;

export type NormalizedMerchantOnboardingInput = z.output<
  typeof merchantOnboardingInputSchema
> & {
  slugBase: string;
};

export function normalizeMerchantOnboardingInput(
  input: MerchantOnboardingInput,
): NormalizedMerchantOnboardingInput {
  const parsed = merchantOnboardingInputSchema.parse(input);

  return {
    ...parsed,
    instagramUrl: parsed.instagramUrl || undefined,
    slugBase: createSlugBase(parsed.salonName),
  };
}

function createSlugBase(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "salon";
}

export type MerchantSalon = {
  id: string;
  name: string;
  slug: string;
  status: string;
  address: string;
  phone: string | null;
  instagramUrl: string | null;
  role: MerchantMemberRole;
  serviceCount: number;
  staffCount: number;
};

export type MerchantBooking = {
  id: string;
  salonId: string;
  salonName: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  staffName: string | null;
  startAt: string;
  endAt: string;
  status: Booking["status"];
  source: Booking["source"];
};

export type MerchantService = {
  id: string;
  salonId: string;
  category: string;
  durationMinutes: number;
  isActive: boolean;
  name: string;
  priceKgs: number;
};

export type MerchantStaff = {
  id: string;
  salonId: string;
  fullName: string;
  isActive: boolean;
  roleTitle: string;
  specialties: string[];
};

export type MerchantMemberRole = "owner" | "admin" | "manager" | "staff";

export type MerchantDashboard = {
  authenticated: boolean;
  bookings: MerchantBooking[];
  salons: MerchantSalon[];
  services: MerchantService[];
  session: TelegramSession | null;
  staff: MerchantStaff[];
};

type BookingRow = {
  id: string;
  salon_id: string;
  service_id: string;
  staff_id: string | null;
  client_name: string;
  client_phone: string;
  end_at: string;
  start_at: string;
  status: Booking["status"];
  source: Booking["source"];
  salons: { name: string } | { name: string }[] | null;
  services: { name: string } | { name: string }[] | null;
  salon_staff: { full_name: string } | { full_name: string }[] | null;
};

type MerchantMemberRow = {
  role: MerchantMemberRole;
  salon_id: string;
};

type SalonRow = {
  id: string;
  address: string;
  instagram_url: string | null;
  name: string;
  phone: string | null;
  slug: string;
  status: string;
};

type ServiceRow = {
  id: string;
  category: string;
  duration_minutes: number;
  is_active: boolean;
  name: string;
  price_kgs: number;
  salon_id: string;
};

type StaffRow = {
  id: string;
  full_name: string;
  is_active: boolean;
  role_title: string;
  salon_id: string;
  specialties: string[] | null;
};

export async function getMerchantDashboard(
  session?: TelegramSession | null,
): Promise<MerchantDashboard> {
  const resolvedSession = session === undefined ? await getTelegramSession() : session;

  if (!resolvedSession) {
    return emptyMerchantDashboard(null);
  }

  const supabase = createAdminClient();
  const { data: memberships, error: membershipsError } = await supabase
    .from("merchant_telegram_members")
    .select("salon_id,role")
    .eq("telegram_user_id", resolvedSession.telegramUserId)
    .eq("is_active", true);

  if (membershipsError) throw new Error(membershipsError.message);

  const memberRows = (memberships ?? []) as MerchantMemberRow[];
  const salonIds = memberRows.map((membership) => membership.salon_id);
  if (salonIds.length === 0) {
    return emptyMerchantDashboard(resolvedSession);
  }

  const roleBySalonId = new Map(
    memberRows.map((membership) => [membership.salon_id, membership.role]),
  );
  const { data: salons, error: salonsError } = await supabase
    .from("salons")
    .select("id,name,slug,status,address,phone,instagram_url")
    .in("id", salonIds)
    .order("name", { ascending: true });
  if (salonsError) throw new Error(salonsError.message);

  const [{ data: services, error: servicesError }, { data: staff, error: staffError }] =
    await Promise.all([
      supabase
        .from("services")
        .select("id,salon_id,category,name,duration_minutes,price_kgs,is_active")
        .in("salon_id", salonIds)
        .order("name", { ascending: true }),
      supabase
        .from("salon_staff")
        .select("id,salon_id,full_name,role_title,is_active,specialties")
        .in("salon_id", salonIds)
        .order("sort_order", { ascending: true })
        .order("full_name", { ascending: true }),
    ]);

  if (servicesError) throw new Error(servicesError.message);
  if (staffError) throw new Error(staffError.message);

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      "id,salon_id,service_id,staff_id,client_name,client_phone,start_at,end_at,status,source,salons(name),services(name),salon_staff(full_name)",
    )
    .in("salon_id", salonIds)
    .order("start_at", { ascending: true });
  if (bookingsError) throw new Error(bookingsError.message);

  const serviceRows = (services ?? []) as ServiceRow[];
  const staffRows = (staff ?? []) as StaffRow[];

  return {
    authenticated: true,
    session: resolvedSession,
    salons: ((salons ?? []) as SalonRow[]).map((salon) => ({
      address: salon.address,
      id: salon.id,
      instagramUrl: salon.instagram_url,
      name: salon.name,
      phone: salon.phone,
      role: roleBySalonId.get(salon.id) ?? "staff",
      serviceCount: serviceRows.filter((service) => service.salon_id === salon.id)
        .length,
      slug: salon.slug,
      staffCount: staffRows.filter((member) => member.salon_id === salon.id)
        .length,
      status: salon.status,
    })),
    services: serviceRows.map((service) => ({
      category: service.category,
      durationMinutes: service.duration_minutes,
      id: service.id,
      isActive: service.is_active,
      name: service.name,
      priceKgs: service.price_kgs,
      salonId: service.salon_id,
    })),
    staff: staffRows.map((member) => ({
      fullName: member.full_name,
      id: member.id,
      isActive: member.is_active,
      roleTitle: member.role_title,
      salonId: member.salon_id,
      specialties: member.specialties ?? [],
    })),
    bookings: ((bookings ?? []) as BookingRow[]).map((booking) => {
      const salon = Array.isArray(booking.salons)
        ? booking.salons[0]
        : booking.salons;
      const service = Array.isArray(booking.services)
        ? booking.services[0]
        : booking.services;
      const staffMember = Array.isArray(booking.salon_staff)
        ? booking.salon_staff[0]
        : booking.salon_staff;

      return {
        id: booking.id,
        salonId: booking.salon_id,
        salonName: salon?.name ?? "Салон",
        clientName: booking.client_name,
        clientPhone: booking.client_phone,
        endAt: booking.end_at,
        serviceName: service?.name ?? "Услуга",
        staffName: staffMember?.full_name ?? null,
        startAt: booking.start_at,
        status: booking.status,
        source: booking.source,
      };
    }),
  };
}

export async function createMerchantOnboarding({
  input,
  session,
}: {
  input: MerchantOnboardingInput;
  session: TelegramSession;
}) {
  const normalized = normalizeMerchantOnboardingInput(input);
  const supabase = createAdminClient();
  await upsertTelegramUserFromSession(supabase, session);
  const slug = await createUniqueSalonSlug(supabase, normalized.slugBase);

  const { data: salon, error: salonError } = await supabase
    .from("salons")
    .insert({
      address: normalized.address,
      city: "Bishkek",
      description:
        "Салон подключен к nurAI: онлайн-запись, Telegram-уведомления и кабинет для команды.",
      instagram_url: normalized.instagramUrl ?? null,
      location: `POINT(${normalized.longitude} ${normalized.latitude})`,
      name: normalized.salonName,
      phone: normalized.phone,
      price_tier: 2,
      slug,
      status: "active",
    })
    .select("id,name,slug")
    .single();
  if (salonError) throw new Error(salonError.message);

  const { error: membershipError } = await supabase
    .from("merchant_telegram_members")
    .insert({
      role: "owner",
      salon_id: salon.id,
      telegram_user_id: session.telegramUserId,
    });
  if (membershipError) throw new Error(membershipError.message);

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .insert({
      category: inferServiceCategory(normalized.serviceName),
      description: null,
      duration_minutes: normalized.serviceDurationMinutes,
      is_active: true,
      name: normalized.serviceName,
      price_kgs: normalized.servicePriceKgs,
      salon_id: salon.id,
    })
    .select("id")
    .single();
  if (serviceError) throw new Error(serviceError.message);

  const { data: staff, error: staffError } = await supabase
    .from("salon_staff")
    .insert({
      bio: "Первый мастер салона",
      full_name: normalized.masterName,
      is_active: true,
      role_title: "Мастер",
      salon_id: salon.id,
      sort_order: 1,
      specialties: [normalized.serviceName],
    })
    .select("id")
    .single();
  if (staffError) throw new Error(staffError.message);

  const { error: staffServiceError } = await supabase
    .from("staff_services")
    .insert({ service_id: service.id, staff_id: staff.id });
  if (staffServiceError) throw new Error(staffServiceError.message);

  const { error: hoursError } = await supabase.from("staff_working_hours").insert(
    [1, 2, 3, 4, 5, 6].map((weekday) => ({
      ends_at: "20:00",
      staff_id: staff.id,
      starts_at: "10:00",
      weekday,
    })),
  );
  if (hoursError) throw new Error(hoursError.message);

  return salon;
}

export async function updateMerchantBookingStatus({
  bookingId,
  status,
  telegramUserId,
}: {
  bookingId: string;
  status: Booking["status"];
  telegramUserId: number;
}) {
  const supabase = createAdminClient();
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id,salon_id,status")
    .eq("id", bookingId)
    .single();
  if (bookingError) throw new Error(bookingError.message);

  const { data: membership, error: membershipError } = await supabase
    .from("merchant_telegram_members")
    .select("role")
    .eq("salon_id", booking.salon_id)
    .eq("telegram_user_id", telegramUserId)
    .eq("is_active", true)
    .maybeSingle();
  if (membershipError) throw new Error(membershipError.message);
  if (!membership || !canManageBookings(membership.role as MerchantMemberRole)) {
    throw new Error("You do not have access to this booking");
  }

  const currentStatus = booking.status as Booking["status"];
  if (!canTransitionMerchantBookingStatus(currentStatus, status)) {
    throw new Error("This booking status transition is not allowed");
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select("id,status")
    .single();
  if (error) throw new Error(error.message);

  return { id: data.id, status: data.status as Booking["status"] };
}

function emptyMerchantDashboard(
  session: TelegramSession | null,
): MerchantDashboard {
  return {
    authenticated: Boolean(session),
    bookings: [],
    salons: [],
    services: [],
    session,
    staff: [],
  };
}

function canManageBookings(role: MerchantMemberRole) {
  return role === "owner" || role === "admin" || role === "manager";
}

async function upsertTelegramUserFromSession(
  supabase: ReturnType<typeof createAdminClient>,
  session: TelegramSession,
) {
  const { error } = await supabase.from("telegram_users").upsert(
    {
      first_name: session.firstName,
      last_name: session.lastName,
      photo_url: session.photoUrl,
      telegram_user_id: session.telegramUserId,
      updated_at: new Date().toISOString(),
      username: session.username,
    },
    { onConflict: "telegram_user_id" },
  );
  if (error) throw new Error(error.message);
}

async function createUniqueSalonSlug(
  supabase: ReturnType<typeof createAdminClient>,
  slugBase: string,
) {
  const { data, error } = await supabase
    .from("salons")
    .select("slug")
    .like("slug", `${slugBase}%`);
  if (error) throw new Error(error.message);

  const existingSlugs = new Set((data ?? []).map((salon) => salon.slug));
  if (!existingSlugs.has(slugBase)) return slugBase;

  for (let index = 2; index <= 99; index += 1) {
    const candidate = `${slugBase}-${index}`;
    if (!existingSlugs.has(candidate)) return candidate;
  }

  return `${slugBase}-${Date.now()}`;
}

function inferServiceCategory(serviceName: string) {
  const normalized = serviceName.toLowerCase();
  if (normalized.includes("маникюр") || normalized.includes("ног")) {
    return "Ногти";
  }
  if (normalized.includes("бров")) return "Брови";
  if (normalized.includes("волос") || normalized.includes("уклад")) {
    return "Волосы";
  }
  if (normalized.includes("космет")) return "Косметология";
  return "Красота";
}
