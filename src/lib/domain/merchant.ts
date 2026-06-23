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

const merchantServiceInputSchema = z.object({
  category: z.string().trim().max(80).optional(),
  durationMinutes: z.coerce.number().int().min(10).max(600),
  isActive: z.preprocess(normalizeBooleanish, z.boolean()).default(true),
  name: z.string().trim().min(2).max(120),
  priceKgs: z.coerce.number().int().min(0).max(1_000_000),
});

export type MerchantServiceInput = z.input<typeof merchantServiceInputSchema>;

export type NormalizedMerchantServiceInput = z.output<
  typeof merchantServiceInputSchema
>;

export function normalizeMerchantServiceInput(
  input: MerchantServiceInput,
): NormalizedMerchantServiceInput {
  const parsed = merchantServiceInputSchema.parse(input);
  const category = parsed.category || inferServiceCategory(parsed.name);

  return {
    ...parsed,
    category,
  };
}

const merchantStaffInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  isActive: z.preprocess(normalizeBooleanish, z.boolean()).default(true),
  roleTitle: z.string().trim().max(80).optional(),
  specialties: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => normalizeSpecialties(value)),
});

export type MerchantStaffInput = z.input<typeof merchantStaffInputSchema>;

export type NormalizedMerchantStaffInput = z.output<
  typeof merchantStaffInputSchema
> & {
  roleTitle: string;
};

export function normalizeMerchantStaffInput(
  input: MerchantStaffInput,
): NormalizedMerchantStaffInput {
  const parsed = merchantStaffInputSchema.parse(input);

  return {
    ...parsed,
    roleTitle: parsed.roleTitle || "Мастер",
  };
}

const merchantInvitationInputSchema = z.object({
  inviteeName: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(2).max(120).optional(),
  ),
  phone: z.string().trim().max(32).optional(),
  role: z.enum(["admin", "manager", "staff"]).default("staff"),
  telegramUsername: z.string().trim().max(80).optional(),
});

export type MerchantInvitationInput = z.input<
  typeof merchantInvitationInputSchema
>;

export type NormalizedMerchantInvitationInput = z.output<
  typeof merchantInvitationInputSchema
> & {
  telegramUsername?: string;
};

export function normalizeMerchantInvitationInput(
  input: MerchantInvitationInput,
): NormalizedMerchantInvitationInput {
  const parsed = merchantInvitationInputSchema.parse(input);
  const phone = parsed.phone || undefined;
  const telegramUsername = parsed.telegramUsername
    ? parsed.telegramUsername.replace(/^@+/, "")
    : undefined;

  if (!phone && !telegramUsername) {
    throw new Error("Invite requires phone or Telegram username");
  }

  return {
    inviteeName: parsed.inviteeName || undefined,
    phone,
    role: parsed.role,
    telegramUsername: telegramUsername || undefined,
  };
}

const timeInputSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/);

const merchantWorkingHoursInputSchema = z.object({
  endsAt: timeInputSchema,
  isActive: z.preprocess(normalizeBooleanish, z.boolean()).default(true),
  startsAt: timeInputSchema,
  weekday: z.coerce.number().int().min(0).max(6),
});

export type MerchantWorkingHoursInput = z.input<
  typeof merchantWorkingHoursInputSchema
>;

export type NormalizedMerchantWorkingHoursInput = z.output<
  typeof merchantWorkingHoursInputSchema
>;

export function normalizeMerchantWorkingHoursInput(
  input: MerchantWorkingHoursInput,
): NormalizedMerchantWorkingHoursInput {
  const parsed = merchantWorkingHoursInputSchema.parse(input);
  if (parsed.endsAt <= parsed.startsAt) {
    throw new Error("Working hours end time must be after start time");
  }

  return parsed;
}

export function canManageMerchantCatalog(role: MerchantMemberRole) {
  return role === "owner" || role === "admin";
}

export function buildMerchantInviteLink(token: string, appUrl?: string | null) {
  const safeToken = encodeURIComponent(token);
  if (!appUrl) return `/merchant/invite/${safeToken}`;

  return `${appUrl.replace(/\/+$/, "")}/merchant/invite/${safeToken}`;
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

export type MerchantWorkingHour = {
  id: string;
  staffId: string;
  weekday: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

export type MerchantInvitation = {
  id: string;
  salonId: string;
  role: Exclude<MerchantMemberRole, "owner">;
  inviteeName: string | null;
  phone: string | null;
  telegramUsername: string | null;
  token: string;
  inviteLink: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

export type MerchantDashboard = {
  authenticated: boolean;
  bookings: MerchantBooking[];
  invitations: MerchantInvitation[];
  salons: MerchantSalon[];
  services: MerchantService[];
  session: TelegramSession | null;
  staff: MerchantStaff[];
  workingHours: MerchantWorkingHour[];
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

type WorkingHourRow = {
  id: string;
  ends_at: string;
  is_active: boolean;
  staff_id: string;
  starts_at: string;
  weekday: number;
};

type InvitationRow = {
  id: string;
  accepted_at: string | null;
  created_at: string;
  expires_at: string;
  invitee_name: string | null;
  phone: string | null;
  role: Exclude<MerchantMemberRole, "owner">;
  salon_id: string;
  telegram_username: string | null;
  token: string;
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
  const catalogSalonIds = memberRows
    .filter((membership) => canManageMerchantCatalog(membership.role))
    .map((membership) => membership.salon_id);
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

  const staffRows = (staff ?? []) as StaffRow[];
  const staffIds = staffRows.map((member) => member.id);
  const [{ data: workingHours, error: workingHoursError }, invitationResult] =
    await Promise.all([
      staffIds.length > 0
        ? supabase
            .from("staff_working_hours")
            .select("id,staff_id,weekday,starts_at,ends_at,is_active")
            .in("staff_id", staffIds)
            .order("weekday", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      catalogSalonIds.length > 0
        ? supabase
            .from("merchant_invitations")
            .select(
              "id,salon_id,role,invitee_name,phone,telegram_username,token,expires_at,accepted_at,created_at",
            )
            .in("salon_id", catalogSalonIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);
  if (workingHoursError) throw new Error(workingHoursError.message);
  if (invitationResult.error) throw new Error(invitationResult.error.message);

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      "id,salon_id,service_id,staff_id,client_name,client_phone,start_at,end_at,status,source,salons(name),services(name),salon_staff(full_name)",
    )
    .in("salon_id", salonIds)
    .order("start_at", { ascending: true });
  if (bookingsError) throw new Error(bookingsError.message);

  const serviceRows = (services ?? []) as ServiceRow[];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nurai.beauty";

  return {
    authenticated: true,
    session: resolvedSession,
    invitations: ((invitationResult.data ?? []) as InvitationRow[]).map(
      (invitation) => ({
        acceptedAt: invitation.accepted_at,
        createdAt: invitation.created_at,
        expiresAt: invitation.expires_at,
        id: invitation.id,
        inviteLink: buildMerchantInviteLink(invitation.token, appUrl),
        inviteeName: invitation.invitee_name,
        phone: invitation.phone,
        role: invitation.role,
        salonId: invitation.salon_id,
        telegramUsername: invitation.telegram_username,
        token: invitation.token,
      }),
    ),
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
    workingHours: ((workingHours ?? []) as WorkingHourRow[]).map((hours) => ({
      endsAt: hours.ends_at.slice(0, 5),
      id: hours.id,
      isActive: hours.is_active,
      staffId: hours.staff_id,
      startsAt: hours.starts_at.slice(0, 5),
      weekday: hours.weekday,
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

export async function createMerchantService({
  input,
  salonId,
  telegramUserId,
}: {
  input: MerchantServiceInput;
  salonId: string;
  telegramUserId: number;
}) {
  const normalized = normalizeMerchantServiceInput(input);
  const supabase = createAdminClient();
  await requireMerchantCatalogAccess(supabase, salonId, telegramUserId);

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .insert({
      category: normalized.category,
      description: null,
      duration_minutes: normalized.durationMinutes,
      is_active: normalized.isActive,
      name: normalized.name,
      price_kgs: normalized.priceKgs,
      salon_id: salonId,
    })
    .select("id,salon_id,category,name,duration_minutes,price_kgs,is_active")
    .single();
  if (serviceError) throw new Error(serviceError.message);

  const { data: activeStaff, error: staffError } = await supabase
    .from("salon_staff")
    .select("id")
    .eq("salon_id", salonId)
    .eq("is_active", true);
  if (staffError) throw new Error(staffError.message);

  const staffServiceRows = (activeStaff ?? []).map((staffMember) => ({
    service_id: service.id,
    staff_id: staffMember.id,
  }));
  if (staffServiceRows.length > 0) {
    const { error: staffServiceError } = await supabase
      .from("staff_services")
      .insert(staffServiceRows);
    if (staffServiceError) throw new Error(staffServiceError.message);
  }

  return mapMerchantService(service as ServiceRow);
}

export async function toggleMerchantService({
  isActive,
  serviceId,
  telegramUserId,
}: {
  isActive: boolean;
  serviceId: string;
  telegramUserId: number;
}) {
  const supabase = createAdminClient();
  const salonId = await getServiceSalonId(supabase, serviceId);
  await requireMerchantCatalogAccess(supabase, salonId, telegramUserId);

  const { data, error } = await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", serviceId)
    .select("id,salon_id,category,name,duration_minutes,price_kgs,is_active")
    .single();
  if (error) throw new Error(error.message);

  return mapMerchantService(data as ServiceRow);
}

export async function createMerchantStaff({
  input,
  salonId,
  telegramUserId,
}: {
  input: MerchantStaffInput;
  salonId: string;
  telegramUserId: number;
}) {
  const normalized = normalizeMerchantStaffInput(input);
  const supabase = createAdminClient();
  await requireMerchantCatalogAccess(supabase, salonId, telegramUserId);

  const { data: activeServices, error: servicesError } = await supabase
    .from("services")
    .select("id,name")
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (servicesError) throw new Error(servicesError.message);

  const specialties =
    normalized.specialties.length > 0
      ? normalized.specialties
      : (activeServices ?? []).map((service) => service.name).slice(0, 4);

  const { data: staffMember, error: staffError } = await supabase
    .from("salon_staff")
    .insert({
      bio: null,
      full_name: normalized.fullName,
      is_active: normalized.isActive,
      role_title: normalized.roleTitle,
      salon_id: salonId,
      specialties,
    })
    .select("id,salon_id,full_name,role_title,is_active,specialties")
    .single();
  if (staffError) throw new Error(staffError.message);

  const staffServiceRows = (activeServices ?? []).map((service) => ({
    service_id: service.id,
    staff_id: staffMember.id,
  }));
  if (staffServiceRows.length > 0) {
    const { error: staffServiceError } = await supabase
      .from("staff_services")
      .insert(staffServiceRows);
    if (staffServiceError) throw new Error(staffServiceError.message);
  }

  const { error: hoursError } = await supabase.from("staff_working_hours").insert(
    [1, 2, 3, 4, 5, 6].map((weekday) => ({
      ends_at: "20:00",
      is_active: true,
      staff_id: staffMember.id,
      starts_at: "10:00",
      weekday,
    })),
  );
  if (hoursError) throw new Error(hoursError.message);

  return mapMerchantStaff(staffMember as StaffRow);
}

export async function toggleMerchantStaff({
  isActive,
  staffId,
  telegramUserId,
}: {
  isActive: boolean;
  staffId: string;
  telegramUserId: number;
}) {
  const supabase = createAdminClient();
  const salonId = await getStaffSalonId(supabase, staffId);
  await requireMerchantCatalogAccess(supabase, salonId, telegramUserId);

  const { data, error } = await supabase
    .from("salon_staff")
    .update({ is_active: isActive })
    .eq("id", staffId)
    .select("id,salon_id,full_name,role_title,is_active,specialties")
    .single();
  if (error) throw new Error(error.message);

  return mapMerchantStaff(data as StaffRow);
}

export async function updateMerchantWorkingHours({
  input,
  staffId,
  telegramUserId,
}: {
  input: MerchantWorkingHoursInput;
  staffId: string;
  telegramUserId: number;
}) {
  const normalized = normalizeMerchantWorkingHoursInput(input);
  const supabase = createAdminClient();
  const salonId = await getStaffSalonId(supabase, staffId);
  await requireMerchantCatalogAccess(supabase, salonId, telegramUserId);

  const { data, error } = await supabase
    .from("staff_working_hours")
    .upsert(
      {
        ends_at: normalized.endsAt,
        is_active: normalized.isActive,
        staff_id: staffId,
        starts_at: normalized.startsAt,
        weekday: normalized.weekday,
      },
      { onConflict: "staff_id,weekday" },
    )
    .select("id,staff_id,weekday,starts_at,ends_at,is_active")
    .single();
  if (error) throw new Error(error.message);

  return mapMerchantWorkingHour(data as WorkingHourRow);
}

export async function createMerchantInvitation({
  input,
  salonId,
  telegramUserId,
}: {
  input: MerchantInvitationInput;
  salonId: string;
  telegramUserId: number;
}) {
  const normalized = normalizeMerchantInvitationInput(input);
  const supabase = createAdminClient();
  await requireMerchantCatalogAccess(supabase, salonId, telegramUserId);

  const { data, error } = await supabase
    .from("merchant_invitations")
    .insert({
      created_by_telegram_user_id: telegramUserId,
      invitee_name: normalized.inviteeName ?? null,
      phone: normalized.phone ?? null,
      role: normalized.role,
      salon_id: salonId,
      telegram_username: normalized.telegramUsername ?? null,
    })
    .select(
      "id,salon_id,role,invitee_name,phone,telegram_username,token,expires_at,accepted_at,created_at",
    )
    .single();
  if (error) throw new Error(error.message);

  return mapMerchantInvitation(data as InvitationRow);
}

export async function acceptMerchantInvitation({
  session,
  token,
}: {
  session: TelegramSession;
  token: string;
}) {
  const supabase = createAdminClient();
  const { data: invitation, error: invitationError } = await supabase
    .from("merchant_invitations")
    .select(
      "id,salon_id,role,expires_at,accepted_at,created_by_telegram_user_id",
    )
    .eq("token", token)
    .maybeSingle();
  if (invitationError) throw new Error(invitationError.message);
  if (!invitation) throw new Error("Invitation was not found");
  if (invitation.accepted_at) throw new Error("Invitation is already accepted");
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    throw new Error("Invitation has expired");
  }

  await upsertTelegramUserFromSession(supabase, session);

  const { data: existingMembership, error: existingMembershipError } =
    await supabase
      .from("merchant_telegram_members")
      .select("role")
      .eq("salon_id", invitation.salon_id)
      .eq("telegram_user_id", session.telegramUserId)
      .maybeSingle();
  if (existingMembershipError) throw new Error(existingMembershipError.message);

  const nextRole = getHighestMerchantRole(
    existingMembership?.role as MerchantMemberRole | undefined,
    invitation.role as MerchantMemberRole,
  );

  const { error: memberError } = await supabase
    .from("merchant_telegram_members")
    .upsert(
      {
        invited_by_telegram_user_id:
          invitation.created_by_telegram_user_id ?? null,
        is_active: true,
        role: nextRole,
        salon_id: invitation.salon_id,
        telegram_user_id: session.telegramUserId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "salon_id,telegram_user_id" },
    );
  if (memberError) throw new Error(memberError.message);

  const { error: acceptError } = await supabase
    .from("merchant_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);
  if (acceptError) throw new Error(acceptError.message);

  const { data: salon, error: salonError } = await supabase
    .from("salons")
    .select("id,name,slug")
    .eq("id", invitation.salon_id)
    .single();
  if (salonError) throw new Error(salonError.message);

  return { salon };
}

function mapMerchantService(service: ServiceRow): MerchantService {
  return {
    category: service.category,
    durationMinutes: service.duration_minutes,
    id: service.id,
    isActive: service.is_active,
    name: service.name,
    priceKgs: service.price_kgs,
    salonId: service.salon_id,
  };
}

function mapMerchantStaff(member: StaffRow): MerchantStaff {
  return {
    fullName: member.full_name,
    id: member.id,
    isActive: member.is_active,
    roleTitle: member.role_title,
    salonId: member.salon_id,
    specialties: member.specialties ?? [],
  };
}

function mapMerchantWorkingHour(hours: WorkingHourRow): MerchantWorkingHour {
  return {
    endsAt: hours.ends_at.slice(0, 5),
    id: hours.id,
    isActive: hours.is_active,
    staffId: hours.staff_id,
    startsAt: hours.starts_at.slice(0, 5),
    weekday: hours.weekday,
  };
}

function mapMerchantInvitation(invitation: InvitationRow): MerchantInvitation {
  return {
    acceptedAt: invitation.accepted_at,
    createdAt: invitation.created_at,
    expiresAt: invitation.expires_at,
    id: invitation.id,
    inviteLink: buildMerchantInviteLink(
      invitation.token,
      process.env.NEXT_PUBLIC_APP_URL ?? "https://nurai.beauty",
    ),
    inviteeName: invitation.invitee_name,
    phone: invitation.phone,
    role: invitation.role,
    salonId: invitation.salon_id,
    telegramUsername: invitation.telegram_username,
    token: invitation.token,
  };
}

async function requireMerchantCatalogAccess(
  supabase: ReturnType<typeof createAdminClient>,
  salonId: string,
  telegramUserId: number,
) {
  const membership = await getMerchantMembershipForSalon(
    supabase,
    salonId,
    telegramUserId,
  );

  if (!membership || !canManageMerchantCatalog(membership.role)) {
    throw new Error("You do not have access to manage this salon catalog");
  }

  return membership;
}

async function getMerchantMembershipForSalon(
  supabase: ReturnType<typeof createAdminClient>,
  salonId: string,
  telegramUserId: number,
) {
  const { data, error } = await supabase
    .from("merchant_telegram_members")
    .select("role")
    .eq("salon_id", salonId)
    .eq("telegram_user_id", telegramUserId)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return { role: data.role as MerchantMemberRole };
}

async function getServiceSalonId(
  supabase: ReturnType<typeof createAdminClient>,
  serviceId: string,
) {
  const { data, error } = await supabase
    .from("services")
    .select("salon_id")
    .eq("id", serviceId)
    .single();
  if (error) throw new Error(error.message);

  return data.salon_id as string;
}

async function getStaffSalonId(
  supabase: ReturnType<typeof createAdminClient>,
  staffId: string,
) {
  const { data, error } = await supabase
    .from("salon_staff")
    .select("salon_id")
    .eq("id", staffId)
    .single();
  if (error) throw new Error(error.message);

  return data.salon_id as string;
}

function getHighestMerchantRole(
  existingRole: MerchantMemberRole | undefined,
  invitedRole: MerchantMemberRole,
) {
  if (!existingRole) return invitedRole;

  return merchantRoleRank[existingRole] >= merchantRoleRank[invitedRole]
    ? existingRole
    : invitedRole;
}

const merchantRoleRank: Record<MerchantMemberRole, number> = {
  admin: 3,
  manager: 2,
  owner: 4,
  staff: 1,
};

function emptyMerchantDashboard(
  session: TelegramSession | null,
): MerchantDashboard {
  return {
    authenticated: Boolean(session),
    bookings: [],
    invitations: [],
    salons: [],
    services: [],
    session,
    staff: [],
    workingHours: [],
  };
}

function canManageBookings(role: MerchantMemberRole) {
  return role === "owner" || role === "admin" || role === "manager";
}

function normalizeBooleanish(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return value;

  const normalized = value.trim().toLowerCase();
  if (["1", "on", "true", "yes"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;

  return value;
}

function emptyStringToUndefined(value: unknown) {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

function normalizeSpecialties(value: string | string[] | undefined) {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,\n]/)
      : [];
  const seen = new Set<string>();
  const specialties: string[] = [];

  for (const item of rawValues) {
    const specialty = item.trim();
    const key = specialty.toLowerCase();
    if (!specialty || seen.has(key)) continue;
    seen.add(key);
    specialties.push(specialty);
  }

  return specialties;
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
