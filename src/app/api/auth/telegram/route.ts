import { NextResponse } from "next/server";
import {
  TELEGRAM_SESSION_COOKIE,
  TELEGRAM_SESSION_TTL_SECONDS,
  createTelegramSessionToken,
  getTelegramSession,
} from "@/lib/auth/telegram-session";
import {
  parseTelegramUser,
  validateTelegramInitData,
} from "@/lib/domain/telegram";
import { createAdminClient } from "@/lib/supabase/admin";

const TELEGRAM_INIT_DATA_MAX_AGE_SECONDS = 60 * 60 * 24;

export async function GET() {
  const session = await getTelegramSession();

  return NextResponse.json({
    authenticated: Boolean(session),
    user: session
      ? {
          firstName: session.firstName,
          lastName: session.lastName,
          photoUrl: session.photoUrl,
          telegramUserId: session.telegramUserId,
          username: session.username,
        }
      : null,
  });
}

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json(
      { error: "Telegram bot token is not configured" },
      { status: 500 },
    );
  }

  const { initData } = await request.json();
  if (
    typeof initData !== "string" ||
    !validateTelegramInitData(initData, botToken, {
      maxAgeSeconds: TELEGRAM_INIT_DATA_MAX_AGE_SECONDS,
    })
  ) {
    return NextResponse.json(
      { error: "Invalid Telegram launch data" },
      { status: 401 },
    );
  }

  const telegramUser = parseTelegramUser(initData);
  if (!telegramUser) {
    return NextResponse.json(
      { error: "Telegram user is missing from launch data" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("telegram_users").upsert(
    {
      first_name: telegramUser.firstName,
      language_code: telegramUser.languageCode,
      last_name: telegramUser.lastName,
      photo_url: telegramUser.photoUrl,
      telegram_user_id: telegramUser.id,
      updated_at: new Date().toISOString(),
      username: telegramUser.username,
    },
    { onConflict: "telegram_user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const token = createTelegramSessionToken({
    firstName: telegramUser.firstName,
    lastName: telegramUser.lastName,
    photoUrl: telegramUser.photoUrl,
    telegramUserId: telegramUser.id,
    username: telegramUser.username,
  });
  const response = NextResponse.json({
    authenticated: true,
    user: telegramUser,
  });

  response.cookies.set(TELEGRAM_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: TELEGRAM_SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.delete(TELEGRAM_SESSION_COOKIE);
  return response;
}
