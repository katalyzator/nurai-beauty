import { cookies } from "next/headers";
import {
  type TelegramSession,
  signTelegramSession,
  verifyTelegramSession,
} from "@/lib/domain/telegram";

export const TELEGRAM_SESSION_COOKIE = "nurai_telegram_session";
export const TELEGRAM_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export function getTelegramSessionSecret() {
  return process.env.TELEGRAM_SESSION_SECRET ?? process.env.TELEGRAM_BOT_TOKEN;
}

export async function getTelegramSession(): Promise<TelegramSession | null> {
  const secret = getTelegramSessionSecret();
  if (!secret) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(TELEGRAM_SESSION_COOKIE)?.value;

  return verifyTelegramSession(token, secret);
}

export function createTelegramSessionToken(user: {
  telegramUserId: number;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
}) {
  const secret = getTelegramSessionSecret();
  if (!secret) {
    throw new Error("Missing TELEGRAM_SESSION_SECRET or TELEGRAM_BOT_TOKEN");
  }

  return signTelegramSession(user, secret, {
    ttlSeconds: TELEGRAM_SESSION_TTL_SECONDS,
  });
}
