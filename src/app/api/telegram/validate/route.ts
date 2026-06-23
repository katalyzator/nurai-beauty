import { NextResponse } from "next/server";
import { validateTelegramInitData } from "@/lib/domain/telegram";

export async function POST(request: Request) {
  const { initData } = await request.json();
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken || typeof initData !== "string") {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  return NextResponse.json({
    valid: validateTelegramInitData(initData, botToken),
  });
}
