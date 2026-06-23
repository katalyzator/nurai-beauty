"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  LoaderCircle,
  Phone,
  Scissors,
  Send,
  User,
} from "lucide-react";
import { useTelegramAuth } from "@/components/auth/useTelegramAuth";
import {
  buildBishkekSlotIso,
  createBookingDays,
  defaultBookingTimes,
} from "@/lib/domain/booking-calendar";
import type { SalonDetail } from "@/lib/domain/types";
import { getSalonVisual } from "@/lib/domain/salon-visuals";

export function BookingForm({
  salon,
  source = "web",
}: {
  salon: SalonDetail;
  source?: "web" | "telegram";
}) {
  const { authenticated, loading: authLoading, user } = useTelegramAuth();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(
    salon.services[0]?.id ?? "",
  );
  const [selectedStaffId, setSelectedStaffId] = useState(
    salon.staff[0]?.id ?? "",
  );
  const days = useMemo(() => createBookingDays(new Date(), 6), []);
  const [selectedDate, setSelectedDate] = useState(days[0]?.isoDate ?? "");
  const [selectedTime, setSelectedTime] = useState("12:30");
  const visual = getSalonVisual(salon);
  const selectedService = salon.services.find(
    (service) => service.id === selectedServiceId,
  );
  const bookingSource = authenticated ? "telegram" : source;
  const telegramName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "";
  const effectiveClientName = clientName || telegramName;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedServiceId || !selectedDate || !selectedTime) return;

    setStatus("saving");
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salonId: salon.id,
        serviceId: selectedServiceId,
        staffId: selectedStaffId || null,
        clientName: effectiveClientName,
        clientPhone,
        startAt: buildBishkekSlotIso(selectedDate, selectedTime),
        source: bookingSource,
      }),
    });

    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[24px] border border-[var(--rose-line)] bg-white p-4 text-[var(--ink)] shadow-[var(--shadow-card)] sm:p-5"
    >
      <div className="rounded-[20px] bg-[linear-gradient(135deg,var(--brand-fog),var(--blush-soft))] p-4">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
          <CalendarClock aria-hidden className="h-4 w-4" />
          Быстрая запись
        </p>
        <h2 className="mt-2 font-display text-4xl font-semibold leading-none">
          {visual.nextSlot}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Выберите услугу, день и красивый слот. Заявка сразу уйдет салону.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <Field label="Услуга" icon={<Scissors aria-hidden className="h-4 w-4" />}>
          <select
            name="serviceId"
            value={selectedServiceId}
            onChange={(event) => setSelectedServiceId(event.target.value)}
            className="min-h-12 w-full rounded-[14px] border border-[var(--rose-line)] bg-white px-4 text-sm font-bold text-[var(--ink)] outline-none"
          >
            {salon.services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} · {service.priceKgs} сом
              </option>
            ))}
          </select>
        </Field>

        <Field label="Мастер" icon={<User aria-hidden className="h-4 w-4" />}>
          <select
            name="staffId"
            value={selectedStaffId}
            onChange={(event) => setSelectedStaffId(event.target.value)}
            className="min-h-12 w-full rounded-[14px] border border-[var(--rose-line)] bg-white px-4 text-sm font-bold text-[var(--ink)] outline-none"
          >
            {salon.staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
            <CalendarClock aria-hidden className="h-4 w-4" />
            День
          </p>
          <div className="grid grid-cols-3 gap-2">
            {days.map((day) => (
              <button
                className={`min-h-[74px] rounded-[14px] border px-3 py-2 text-left transition ${
                  selectedDate === day.isoDate
                    ? "border-[var(--brand-plum)] bg-[var(--brand-plum)] text-white shadow-[var(--shadow-cta)]"
                    : "border-[var(--rose-line)] bg-white text-[var(--ink)]"
                }`}
                key={day.isoDate}
                onClick={() => setSelectedDate(day.isoDate)}
                type="button"
              >
                <span className="block text-xs font-extrabold uppercase">
                  {day.dayName}
                </span>
                <span className="mt-1 block text-2xl font-black leading-none">
                  {day.dayNumber}
                </span>
                <span className="mt-1 block text-xs font-bold opacity-75">
                  {day.monthName}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
            Время
          </p>
          <div className="grid grid-cols-3 gap-2">
            {defaultBookingTimes.map((time) => (
              <button
                className={`min-h-11 rounded-[8px] border text-sm font-extrabold ${
                  selectedTime === time
                    ? "border-[var(--chocolate)] bg-[var(--chocolate)] text-white"
                    : "border-[var(--rose-line)] bg-white text-[var(--ink)]"
                }`}
                key={time}
                onClick={() => setSelectedTime(time)}
                type="button"
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <Field label="Имя" icon={<User aria-hidden className="h-4 w-4" />}>
          <input
            name="clientName"
            placeholder="Айсулуу"
            required
            value={effectiveClientName}
            onChange={(event) => setClientName(event.target.value)}
            className="min-h-12 w-full rounded-[14px] border border-[var(--rose-line)] bg-white px-4 text-sm font-bold text-[var(--ink)] outline-none placeholder:text-[var(--soft)]"
          />
        </Field>

        <Field label="Телефон" icon={<Phone aria-hidden className="h-4 w-4" />}>
          <input
            name="clientPhone"
            placeholder="+996 700 000 000"
            required
            type="tel"
            value={clientPhone}
            onChange={(event) => setClientPhone(event.target.value)}
            className="min-h-12 w-full rounded-[14px] border border-[var(--rose-line)] bg-white px-4 text-sm font-bold text-[var(--ink)] outline-none placeholder:text-[var(--soft)]"
          />
        </Field>
      </div>

      <div className="mt-5 rounded-[18px] border border-[var(--rose-line)] bg-[var(--porcelain)] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold text-[var(--ink)]">
              {selectedTime} · {selectedService?.name ?? "Услуга"}
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              {authenticated
                ? `Telegram: ${user?.firstName}`
                : authLoading
                  ? "Проверяем Telegram..."
                  : "Можно войти через Telegram в Mini App"}
            </p>
          </div>
          <span className="rounded-full bg-[var(--blush)] px-3 py-1 text-xs font-extrabold text-[var(--rose-deep)]">
            {bookingSource}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "saving" || !selectedServiceId}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-plum)] px-5 text-sm font-black text-white shadow-[var(--shadow-cta)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "saving" ? (
          <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <Send aria-hidden className="h-4 w-4" />
        )}
        {status === "saving" ? "Отправляем..." : "Записаться"}
      </button>

      {status === "saved" && (
        <StatusMessage tone="success">
          <CheckCircle2 aria-hidden className="h-4 w-4" />
          Заявка создана. Салон увидит запись в кабинете.
        </StatusMessage>
      )}
      {status === "error" && (
        <StatusMessage tone="error">
          <AlertCircle aria-hidden className="h-4 w-4" />
          Не удалось создать запись. Проверьте данные и попробуйте снова.
        </StatusMessage>
      )}
    </form>
  );
}

function Field({
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

function StatusMessage({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "success" | "error";
}) {
  const className =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <p
      className={`mt-4 flex items-center gap-2 rounded-[16px] border px-4 py-3 text-sm font-bold ${className}`}
    >
      {children}
    </p>
  );
}
