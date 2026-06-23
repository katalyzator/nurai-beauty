import { describe, expect, it } from "vitest";
import {
  buildBishkekSlotIso,
  createBookingDays,
} from "@/lib/domain/booking-calendar";

describe("booking calendar", () => {
  it("creates a compact run of booking days from an anchor date", () => {
    const days = createBookingDays(new Date("2026-06-23T06:00:00.000Z"), 4);

    expect(days.map((day) => day.isoDate)).toEqual([
      "2026-06-23",
      "2026-06-24",
      "2026-06-25",
      "2026-06-26",
    ]);
    expect(days[0]).toMatchObject({
      dayName: "Вт",
      dayNumber: "23",
      monthName: "июн",
    });
  });

  it("converts a Bishkek date and slot time to a stable UTC ISO timestamp", () => {
    expect(buildBishkekSlotIso("2026-06-23", "12:30")).toBe(
      "2026-06-23T06:30:00.000Z",
    );
  });
});
