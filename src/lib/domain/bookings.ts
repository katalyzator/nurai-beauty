import { z } from "zod";
import {
  buildBishkekSlotIso,
  defaultBookingTimes,
} from "@/lib/domain/booking-calendar";
import type { Booking, BookingInput } from "@/lib/domain/types";
import { normalizeKgPhone } from "@/lib/domain/phone";
import { createAdminClient } from "@/lib/supabase/admin";

const kgPhoneSchema = z.string().transform((value, context) => {
  const normalized = normalizeKgPhone(value);
  if (!normalized) {
    context.addIssue({
      code: "custom",
      message: "Телефон должен быть в формате +996 XXX XXX XXX",
    });
    return z.NEVER;
  }

  return normalized;
});

export const bookingInputSchema = z.object({
  salonId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().nullable(),
  clientName: z.string().min(2).max(120),
  clientPhone: kgPhoneSchema,
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

export type ExistingBookingRange = {
  staffId: string | null;
  startAt: string;
  endAt: string;
};

export function isBookingRangeOverlapping({
  existingEndAt,
  existingStartAt,
  nextEndAt,
  nextStartAt,
}: {
  existingStartAt: string;
  existingEndAt: string;
  nextStartAt: string;
  nextEndAt: string;
}) {
  return (
    new Date(existingStartAt).getTime() < new Date(nextEndAt).getTime() &&
    new Date(nextStartAt).getTime() < new Date(existingEndAt).getTime()
  );
}

export function findFirstAvailableStaffId({
  candidateStaffIds,
  existingBookings,
  nextEndAt,
  nextStartAt,
}: {
  candidateStaffIds: string[];
  existingBookings: ExistingBookingRange[];
  nextStartAt: string;
  nextEndAt: string;
}) {
  return (
    candidateStaffIds.find(
      (staffId) =>
        !existingBookings.some(
          (booking) =>
            booking.staffId === staffId &&
            isBookingRangeOverlapping({
              existingStartAt: booking.startAt,
              existingEndAt: booking.endAt,
              nextStartAt,
              nextEndAt,
            }),
        ),
    ) ?? null
  );
}

export function getUnavailableBookingTimes({
  candidateStaffIds,
  date,
  durationMinutes,
  existingBookings,
  times,
}: {
  candidateStaffIds: string[];
  date: string;
  durationMinutes: number;
  existingBookings: ExistingBookingRange[];
  times: string[];
}) {
  return times.filter((time) => {
    const nextStartAt = buildBishkekSlotIso(date, time);
    const nextEndAt = calculateEndAt(nextStartAt, durationMinutes);

    return !findFirstAvailableStaffId({
      candidateStaffIds,
      existingBookings,
      nextStartAt,
      nextEndAt,
    });
  });
}

export async function getBookingAvailability(params: {
  salonId: string;
  serviceId: string;
  staffId?: string | null;
  date: string;
  times?: string[];
}) {
  const supabase = createAdminClient();
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes,salon_id,is_active")
    .eq("id", params.serviceId)
    .single();

  if (serviceError) throw new Error(serviceError.message);
  if (!service.is_active || service.salon_id !== params.salonId) {
    throw new Error("Service is not available for this salon");
  }

  const candidateStaffIds = params.staffId
    ? [params.staffId]
    : await getQualifiedStaffIds(supabase, params.salonId, params.serviceId);
  if (candidateStaffIds.length === 0) {
    return {
      availableTimes: [],
      unavailableTimes: params.times ?? defaultBookingTimes,
    };
  }

  const existingBookings = await getExistingBookingsForDate({
    date: params.date,
    salonId: params.salonId,
    staffIds: candidateStaffIds,
    supabase,
  });
  const times = params.times ?? defaultBookingTimes;
  const unavailableTimes = getUnavailableBookingTimes({
    candidateStaffIds,
    date: params.date,
    durationMinutes: service.duration_minutes,
    existingBookings,
    times,
  });

  return {
    availableTimes: times.filter((time) => !unavailableTimes.includes(time)),
    unavailableTimes,
  };
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

  const qualifiedStaffIds = await getQualifiedStaffIds(
    supabase,
    parsed.salonId,
    parsed.serviceId,
  );

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
    if (
      qualifiedStaffIds.length > 0 &&
      !qualifiedStaffIds.includes(parsed.staffId)
    ) {
      throw new Error("Staff member does not provide this service");
    }
  } else if (qualifiedStaffIds.length === 0) {
    throw new Error("No active staff members are available for this service");
  }

  const endAt = calculateEndAt(parsed.startAt, service.duration_minutes);
  const candidateStaffIds = parsed.staffId ? [parsed.staffId] : qualifiedStaffIds;
  const existingBookings = await getExistingBookingsForRange({
    nextEndAt: endAt,
    nextStartAt: parsed.startAt,
    salonId: parsed.salonId,
    staffIds: candidateStaffIds,
    supabase,
  });
  const assignedStaffId = findFirstAvailableStaffId({
    candidateStaffIds,
    existingBookings,
    nextEndAt: endAt,
    nextStartAt: parsed.startAt,
  });
  if (!assignedStaffId) {
    throw new Error(
      parsed.staffId
        ? "Selected time is no longer available for this master"
        : "No masters are available at this time",
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      salon_id: parsed.salonId,
      service_id: parsed.serviceId,
      staff_id: assignedStaffId,
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

async function getQualifiedStaffIds(
  supabase: ReturnType<typeof createAdminClient>,
  salonId: string,
  serviceId: string,
) {
  const { data: linkedRows, error: linkedError } = await supabase
    .from("staff_services")
    .select("staff_id")
    .eq("service_id", serviceId);
  if (linkedError) throw new Error(linkedError.message);

  const linkedStaffIds = (linkedRows ?? []).map((row) => row.staff_id as string);
  let staffQuery = supabase
    .from("salon_staff")
    .select("id")
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("full_name", { ascending: true });

  if (linkedStaffIds.length > 0) {
    staffQuery = staffQuery.in("id", linkedStaffIds);
  }

  const { data: staffRows, error: staffError } = await staffQuery;
  if (staffError) throw new Error(staffError.message);

  return (staffRows ?? []).map((row) => row.id as string);
}

async function getExistingBookingsForDate({
  date,
  salonId,
  staffIds,
  supabase,
}: {
  supabase: ReturnType<typeof createAdminClient>;
  salonId: string;
  staffIds: string[];
  date: string;
}) {
  const dayStartAt = new Date(`${date}T00:00:00+06:00`);
  const dayEndAt = new Date(dayStartAt);
  dayEndAt.setUTCDate(dayEndAt.getUTCDate() + 1);

  return getExistingBookingsForRange({
    nextStartAt: dayStartAt.toISOString(),
    nextEndAt: dayEndAt.toISOString(),
    salonId,
    staffIds,
    supabase,
  });
}

async function getExistingBookingsForRange({
  nextEndAt,
  nextStartAt,
  salonId,
  staffIds,
  supabase,
}: {
  supabase: ReturnType<typeof createAdminClient>;
  salonId: string;
  staffIds: string[];
  nextStartAt: string;
  nextEndAt: string;
}) {
  if (staffIds.length === 0) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("staff_id,start_at,end_at")
    .eq("salon_id", salonId)
    .in("staff_id", staffIds)
    .in("status", ["new", "confirmed"])
    .lt("start_at", nextEndAt)
    .gt("end_at", nextStartAt);

  if (error) throw new Error(error.message);

  return (data ?? []).map((booking) => ({
    staffId: booking.staff_id as string | null,
    startAt: booking.start_at as string,
    endAt: booking.end_at as string,
  }));
}
