import { describe, expect, it } from "vitest";
import { mapNearbySalonRow, mapSalonDetailRow } from "@/lib/domain/salons";

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
    expect(result.address).toBe("проспект Чуй 132, Бишкек");
    expect(result.serviceTags).toEqual(["Волосы", "Женская стрижка"]);
  });
});

describe("mapSalonDetailRow", () => {
  it("maps a salon row with embedded services and staff", () => {
    const result = mapSalonDetailRow({
      id: "00000000-0000-0000-0000-000000000001",
      name: "InStyle",
      slug: "instyle-bishkek",
      city: "Bishkek",
      district: null,
      address: "Киевская улица, город Бишкек",
      phone: "+996 700 000 000",
      instagram_url: "https://instagram.com/instyle",
      description: "Студия красоты",
      rating: 4.7,
      review_count: 12,
      price_tier: 3,
      cover_image_path: null,
      services: [
        {
          id: "service-1",
          salon_id: "00000000-0000-0000-0000-000000000001",
          category: "Волосы",
          name: "Укладка",
          description: "Повседневная укладка",
          duration_minutes: 60,
          price_kgs: 1200,
          is_active: true,
        },
        {
          id: "service-2",
          salon_id: "00000000-0000-0000-0000-000000000001",
          category: "Волосы",
          name: "Укладка",
          description: null,
          duration_minutes: 45,
          price_kgs: 900,
          is_active: false,
        },
      ],
      salon_staff: [
        {
          id: "staff-1",
          salon_id: "00000000-0000-0000-0000-000000000001",
          full_name: "Айсулуу",
          role_title: "Стилист",
          bio: null,
          avatar_path: null,
          specialties: ["Волосы"],
          rating: 4.9,
          review_count: 8,
          is_active: true,
        },
      ],
    });

    expect(result.services).toHaveLength(1);
    expect(result.serviceTags).toEqual(["Волосы", "Укладка"]);
    expect(result.staff[0]).toMatchObject({
      fullName: "Айсулуу",
      roleTitle: "Стилист",
    });
  });
});
