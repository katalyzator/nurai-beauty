import crypto from "node:crypto";
import { z } from "zod";

const telegramUserSchema = z.object({
  id: z.number(),
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
  photo_url: z.string().url().optional(),
});

const telegramSessionSchema = z.object({
  exp: z.number(),
  firstName: z.string().min(1),
  lastName: z.string().nullable(),
  photoUrl: z.string().nullable(),
  telegramUserId: z.number(),
  username: z.string().nullable(),
});

export type TelegramUser = {
  id: number;
  firstName: string;
  lastName: string | null;
  username: string | null;
  languageCode: string | null;
  photoUrl: string | null;
};

export type TelegramSession = {
  telegramUserId: number;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  exp: number;
};

export function parseTelegramInitData(initData: string): URLSearchParams {
  return new URLSearchParams(initData);
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  options: {
    maxAgeSeconds?: number;
    nowSeconds?: number;
  } = {},
): boolean {
  const params = parseTelegramInitData(initData);
  const hash = params.get("hash");
  if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) return false;

  const authDate = Number(params.get("auth_date"));
  if (
    options.maxAgeSeconds &&
    (!Number.isFinite(authDate) ||
      (options.nowSeconds ?? Math.floor(Date.now() / 1000)) - authDate >
        options.maxAgeSeconds)
  ) {
    return false;
  }

  params.delete("hash");
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash.length !== hash.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(calculatedHash, "hex"),
    Buffer.from(hash, "hex"),
  );
}

export function parseTelegramUser(initData: string): TelegramUser | null {
  const rawUser = parseTelegramInitData(initData).get("user");
  if (!rawUser) return null;

  const json = safeJsonParse(rawUser);
  if (!json) return null;

  const parsed = telegramUserSchema.safeParse(json);
  if (!parsed.success) return null;

  return {
    id: parsed.data.id,
    firstName: parsed.data.first_name,
    lastName: parsed.data.last_name ?? null,
    username: parsed.data.username ?? null,
    languageCode: parsed.data.language_code ?? null,
    photoUrl: parsed.data.photo_url ?? null,
  };
}

export function signTelegramSession(
  user: {
    telegramUserId: number;
    firstName: string;
    lastName?: string | null;
    username?: string | null;
    photoUrl?: string | null;
  },
  secret: string,
  options: {
    nowSeconds?: number;
    ttlSeconds?: number;
  } = {},
) {
  const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const payload: TelegramSession = {
    exp: nowSeconds + (options.ttlSeconds ?? 60 * 60 * 24 * 30),
    firstName: user.firstName,
    lastName: user.lastName ?? null,
    photoUrl: user.photoUrl ?? null,
    telegramUserId: user.telegramUserId,
    username: user.username ?? null,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = signValue(body, secret);

  return `${body}.${signature}`;
}

export function verifyTelegramSession(
  token: string | undefined,
  secret: string,
  options: { nowSeconds?: number } = {},
): TelegramSession | null {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expectedSignature = signValue(body, secret);
  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  ) {
    return null;
  }

  const json = safeJsonParse(Buffer.from(body, "base64url").toString("utf8"));
  if (!json) return null;

  const parsed = telegramSessionSchema.safeParse(json);
  if (!parsed.success) return null;

  const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (parsed.data.exp <= nowSeconds) return null;

  return parsed.data;
}

function signValue(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
