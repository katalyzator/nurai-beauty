import { describe, expect, it } from "vitest";
import type { SalonSummary } from "@/lib/domain/types";

describe("domain types", () => {
  it("supports a salon summary with coordinates and distance", () => {
    const salon: SalonSummary = {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Ala-Too Beauty Studio",
      slug: "ala-too-beauty-studio",
      city: "Bishkek",
      district: "Center",
      address: "Chuy Ave 132, Bishkek",
      rating: 4.8,
      reviewCount: 24,
      priceTier: 3,
      coverImageUrl: null,
      latitude: 42.8766,
      longitude: 74.6057,
      distanceMeters: 1200,
    };

    expect(salon.distanceMeters).toBe(1200);
    expect(salon.latitude).toBe(42.8766);
  });
});
