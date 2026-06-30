const BISHKEK_OFFSET = "+06:00";

const dayFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "short",
  timeZone: "Asia/Bishkek",
});

const monthFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "short",
  timeZone: "Asia/Bishkek",
});

const dayNumberFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  timeZone: "Asia/Bishkek",
});

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Bishkek",
  year: "numeric",
});

export type BookingDay = {
  isoDate: string;
  dayName: string;
  dayNumber: string;
  monthName: string;
};

export const defaultBookingTimes = [
  "10:00",
  "11:30",
  "12:30",
  "14:00",
  "15:45",
  "17:20",
  "18:40",
];

export function createBookingDays(anchorDate = new Date(), count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(anchorDate);
    date.setUTCDate(anchorDate.getUTCDate() + index);

    return {
      isoDate: isoDateFormatter.format(date),
      dayName: normalizeRuWeekdayLabel(dayFormatter.format(date)),
      dayNumber: dayNumberFormatter.format(date),
      monthName: stripRuShortLabelDot(monthFormatter.format(date)).slice(0, 3),
    };
  });
}

export function buildBishkekSlotIso(isoDate: string, time: string) {
  return new Date(`${isoDate}T${time}:00${BISHKEK_OFFSET}`).toISOString();
}

function normalizeRuWeekdayLabel(label: string) {
  const cleanLabel = stripRuShortLabelDot(label);
  return cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1);
}

function stripRuShortLabelDot(label: string) {
  return label.replace(".", "");
}
