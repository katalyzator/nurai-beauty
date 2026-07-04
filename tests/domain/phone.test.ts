import { describe, expect, it } from "vitest";
import { formatKgPhoneInput, normalizeKgPhone } from "@/lib/domain/phone";

describe("normalizeKgPhone", () => {
  it("normalizes Kyrgyz phone numbers to +996 XXX XXX XXX", () => {
    expect(normalizeKgPhone("+996700000000")).toBe("+996 700 000 000");
    expect(normalizeKgPhone("996 700 000 000")).toBe("+996 700 000 000");
    expect(normalizeKgPhone("0700 000 000")).toBe("+996 700 000 000");
    expect(normalizeKgPhone("700 000 000")).toBe("+996 700 000 000");
  });

  it("rejects numbers that cannot be a Kyrgyz 9 digit national number", () => {
    expect(normalizeKgPhone("+7 700 000 000")).toBeNull();
    expect(normalizeKgPhone("700")).toBeNull();
    expect(normalizeKgPhone("+996 700 000 000 1")).toBeNull();
    expect(normalizeKgPhone("+996 996 700 000")).toBeNull();
  });
});

describe("formatKgPhoneInput", () => {
  it("keeps a partial input in the +996 mask", () => {
    expect(formatKgPhoneInput("7")).toBe("+996 7");
    expect(formatKgPhoneInput("7000")).toBe("+996 700 0");
    expect(formatKgPhoneInput("+996700000000")).toBe("+996 700 000 000");
  });

  it("does not duplicate the +996 prefix during character-by-character input", () => {
    let value = "";
    for (const char of "996700000000") {
      value = formatKgPhoneInput(value + char);
    }

    expect(value).toBe("+996 700 000 000");
  });
});
