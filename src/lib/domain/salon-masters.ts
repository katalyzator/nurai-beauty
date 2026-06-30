// Demo masters for the salon detail page. The production seed only ships a
// generic "Любой свободный мастер" placeholder, so until merchants add real
// staff we render 3-4 deterministic demo specialists per salon for a richer UI.
// These are display-only: booking still goes through "any free master".

export type DisplayMaster = {
  id: string;
  fullName: string;
  roleTitle: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  accent: string; // css gradient for the avatar
};

const NAMES = [
  "Айсулуу",
  "Динара",
  "Назгуль",
  "Аделина",
  "Чолпон",
  "Бегимай",
  "Алина",
  "Жанара",
  "Камила",
  "Эльвира",
  "Сабина",
  "Гульзат",
  "Меерим",
  "Айпери",
];

const ROLES = [
  "Топ-стилист",
  "Нейл-мастер",
  "Бровист",
  "Колорист",
  "Косметолог",
  "Lash-мастер",
  "Визажист",
  "Парикмахер",
];

const SPECIALTY_SETS = [
  ["Окрашивание", "Стрижка", "Уход"],
  ["Маникюр", "Дизайн", "Гель"],
  ["Брови", "Ламинирование"],
  ["Чистка лица", "Пилинг", "Уход"],
  ["Балаяж", "Тонирование"],
  ["Наращивание ресниц", "Ламинирование"],
  ["Вечерний макияж", "Дневной макияж"],
  ["Укладка", "Кератин"],
];

const BIOS = [
  "Опыт более 6 лет, работает на премиум-косметике.",
  "Любит чистые линии и аккуратный результат.",
  "Постоянные клиенты записываются за неделю.",
  "Авторские техники и индивидуальный подбор.",
  "Спокойная атмосфера и внимание к деталям.",
  "Делает акцент на здоровье кожи и волос.",
];

const ACCENTS = [
  "linear-gradient(145deg, #f48fb4, #a32f54)",
  "linear-gradient(145deg, #f3dcab, #b88a4a)",
  "linear-gradient(145deg, #8fded0, #239e84)",
  "linear-gradient(145deg, #c9a7e8, #6d4aa3)",
  "linear-gradient(145deg, #f6c9b9, #c8623f)",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getDisplayMasters(slug: string): DisplayMaster[] {
  const seed = hashString(slug || "nurai");
  const count = 3 + (seed % 2); // 3 or 4 masters
  const nameStart = seed % NAMES.length;
  const roleStart = (seed * 3) % ROLES.length;

  return Array.from({ length: count }, (_, i) => {
    const k = seed + i * 7;
    return {
      id: `${slug}-master-${i}`,
      fullName: NAMES[(nameStart + i) % NAMES.length],
      roleTitle: ROLES[(roleStart + i) % ROLES.length],
      bio: BIOS[k % BIOS.length],
      specialties: SPECIALTY_SETS[(k * 5 + i) % SPECIALTY_SETS.length],
      rating: (46 + ((k * 13) % 4)) / 10, // 4.6 – 4.9
      reviewCount: 40 + ((k * 17) % 180),
      accent: ACCENTS[(k + i) % ACCENTS.length],
    };
  });
}
