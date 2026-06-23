import { NextResponse } from "next/server";
import { getTelegramSession } from "@/lib/auth/telegram-session";
import { createMerchantStaff } from "@/lib/domain/merchant";

export async function POST(request: Request) {
  const session = await getTelegramSession();
  if (!session) {
    return NextResponse.json(
      { error: "Telegram authorization is required" },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload.salonId !== "string") {
    return NextResponse.json(
      { error: "Staff request is invalid" },
      { status: 400 },
    );
  }

  const { salonId, ...input } = payload;

  try {
    const staffMember = await createMerchantStaff({
      input,
      salonId,
      telegramUserId: session.telegramUserId,
    });

    return NextResponse.json({ staffMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Staff create failed" },
      { status: 400 },
    );
  }
}
