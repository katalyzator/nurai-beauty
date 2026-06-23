"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, Plus, Scissors, ToggleLeft, ToggleRight } from "lucide-react";
import type { MerchantSalon, MerchantService } from "@/lib/domain/merchant";

export function MerchantServiceManager({
  salons,
  services,
}: {
  salons: MerchantSalon[];
  services: MerchantService[];
}) {
  const router = useRouter();
  const manageableSalons = salons.filter(
    (salon) => salon.role === "owner" || salon.role === "admin",
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);

  async function createService(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("saving");
    setErrorMessage("");

    const response = await fetch("/api/merchant/services", {
      body: JSON.stringify({
        category: formData.get("category"),
        durationMinutes: Number(formData.get("durationMinutes")),
        name: formData.get("name"),
        priceKgs: Number(formData.get("priceKgs")),
        salonId: formData.get("salonId"),
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (response.ok) {
      event.currentTarget.reset();
      setStatus("idle");
      router.refresh();
      return;
    }

    const payload = await response.json().catch(() => null);
    setErrorMessage(payload?.error ?? "Не удалось добавить услугу");
    setStatus("error");
  }

  async function toggleService(service: MerchantService) {
    setPendingServiceId(service.id);
    setErrorMessage("");

    const response = await fetch(`/api/merchant/services/${service.id}`, {
      body: JSON.stringify({ isActive: !service.isActive }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    if (response.ok) {
      router.refresh();
    } else {
      const payload = await response.json().catch(() => null);
      setErrorMessage(payload?.error ?? "Не удалось обновить услугу");
    }

    setPendingServiceId(null);
  }

  return (
    <section className="rounded-[24px] border border-[var(--rose-line)] bg-white p-5 shadow-[var(--shadow-subtle)] sm:p-6">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
            <Scissors aria-hidden className="h-4 w-4" />
            Каталог
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.02em]">
            Услуги и цены
          </h2>
        </div>
        <span className="w-fit rounded-full bg-[var(--brand-fog)] px-3 py-1 text-sm font-extrabold text-[var(--brand-plum)]">
          {services.length} услуг
        </span>
      </div>

      {manageableSalons.length > 0 ? (
        <form onSubmit={createService} className="mt-5 grid gap-3 lg:grid-cols-[1.1fr_1fr_120px_120px_auto]">
          <select className="merchant-input" name="salonId" required>
            {manageableSalons.map((salon) => (
              <option key={salon.id} value={salon.id}>
                {salon.name}
              </option>
            ))}
          </select>
          <input
            className="merchant-input"
            name="name"
            placeholder="Новая услуга"
            required
          />
          <input
            className="merchant-input"
            name="durationMinutes"
            defaultValue="60"
            min="10"
            required
            type="number"
          />
          <input
            className="merchant-input"
            name="priceKgs"
            defaultValue="1000"
            min="0"
            required
            type="number"
          />
          <input
            className="merchant-input lg:col-span-2"
            name="category"
            placeholder="Категория, можно пусто"
          />
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-plum)] px-5 text-sm font-black text-white shadow-[var(--shadow-cta)] disabled:opacity-70 lg:col-span-3 lg:w-fit"
            disabled={status === "saving"}
            type="submit"
          >
            {status === "saving" ? (
              <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Plus aria-hidden className="h-4 w-4" />
            )}
            Добавить услугу
          </button>
        </form>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <article
            className="rounded-[18px] border border-[var(--rose-line)] bg-[var(--porcelain)] p-4"
            key={service.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-black text-[var(--ink)]">
                  {service.name}
                </p>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--rose-deep)]">
                  {service.category}
                </p>
              </div>
              <button
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[var(--rose-line)] bg-white px-3 text-xs font-black text-[var(--brand-plum)] disabled:opacity-60"
                disabled={pendingServiceId === service.id}
                onClick={() => void toggleService(service)}
                type="button"
              >
                {pendingServiceId === service.id ? (
                  <LoaderCircle aria-hidden className="h-3.5 w-3.5 animate-spin" />
                ) : service.isActive ? (
                  <ToggleRight aria-hidden className="h-3.5 w-3.5" />
                ) : (
                  <ToggleLeft aria-hidden className="h-3.5 w-3.5" />
                )}
                {service.isActive ? "Активна" : "Скрыта"}
              </button>
            </div>
            <p className="mt-4 text-sm font-extrabold text-[var(--muted)]">
              {service.durationMinutes} мин · {service.priceKgs} сом
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
