import { z } from "zod";
import type { Booking, BookingInput } from "@/lib/domain/types";
import { createServerClient } from "@/lib/supabase/server";

export const bookingInputSchema = z.object({
  salonId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().nullable(),
  clientName: z.string().min(2).max(120),
  clientPhone: z.string().min(7).max(32),
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
  const supabase = await createServerClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", parsed.serviceId)
    .single();

  if (serviceError) throw new Error(serviceError.message);

  const endAt = calculateEndAt(parsed.startAt, service.duration_minutes);
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      salon_id: parsed.salonId,
      service_id: parsed.serviceId,
      staff_id: parsed.staffId,
      client_name: parsed.clientName,
      client_phone: parsed.clientPhone,
      start_at: parsed.startAt,
      end_at: endAt,
      source: parsed.source,
      notes: parsed.notes ?? null,
    })
    .select(
      "id,salon_id,service_id,staff_id,client_name,client_phone,start_at,end_at,status,source",
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
    startAt: data.start_at,
    endAt: data.end_at,
    status: data.status,
    source: data.source,
  };
}
