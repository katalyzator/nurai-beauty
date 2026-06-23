import { describe, expect, it } from "vitest";
import { calculateEndAt } from "@/lib/domain/bookings";

describe("calculateEndAt", () => {
  it("adds service duration to booking start", () => {
    expect(calculateEndAt("2026-06-23T10:00:00.000Z", 90)).toBe(
      "2026-06-23T11:30:00.000Z",
    );
  });
});
