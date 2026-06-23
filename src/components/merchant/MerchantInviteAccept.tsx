"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";

export function MerchantInviteAccept({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "accepted" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [salonName, setSalonName] = useState("");

  async function acceptInvite() {
    setStatus("saving");
    setErrorMessage("");

    const response = await fetch(`/api/merchant/invitations/${token}/accept`, {
      method: "POST",
    });

    const payload = await response.json().catch(() => null);
    if (response.ok) {
      setSalonName(payload?.salon?.name ?? "салон");
      setStatus("accepted");
      router.refresh();
      return;
    }

    setErrorMessage(payload?.error ?? "Не удалось принять приглашение");
    setStatus("error");
  }

  return (
    <section className="mt-6 rounded-[28px] border border-[var(--rose-line)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
          <ShieldCheck aria-hidden className="h-4 w-4" />
          Приглашение сотрудника
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-none sm:text-6xl">
          Подключиться к салону
        </h1>
        <p className="mt-4 text-base font-semibold leading-7 text-[var(--muted)]">
          После принятия вы сможете видеть кабинет салона согласно своей роли.
          Доступ привязан к вашей Telegram-сессии.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-plum)] px-6 text-sm font-black text-white shadow-[var(--shadow-cta)] disabled:opacity-70"
          disabled={status === "saving" || status === "accepted"}
          onClick={() => void acceptInvite()}
          type="button"
        >
          {status === "saving" ? (
            <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 aria-hidden className="h-4 w-4" />
          )}
          {status === "accepted" ? "Принято" : "Принять приглашение"}
        </button>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--rose-line)] bg-white px-6 text-sm font-black text-[var(--brand-plum)]"
          href="/merchant"
        >
          Открыть кабинет
        </Link>
      </div>

      {status === "accepted" ? (
        <p className="mt-5 rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          Готово: доступ к {salonName} активирован.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
