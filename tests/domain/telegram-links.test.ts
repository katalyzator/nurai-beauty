import { describe, expect, it } from "vitest";
import { buildTelegramBotHref } from "@/lib/domain/telegram-links";

describe("buildTelegramBotHref", () => {
  it("opens the bot chat with a start payload instead of startapp", () => {
    expect(buildTelegramBotHref("@NurAIBeautyKGBot")).toBe(
      "https://t.me/NurAIBeautyKGBot?start=booking",
    );
  });

  it("returns null without a bot username", () => {
    expect(buildTelegramBotHref(undefined)).toBeNull();
  });
});
