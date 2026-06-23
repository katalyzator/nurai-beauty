import { describe, expect, it } from "vitest";
import { calculateDistanceMeters, formatDistance } from "@/lib/geo/distance";

describe("formatDistance", () => {
  it("formats meters below 1000", () => {
    expect(formatDistance(850)).toBe("850 м");
  });

  it("formats kilometers at one decimal place", () => {
    expect(formatDistance(1240)).toBe("1.2 км");
  });

  it("handles unknown distance", () => {
    expect(formatDistance(null)).toBe("Расстояние неизвестно");
  });

  it("calculates distance between two coordinates in meters", () => {
    expect(
      calculateDistanceMeters(
        { latitude: 42.8746, longitude: 74.6122 },
        { latitude: 42.8766, longitude: 74.6057 },
      ),
    ).toBeGreaterThan(550);
  });
});
