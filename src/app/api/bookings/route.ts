import { NextResponse } from "next/server";
import { createBooking } from "@/lib/domain/bookings";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const booking = await createBooking(input);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Booking failed" },
      { status: 400 },
    );
  }
}
