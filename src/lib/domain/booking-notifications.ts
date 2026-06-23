export type BookingNotificationDetails = {
  salonAddress: string;
  salonName: string;
  serviceName: string;
  staffName: string | null;
  startAt: string;
};

const bishkekDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  timeZone: "Asia/Bishkek",
});

const bishkekTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Bishkek",
});

export function buildTelegramBookingConfirmationText(
  details: BookingNotificationDetails,
) {
  const salonName = escapeTelegramHtml(details.salonName);
  const serviceName = escapeTelegramHtml(details.serviceName);
  const staffName = escapeTelegramHtml(
    details.staffName ?? "любой свободный мастер",
  );
  const salonAddress = escapeTelegramHtml(details.salonAddress);

  return [
    "<b>Запись создана</b>",
    "",
    `<b>${salonName}</b>`,
    serviceName,
    `Дата: <b>${bishkekDateFormatter.format(new Date(details.startAt))}</b>`,
    `Время: <b>${bishkekTimeFormatter.format(new Date(details.startAt))}</b>`,
    `Мастер: <b>${staffName}</b>`,
    `Адрес: ${salonAddress}`,
    "",
    "Салон уже видит заявку в кабинете nurAI. Если нужно будет перенести запись, просто напишите мне здесь.",
  ].join("\n");
}

function escapeTelegramHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
