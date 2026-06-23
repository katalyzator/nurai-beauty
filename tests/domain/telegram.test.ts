import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  parseTelegramInitData,
  parseTelegramUser,
  signTelegramSession,
  validateTelegramInitData,
  verifyTelegramSession,
} from "@/lib/domain/telegram";

function signInitData(
  fields: Record<string, string>,
  botToken = "123456:test-token",
) {
  const dataCheckString = Object.entries(fields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return new URLSearchParams({ ...fields, hash }).toString();
}

describe("parseTelegramInitData", () => {
  it("parses query-string launch data", () => {
    const params = parseTelegramInitData(
      "query_id=abc&user=%7B%22id%22%3A123%7D&hash=test",
    );

    expect(params.get("query_id")).toBe("abc");
    expect(params.get("hash")).toBe("test");
  });

  it("validates signed init data and rejects stale auth dates", () => {
    const botToken = "123456:test-token";
    const fresh = signInitData(
      {
        auth_date: "1782200000",
        query_id: "abc",
        user: JSON.stringify({ id: 42, first_name: "Aigerim" }),
      },
      botToken,
    );
    const stale = signInitData(
      {
        auth_date: "1782190000",
        query_id: "abc",
        user: JSON.stringify({ id: 42, first_name: "Aigerim" }),
      },
      botToken,
    );

    expect(
      validateTelegramInitData(fresh, botToken, {
        maxAgeSeconds: 3600,
        nowSeconds: 1782200300,
      }),
    ).toBe(true);
    expect(
      validateTelegramInitData(stale, botToken, {
        maxAgeSeconds: 3600,
        nowSeconds: 1782200300,
      }),
    ).toBe(false);
  });

  it("parses the Telegram user from validated init data", () => {
    const initData = signInitData({
      auth_date: "1782200000",
      user: JSON.stringify({
        id: 42,
        first_name: "Aigerim",
        last_name: "Tokoeva",
        username: "aigerim",
        language_code: "ru",
      }),
    });

    expect(parseTelegramUser(initData)).toEqual({
      id: 42,
      firstName: "Aigerim",
      lastName: "Tokoeva",
      username: "aigerim",
      languageCode: "ru",
      photoUrl: null,
    });
  });

  it("signs Telegram sessions and rejects tampered or expired cookies", () => {
    const token = signTelegramSession(
      {
        telegramUserId: 42,
        firstName: "Aigerim",
        username: "aigerim",
      },
      "session-secret",
      {
        nowSeconds: 1782200000,
        ttlSeconds: 60,
      },
    );

    expect(
      verifyTelegramSession(token, "session-secret", {
        nowSeconds: 1782200030,
      }),
    ).toMatchObject({
      telegramUserId: 42,
      firstName: "Aigerim",
      username: "aigerim",
    });
    expect(
      verifyTelegramSession(`${token}tamper`, "session-secret", {
        nowSeconds: 1782200030,
      }),
    ).toBeNull();
    expect(
      verifyTelegramSession(token, "session-secret", {
        nowSeconds: 1782200100,
      }),
    ).toBeNull();
  });
});
