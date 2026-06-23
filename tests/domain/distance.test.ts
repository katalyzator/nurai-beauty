import { describe, expect, it } from "vitest";
import { formatDistance } from "@/lib/geo/distance";

describe("formatDistance", () => {
  it("formats meters below 1000", () => {
    expect(formatDistance(850)).toBe("850 m");
  });

  it("formats kilometers at one decimal place", () => {
    expect(formatDistance(1240)).toBe("1.2 km");
  });

  it("handles unknown distance", () => {
    expect(formatDistance(null)).toBe("Distance unavailable");
  });
});
