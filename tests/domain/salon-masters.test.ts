import { describe, expect, it } from "vitest";
import { getSalonDisplayMasters } from "@/lib/domain/salon-masters";
import type { SalonDetail } from "@/lib/domain/types";

const salon: SalonDetail = {
  id: "salon-1",
  name: "Kasito",
  slug: "kasito",
  city: "Bishkek",
  district: null,
  address: "пр. Чуй 120, Бишкек",
  rating: 0,
  reviewCount: 0,
  priceTier: 2,
  coverImageUrl: null,
  latitude: 42.8766,
  longitude: 74.6057,
  distanceMeters: null,
  serviceTags: ["Маникюр"],
  description: null,
  phone: null,
  instagramUrl: null,
  services: [],
  staff: [
    {
      id: "staff-real-1",
      salonId: "salon-1",
      fullName: "Гульзат",
      roleTitle: "Колорист",
      bio: null,
      avatarUrl: null,
      specialties: ["Волосы"],
      rating: 0,
      reviewCount: 0,
    },
  ],
};

describe("getSalonDisplayMasters", () => {
  it("uses real salon staff without adding demo masters", () => {
    const result = getSalonDisplayMasters(salon);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "staff-real-1",
      fullName: "Гульзат",
      roleTitle: "Колорист",
      isReal: true,
    });
  });

  it("falls back to deterministic demo masters only when staff is empty", () => {
    const result = getSalonDisplayMasters({ ...salon, staff: [] });

    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.every((master) => master.isReal === false)).toBe(true);
  });
});
