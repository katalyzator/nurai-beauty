import type { SalonSummary } from "@/lib/domain/types";

export type SalonVisual = {
  imageUrl: string;
  imageAlt: string;
  specialty: string;
  signal: string;
  nextSlot: string;
  responseTime: string;
  tags: string[];
};

const fallbackVisual: SalonVisual = {
  imageUrl:
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=82",
  imageAlt: "Beauty salon interior with styling chairs",
  specialty: "Студия красоты",
  signal: "Проверенный салон",
  nextSlot: "Сегодня 17:30",
  responseTime: "Обычно подтверждает за 15 мин",
  tags: ["Волосы", "Ногти", "Брови"],
};

const salonVisuals: Record<string, SalonVisual> = {
  "ala-too-beauty-studio": {
    imageUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Hair salon with warm lights and styling mirrors",
    specialty: "Волосы, брови, укладка",
    signal: "Центр рядом",
    nextSlot: "Сегодня 18:00",
    responseTime: "Обычно подтверждает за 12 мин",
    tags: ["Стрижка", "Окрашивание", "Брови"],
  },
  "erkindik-nails": {
    imageUrl:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Nail master applying polish in a manicure studio",
    specialty: "Экспресс-маникюр",
    signal: "Ближайшее окно",
    nextSlot: "Сегодня 16:20",
    responseTime: "Обычно подтверждает за 8 мин",
    tags: ["Гель", "Дизайн", "Экспресс"],
  },
  "asanbay-glow": {
    imageUrl:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Cosmetology treatment room prepared for facial care",
    specialty: "Уход, косметология",
    signal: "Часто возвращаются",
    nextSlot: "Завтра 11:00",
    responseTime: "Обычно подтверждает за 18 мин",
    tags: ["Чистка", "Воск", "Уход"],
  },
};

export function getSalonVisual(
  salon: Pick<SalonSummary, "slug" | "coverImageUrl">,
): SalonVisual {
  const visual = salonVisuals[salon.slug] ?? fallbackVisual;

  return {
    ...visual,
    imageUrl: salon.coverImageUrl ?? visual.imageUrl,
  };
}

export function formatReviewCount(count: number): string {
  return `${count} отзывов`;
}

export function formatPriceTier(tier: number): string {
  if (tier <= 1) return "Базовый";
  if (tier === 2) return "Комфорт";
  if (tier === 3) return "Премиум";
  return "Luxe";
}
