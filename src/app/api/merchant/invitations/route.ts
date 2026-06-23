import { NextResponse } from "next/server";
import { getTelegramSession } from "@/lib/auth/telegram-session";
import { createMerchantInvitation } from "@/lib/domain/merchant";

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
      { error: "Invitation request is invalid" },
      { status: 400 },
    );
  }

  const { salonId, ...input } = payload;

  try {
    const invitation = await createMerchantInvitation({
      input,
      salonId,
      telegramUserId: session.telegramUserId,
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invitation create failed" },
      { status: 400 },
    );
  }
}
