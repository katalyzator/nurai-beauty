import type { SalonSummary } from "@/lib/domain/types";
import { calculateDistanceMeters } from "@/lib/geo/distance";

export const BISHKEK_CENTER = {
  latitude: 42.8746,
  longitude: 74.6122,
};

export type CatalogOrigin = {
  latitude: number;
  longitude: number;
};

export type SalonCatalogFilters = {
  query?: string;
  category?: string;
  origin?: CatalogOrigin | null;
};

const categoryAliases: Record<string, string[]> = {
  маникюр: ["маникюр", "ногти", "гель лак", "педикюр", "nail"],
  волосы: ["волосы", "стрижка", "окрашивание", "укладка", "hair"],
  брови: ["брови", "ресницы", "ламинирование", "lash", "brow"],
  косметология: ["косметология", "уход", "чистка", "пилинг", "массаж"],
  массаж: ["массаж", "spa", "спа"],
};

export function filterSalonCatalog(
  salons: SalonSummary[],
  filters: SalonCatalogFilters,
): SalonSummary[] {
  const query = normalizeCatalogText(filters.query ?? "");
  const category = normalizeCatalogText(filters.category ?? "Все");
  const categoryTerms =
    !category || category === "все" ? [] : categoryAliases[category] ?? [category];

  return salons
    .map((salon) =>
      filters.origin
        ? {
            ...salon,
            distanceMeters: calculateDistanceMeters(filters.origin, {
              latitude: salon.latitude,
              longitude: salon.longitude,
            }),
          }
        : salon,
    )
    .filter((salon) => {
      const searchable = getSearchableText(salon);
      const matchesQuery = !query || searchable.includes(query);
      const matchesCategory =
        categoryTerms.length === 0 ||
        categoryTerms.some((term) => searchable.includes(term));

      return matchesQuery && matchesCategory;
    })
    .sort((left, right) => {
      if (!filters.origin) return 0;

      return (left.distanceMeters ?? Infinity) - (right.distanceMeters ?? Infinity);
    });
}

export function isWithinBishkekServiceArea(origin: CatalogOrigin) {
  return calculateDistanceMeters(BISHKEK_CENTER, origin) <= 35_000;
}

export function formatSalonCount(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} салон`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} салона`;
  }

  return `${count} салонов`;
}

export function normalizeCatalogText(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/[^a-zа-я0-9+]+/g, " ")
    .trim();
}

function getSearchableText(salon: SalonSummary) {
  return normalizeCatalogText(
    [
      salon.name,
      salon.slug,
      salon.city,
      salon.district,
      salon.address,
      ...salon.serviceTags,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
