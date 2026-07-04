export function normalizeKgPhone(value: string): string | null {
  const nationalNumber = getKgNationalDigits(value);
  if (!/^\d{9}$/.test(nationalNumber) || nationalNumber.startsWith("996")) {
    return null;
  }

  return [
    "+996",
    nationalNumber.slice(0, 3),
    nationalNumber.slice(3, 6),
    nationalNumber.slice(6, 9),
  ].join(" ");
}

export function formatKgPhoneInput(value: string): string {
  const nationalNumber = getKgNationalDigits(value).slice(0, 9);
  if (!nationalNumber) return "";

  const groups = [
    nationalNumber.slice(0, 3),
    nationalNumber.slice(3, 6),
    nationalNumber.slice(6, 9),
  ].filter(Boolean);

  return `+996 ${groups.join(" ")}`;
}

function getKgNationalDigits(value: string) {
  let digits = value.replace(/\D/g, "");
  const rawValue = value.trim();

  if (/^\+?\s*996/.test(rawValue)) {
    digits = digits.slice(3);
  }
  while (digits.startsWith("996")) digits = digits.slice(3);

  if (digits === "996") return "";
  if (digits.startsWith("0")) return digits.slice(1);

  return digits;
}
