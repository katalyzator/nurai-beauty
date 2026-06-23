import { describe, expect, it } from "vitest";
import { mapNearbySalonRow } from "@/lib/domain/salons";

describe("mapNearbySalonRow", () => {
  it("maps Supabase nearby salon rows into UI summaries", () => {
    const result = mapNearbySalonRow({
      id: "00000000-0000-0000-0000-000000000001",
      name: "Ala-Too Beauty Studio",
      slug: "ala-too-beauty-studio",
      city: "Bishkek",
      district: "Center",
      address: "Chuy Ave 132",
      rating: 4.8,
      review_count: 24,
      price_tier: 3,
      cover_image_path: null,
      service_tags: ["Волосы", "Женская стрижка"],
      latitude: 42.8766,
      longitude: 74.6057,
      distance_meters: 1234.5,
    });

    expect(result.reviewCount).toBe(24);
    expect(result.distanceMeters).toBe(1234.5);
    expect(result.longitude).toBe(74.6057);
    expect(result.serviceTags).toEqual(["Волосы", "Женская стрижка"]);
  });
});
