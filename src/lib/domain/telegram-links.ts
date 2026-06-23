export function buildTelegramBotHref(
  botUsername: string | undefined,
  startPayload = "booking",
): string | null {
  const username = botUsername?.replace(/^@/, "").trim();
  if (!username) return null;

  const url = new URL(`https://t.me/${username}`);
  if (startPayload) {
    url.searchParams.set("start", startPayload);
  }

  return url.toString();
}
