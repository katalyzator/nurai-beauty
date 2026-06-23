import { NextResponse } from "next/server";
import { getTelegramSession } from "@/lib/auth/telegram-session";
import { createBooking } from "@/lib/domain/bookings";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const telegramSession = await getTelegramSession();

    if (input.source === "telegram" && !telegramSession) {
      return NextResponse.json(
        { error: "Telegram authorization is required" },
        { status: 401 },
      );
    }

    const booking = await createBooking({
      ...input,
      telegramUserId: telegramSession?.telegramUserId ?? null,
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Booking failed" },
      { status: 400 },
    );
  }
}
