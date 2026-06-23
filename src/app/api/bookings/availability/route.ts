import { NextResponse } from "next/server";
import { z } from "zod";
import { getBookingAvailability } from "@/lib/domain/bookings";

const availabilityRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  salonId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().nullable().optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const input = availabilityRequestSchema.safeParse({
    date: url.searchParams.get("date"),
    salonId: url.searchParams.get("salonId"),
    serviceId: url.searchParams.get("serviceId"),
    staffId: url.searchParams.get("staffId") || null,
  });

  if (!input.success) {
    return NextResponse.json(
      { error: "Availability request is invalid" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await getBookingAvailability(input.data));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Booking availability is unavailable",
      },
      { status: 400 },
    );
  }
}
