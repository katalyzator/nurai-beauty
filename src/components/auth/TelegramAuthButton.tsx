"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useTelegramAuth } from "@/components/auth/useTelegramAuth";

export function TelegramAuthButton({
  botUsername,
  compact = false,
}: {
  botUsername?: string;
  compact?: boolean;
}) {
  const { authenticated, loading, user } = useTelegramAuth();
  const telegramHref = botUsername
    ? `https://t.me/${botUsername.replace(/^@/, "")}?startapp=booking`
    : null;

  if (authenticated && user) {
    return (
      <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--rose-line)] bg-white px-4 text-sm font-bold text-[var(--ink)] shadow-[var(--shadow-subtle)]">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--blush)] text-xs font-black text-[var(--rose-deep)]">
          {user.firstName.slice(0, 1)}
        </span>
        {!compact ? <span>{user.firstName}</span> : null}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--rose-line)] bg-white px-4 text-sm font-bold text-[var(--muted)] shadow-[var(--shadow-subtle)]">
        <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
        {!compact ? <span>Проверяем Telegram</span> : null}
      </div>
    );
  }

  const className =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--rose)] px-4 text-sm font-extrabold text-white shadow-[0_16px_34px_rgba(232,93,143,0.24)] hover:-translate-y-0.5";

  if (telegramHref) {
    return (
      <a className={className} href={telegramHref} rel="noreferrer" target="_blank">
        <Send aria-hidden className="h-4 w-4" />
        {!compact ? <span>Войти через Telegram</span> : null}
      </a>
    );
  }

  return (
    <button className={className} type="button">
      <Send aria-hidden className="h-4 w-4" />
      {!compact ? <span>Откройте в Telegram</span> : null}
    </button>
  );
}
