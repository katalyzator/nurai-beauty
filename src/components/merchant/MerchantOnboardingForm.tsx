"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Scissors,
  Store,
  User,
} from "lucide-react";

const bishkekCenter = {
  latitude: 42.8746,
  longitude: 74.5698,
};

export function MerchantOnboardingForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("saving");
    setErrorMessage("");

    const response = await fetch("/api/merchant/onboarding", {
      body: JSON.stringify({
        address: formData.get("address"),
        instagramUrl: formData.get("instagramUrl"),
        latitude: Number(formData.get("latitude")),
        longitude: Number(formData.get("longitude")),
        masterName: formData.get("masterName"),
        phone: formData.get("phone"),
        salonName: formData.get("salonName"),
        serviceDurationMinutes: Number(formData.get("serviceDurationMinutes")),
        serviceName: formData.get("serviceName"),
        servicePriceKgs: Number(formData.get("servicePriceKgs")),
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (response.ok) {
      setStatus("saved");
      router.refresh();
      return;
    }

    const payload = await response.json().catch(() => null);
    setErrorMessage(payload?.error ?? "Не удалось создать салон");
    setStatus("error");
  }

  return (
    <section className="mt-6 rounded-[28px] glass glass-edge reveal-in p-5 sm:p-7">
      <div className="grid gap-5 border-b border-[var(--line)] pb-5 lg:grid-cols-[1fr_340px] lg:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
            <Store aria-hidden className="h-4 w-4" />
            Первый салон
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-none sm:text-6xl">
            Подключим салон за пару минут
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[var(--muted)]">
            Создадим профиль, первую услугу, первого мастера и рабочий график
            10:00-20:00. Потом все можно будет расширить в кабинете.
          </p>
        </div>
        <div className="rounded-[20px] glass-soft p-4 text-sm font-bold leading-6 text-[var(--muted)]">
          После сохранения салон сразу появится в вашем кабинете. Клиентская
          запись будет назначать свободного мастера по услугам и занятым слотам.
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <MerchantField icon={<Store aria-hidden className="h-4 w-4" />} label="Салон">
            <input
              className="merchant-input"
              name="salonName"
              placeholder="NurAI Beauty Studio"
              required
            />
          </MerchantField>
          <MerchantField icon={<MapPin aria-hidden className="h-4 w-4" />} label="Адрес">
            <input
              className="merchant-input"
              name="address"
              placeholder="пр. Чуй 120, Бишкек"
              required
            />
          </MerchantField>
          <MerchantField icon={<Store aria-hidden className="h-4 w-4" />} label="Телефон">
            <input
              className="merchant-input"
              name="phone"
              placeholder="+996 700 111 222"
              required
              type="tel"
            />
          </MerchantField>
          <MerchantField icon={<Store aria-hidden className="h-4 w-4" />} label="Instagram">
            <input
              className="merchant-input"
              name="instagramUrl"
              placeholder="@nurai.beauty"
            />
          </MerchantField>
        </div>

        <div className="grid gap-4 rounded-[22px] glass-soft p-4 lg:grid-cols-[1fr_160px_160px]">
          <MerchantField icon={<Scissors aria-hidden className="h-4 w-4" />} label="Первая услуга">
            <input
              className="merchant-input"
              name="serviceName"
              placeholder="Маникюр с гель-лаком"
              required
            />
          </MerchantField>
          <MerchantField icon={<Scissors aria-hidden className="h-4 w-4" />} label="Минуты">
            <input
              className="merchant-input"
              defaultValue="90"
              min="10"
              name="serviceDurationMinutes"
              required
              type="number"
            />
          </MerchantField>
          <MerchantField icon={<Scissors aria-hidden className="h-4 w-4" />} label="Цена">
            <input
              className="merchant-input"
              defaultValue="1500"
              min="0"
              name="servicePriceKgs"
              required
              type="number"
            />
          </MerchantField>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_160px_160px]">
          <MerchantField icon={<User aria-hidden className="h-4 w-4" />} label="Первый мастер">
            <input
              className="merchant-input"
              name="masterName"
              placeholder="Айсулуу"
              required
            />
          </MerchantField>
          <MerchantField icon={<MapPin aria-hidden className="h-4 w-4" />} label="Lat">
            <input
              className="merchant-input"
              defaultValue={bishkekCenter.latitude}
              name="latitude"
              required
              step="0.000001"
              type="number"
            />
          </MerchantField>
          <MerchantField icon={<MapPin aria-hidden className="h-4 w-4" />} label="Lng">
            <input
              className="merchant-input"
              defaultValue={bishkekCenter.longitude}
              name="longitude"
              required
              step="0.000001"
              type="number"
            />
          </MerchantField>
        </div>

        <button
          className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
          disabled={status === "saving"}
          type="submit"
        >
          {status === "saving" ? (
            <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 aria-hidden className="h-4 w-4" />
          )}
          {status === "saving" ? "Создаем салон..." : "Создать салон"}
        </button>
      </form>

      {status === "saved" ? (
        <p className="mt-4 flex items-center gap-2 rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <CheckCircle2 aria-hidden className="h-4 w-4" />
          Салон создан. Обновляем кабинет.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-4 flex items-center gap-2 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          <AlertCircle aria-hidden className="h-4 w-4" />
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}

function MerchantField({
  children,
  icon,
  label,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
