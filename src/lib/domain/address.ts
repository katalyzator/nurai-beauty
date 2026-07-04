const streetReplacements: Array<[RegExp, string]> = [
  [/^chuy\s+(?:ave|avenue)\b/i, "проспект Чуй"],
  [/^er kindik\s+boulevard\b/i, "бульвар Эркиндик"],
  [/^erkindik\s+boulevard\b/i, "бульвар Эркиндик"],
  [/^baitik\s+baatyr\s+street\b/i, "улица Байтик Баатыра"],
  [/^nasirdin\s+isanov\s+street\b/i, "улица Насирдина Исанова"],
  [/^gorky\s+street\b/i, "улица Горького"],
  [/^moscow\s+street\b/i, "улица Московская"],
  [/^toktogul\s+street\b/i, "улица Токтогула"],
  [/^kalyk\s+akiev\s+street\b/i, "улица Калыка Акиева"],
  [/^chingiza?\s+aitmatova?\s+(?:prospect|avenue|проспект)\b/i, "проспект Чингиза Айтматова"],
  [/^михаил\s+фрунзе\s+көчөсү\b/i, "улица Михаила Фрунзе"],
  [/^михаил\s+фрунзе\s+кечесу\b/i, "улица Михаила Фрунзе"],
];

export function formatBishkekAddress(value: string): string {
  const parts = value
    .split(",")
    .map(cleanAddressPart)
    .filter(Boolean);
  const contentParts = parts.filter((part) => !isBishkekPart(part));
  if (contentParts.length === 0) return "Бишкек";

  const [rawStreet, ...rawRest] = contentParts;
  const rest = rawRest.map(cleanAddressPart).filter(Boolean);
  let street = normalizeStreetPart(rawStreet);

  if (rest[0] && isHouseNumber(rest[0])) {
    street = `${street} ${rest.shift()}`;
  }

  return [street, ...rest, "Бишкек"].join(", ");
}

function cleanAddressPart(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^город\s+/i, "")
    .replace(/^city\s+/i, "")
    .trim();
}

function isBishkekPart(value: string) {
  const normalized = value.toLowerCase().replace(/ё/g, "е");
  return normalized === "бишкек" || normalized === "bishkek";
}

function isHouseNumber(value: string) {
  return /^\d+[a-zа-я0-9/-]*$/i.test(value);
}

function normalizeStreetPart(value: string) {
  const cleaned = cleanAddressPart(value);
  const lowered = cleaned.toLowerCase();

  if (lowered.includes("михаил фрунзе")) {
    return "улица Михаила Фрунзе";
  }

  for (const [pattern, replacement] of streetReplacements) {
    if (pattern.test(cleaned)) return cleaned.replace(pattern, replacement);
  }

  const russianStreet = cleaned.match(/^(.+?)\s+улица$/i);
  if (russianStreet) return `улица ${russianStreet[1]}`;

  const kyrgyzStreet = cleaned.match(/^(.+?)\s+көчөсү$/i);
  if (kyrgyzStreet) return `улица ${kyrgyzStreet[1]}`;

  const englishStreet = cleaned.match(/^(.+?)\s+street$/i);
  if (englishStreet) return `улица ${englishStreet[1]}`;

  const englishBoulevard = cleaned.match(/^(.+?)\s+boulevard$/i);
  if (englishBoulevard) return `бульвар ${englishBoulevard[1]}`;

  const englishAvenue = cleaned.match(/^(.+?)\s+(?:ave|avenue)$/i);
  if (englishAvenue) return `проспект ${englishAvenue[1]}`;

  return cleaned;
}
