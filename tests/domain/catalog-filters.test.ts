import { describe, expect, it } from "vitest";
import {
  filterSalonCatalog,
  formatSalonCount,
  isWithinBishkekServiceArea,
} from "@/lib/domain/catalog-filters";
import type { SalonSummary } from "@/lib/domain/types";

const salons: SalonSummary[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Erkindik Nails",
    slug: "erkindik-nails",
    city: "Bishkek",
    district: "Эркиндик",
    address: "бульвар Эркиндик 45",
    rating: 4.8,
    reviewCount: 31,
    priceTier: 2,
    coverImageUrl: null,
    latitude: 42.8731,
    longitude: 74.6122,
    distanceMeters: 1200,
    serviceTags: ["Ногти", "Маникюр с гель-лаком"],
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Tumar Brow Bar",
    slug: "tumar-brow-bar",
    city: "Bishkek",
    district: "Тунгуч",
    address: "ул. Анкара 18",
    rating: 4.7,
    reviewCount: 18,
    priceTier: 2,
    coverImageUrl: null,
    latitude: 42.8507,
    longitude: 74.6682,
    distanceMeters: 5400,
    serviceTags: ["Брови", "Ламинирование бровей"],
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Vefa Hair Room",
    slug: "vefa-hair-room",
    city: "Bishkek",
    district: "Вефа",
    address: "ул. Горького 27/1",
    rating: 4.9,
    reviewCount: 44,
    priceTier: 3,
    coverImageUrl: null,
    latitude: 42.8568,
    longitude: 74.6252,
    distanceMeters: 2600,
    serviceTags: ["Волосы", "Окрашивание"],
  },
];

describe("catalog filters", () => {
  it("filters salons by search text across names, addresses, and services", () => {
    expect(filterSalonCatalog(salons, { query: "маникюр" }).map((salon) => salon.slug)).toEqual([
      "erkindik-nails",
    ]);
    expect(filterSalonCatalog(salons, { query: "анкара" }).map((salon) => salon.slug)).toEqual([
      "tumar-brow-bar",
    ]);
  });

  it("filters category chips using service synonyms", () => {
    expect(
      filterSalonCatalog(salons, { query: "", category: "Маникюр" }).map(
        (salon) => salon.slug,
      ),
    ).toEqual(["erkindik-nails"]);
    expect(
      filterSalonCatalog(salons, { query: "", category: "Волосы" }).map(
        (salon) => salon.slug,
      ),
    ).toEqual(["vefa-hair-room"]);
  });

  it("recalculates and sorts distances from the chosen origin", () => {
    const result = filterSalonCatalog(salons, {
      query: "",
      category: "Все",
      origin: { latitude: 42.8508, longitude: 74.668 },
    });

    expect(result[0].slug).toBe("tumar-brow-bar");
    expect(result[0].distanceMeters).toBeLessThan(100);
  });

  it("keeps outside geolocation from breaking Bishkek map context", () => {
    expect(isWithinBishkekServiceArea({ latitude: 42.8746, longitude: 74.6122 })).toBe(true);
    expect(isWithinBishkekServiceArea({ latitude: 40.7128, longitude: -74.006 })).toBe(false);
  });

  it("formats Russian salon counts", () => {
    expect(formatSalonCount(1)).toBe("1 салон");
    expect(formatSalonCount(3)).toBe("3 салона");
    expect(formatSalonCount(20)).toBe("20 салонов");
  });
});
