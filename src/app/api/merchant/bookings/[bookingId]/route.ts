import { NextResponse } from "next/server";
import { z } from "zod";
import { getTelegramSession } from "@/lib/auth/telegram-session";
import { updateMerchantBookingStatus } from "@/lib/domain/merchant";

const bookingStatusRequestSchema = z.object({
  status: z.enum(["new", "confirmed", "completed", "cancelled", "no_show"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const session = await getTelegramSession();
  if (!session) {
    return NextResponse.json(
      { error: "Telegram authorization is required" },
      { status: 401 },
    );
  }

  const input = bookingStatusRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!input.success) {
    return NextResponse.json(
      { error: "Booking status request is invalid" },
      { status: 400 },
    );
  }

  try {
    const { bookingId } = await params;
    const booking = await updateMerchantBookingStatus({
      bookingId,
      status: input.data.status,
      telegramUserId: session.telegramUserId,
    });

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Booking update failed",
      },
      { status: 400 },
    );
  }
}
