import { describe, expect, it } from "vitest";
import { formatBishkekAddress } from "@/lib/domain/address";

describe("formatBishkekAddress", () => {
  it("normalizes mixed OSM street languages into Russian display text", () => {
    expect(formatBishkekAddress("Erkindik boulevard, 35")).toBe(
      "бульвар Эркиндик 35, Бишкек",
    );
    expect(formatBishkekAddress("Михаил Фрунзе көчөсү, 364/3, Бишкек")).toBe(
      "улица Михаила Фрунзе 364/3, Бишкек",
    );
    expect(formatBishkekAddress("Gorky Street, 27/1, этаж 10, Бишкек")).toBe(
      "улица Горького 27/1, этаж 10, Бишкек",
    );
  });

  it("cleans duplicate city wording without changing already Russian addresses", () => {
    expect(formatBishkekAddress("бульвар Эркиндик, город Бишкек")).toBe(
      "бульвар Эркиндик, Бишкек",
    );
    expect(formatBishkekAddress("Киевская улица, город Бишкек")).toBe(
      "улица Киевская, Бишкек",
    );
  });
});
