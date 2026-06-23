import { Bot, ExternalLink, ShieldCheck } from "lucide-react";
import { buildTelegramBotHref } from "@/lib/domain/telegram-links";

export function MerchantAuthGate({
  botUsername,
}: {
  botUsername: string | undefined;
}) {
  const href = buildTelegramBotHref(botUsername, "merchant");

  return (
    <section className="mt-6 grid gap-5 rounded-[28px] border border-[var(--rose-line)] bg-white p-6 shadow-[var(--shadow-card)] lg:grid-cols-[1fr_360px] lg:items-center">
      <div>
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
          <ShieldCheck aria-hidden className="h-4 w-4" />
          Доступ владельца
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-none sm:text-6xl">
          Войдите через Telegram
        </h1>
        <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[var(--muted)]">
          Кабинет салона привязан к Telegram-пользователю. Откройте nurAI
          внутри бота, чтобы создать салон, видеть заявки и управлять командой.
        </p>
      </div>
      <div className="rounded-[22px] border border-[var(--rose-line)] bg-[var(--porcelain)] p-5">
        <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-[var(--brand-plum)] text-white">
          <Bot aria-hidden className="h-5 w-5" />
        </div>
        <p className="mt-4 text-lg font-black text-[var(--ink)]">
          Telegram Mini App
        </p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[var(--muted)]">
          После входа мы создадим защищенную сессию. Данные чужих салонов не
          будут доступны через интерфейс или API.
        </p>
        {href ? (
          <a
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-plum)] px-5 text-sm font-black text-white shadow-[var(--shadow-cta)]"
            href={href}
          >
            Открыть в Telegram
            <ExternalLink aria-hidden className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </section>
  );
}
