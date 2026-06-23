"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  LoaderCircle,
  Plus,
  ToggleLeft,
  ToggleRight,
  UserRound,
} from "lucide-react";
import type {
  MerchantSalon,
  MerchantStaff,
  MerchantWorkingHour,
} from "@/lib/domain/merchant";

const weekdayLabels = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];

export function MerchantStaffManager({
  salons,
  staff,
  workingHours,
}: {
  salons: MerchantSalon[];
  staff: MerchantStaff[];
  workingHours: MerchantWorkingHour[];
}) {
  const router = useRouter();
  const manageableSalons = salons.filter(
    (salon) => salon.role === "owner" || salon.role === "admin",
  );
  const hoursByStaffId = useMemo(() => {
    const map = new Map<string, MerchantWorkingHour[]>();
    for (const hours of workingHours) {
      const rows = map.get(hours.staffId) ?? [];
      rows.push(hours);
      map.set(hours.staffId, rows);
    }
    return map;
  }, [workingHours]);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingStaffId, setPendingStaffId] = useState<string | null>(null);

  async function createStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("saving");
    setErrorMessage("");

    const response = await fetch("/api/merchant/staff", {
      body: JSON.stringify({
        fullName: formData.get("fullName"),
        roleTitle: formData.get("roleTitle"),
        salonId: formData.get("salonId"),
        specialties: formData.get("specialties"),
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
    setErrorMessage(payload?.error ?? "Не удалось добавить мастера");
    setStatus("error");
  }

  async function toggleStaff(member: MerchantStaff) {
    setPendingStaffId(member.id);
    setErrorMessage("");

    const response = await fetch(`/api/merchant/staff/${member.id}`, {
      body: JSON.stringify({ isActive: !member.isActive }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    if (response.ok) {
      router.refresh();
    } else {
      const payload = await response.json().catch(() => null);
      setErrorMessage(payload?.error ?? "Не удалось обновить мастера");
    }

    setPendingStaffId(null);
  }

  async function updateHours(
    event: React.FormEvent<HTMLFormElement>,
    staffId: string,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPendingStaffId(staffId);
    setErrorMessage("");

    const response = await fetch(`/api/merchant/staff/${staffId}/hours`, {
      body: JSON.stringify({
        endsAt: formData.get("endsAt"),
        isActive: formData.get("isActive") === "on",
        startsAt: formData.get("startsAt"),
        weekday: Number(formData.get("weekday")),
      }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    if (response.ok) {
      router.refresh();
    } else {
      const payload = await response.json().catch(() => null);
      setErrorMessage(payload?.error ?? "Не удалось обновить график");
    }

    setPendingStaffId(null);
  }

  return (
    <section className="rounded-[24px] border border-[var(--rose-line)] bg-white p-5 shadow-[var(--shadow-subtle)] sm:p-6">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
            <UserRound aria-hidden className="h-4 w-4" />
            Команда
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.02em]">
            Мастера и графики
          </h2>
        </div>
        <span className="w-fit rounded-full bg-[var(--brand-fog)] px-3 py-1 text-sm font-extrabold text-[var(--brand-plum)]">
          {staff.length} мастеров
        </span>
      </div>

      {manageableSalons.length > 0 ? (
        <form onSubmit={createStaff} className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <select className="merchant-input" name="salonId" required>
            {manageableSalons.map((salon) => (
              <option key={salon.id} value={salon.id}>
                {salon.name}
              </option>
            ))}
          </select>
          <input
            className="merchant-input"
            name="fullName"
            placeholder="Имя мастера"
            required
          />
          <input
            className="merchant-input"
            name="roleTitle"
            placeholder="Мастер / Стилист"
          />
          <input
            className="merchant-input lg:col-span-2"
            name="specialties"
            placeholder="Маникюр, педикюр, брови"
          />
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-plum)] px-5 text-sm font-black text-white shadow-[var(--shadow-cta)] disabled:opacity-70 lg:col-span-2 lg:w-fit"
            disabled={status === "saving"}
            type="submit"
          >
            {status === "saving" ? (
              <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Plus aria-hidden className="h-4 w-4" />
            )}
            Добавить мастера
          </button>
        </form>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {staff.map((member) => {
          const memberHours = hoursByStaffId.get(member.id) ?? [];

          return (
            <article
              className="rounded-[18px] border border-[var(--rose-line)] bg-[var(--porcelain)] p-4"
              key={member.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black text-[var(--ink)]">
                    {member.fullName}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[var(--muted)]">
                    {member.roleTitle}
                  </p>
                </div>
                <button
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[var(--rose-line)] bg-white px-3 text-xs font-black text-[var(--brand-plum)] disabled:opacity-60"
                  disabled={pendingStaffId === member.id}
                  onClick={() => void toggleStaff(member)}
                  type="button"
                >
                  {pendingStaffId === member.id ? (
                    <LoaderCircle aria-hidden className="h-3.5 w-3.5 animate-spin" />
                  ) : member.isActive ? (
                    <ToggleRight aria-hidden className="h-3.5 w-3.5" />
                  ) : (
                    <ToggleLeft aria-hidden className="h-3.5 w-3.5" />
                  )}
                  {member.isActive ? "В графике" : "Скрыт"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(member.specialties.length > 0
                  ? member.specialties
                  : ["Все активные услуги"]
                ).map((specialty) => (
                  <span
                    className="rounded-full border border-[var(--rose-line)] bg-white px-3 py-1 text-xs font-bold text-[var(--muted)]"
                    key={specialty}
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {memberHours.map((hours) => (
                  <span
                    className={`rounded-[14px] border px-3 py-2 text-xs font-black ${
                      hours.isActive
                        ? "border-[var(--petal-line)] bg-white text-[var(--ink)]"
                        : "border-[var(--line)] bg-white/60 text-[var(--soft)]"
                    }`}
                    key={hours.id}
                  >
                    {weekdayLabels[hours.weekday]} · {hours.startsAt}-{hours.endsAt}
                  </span>
                ))}
              </div>

              <form
                className="mt-4 grid gap-2 rounded-[16px] border border-[var(--rose-line)] bg-white p-3 sm:grid-cols-[92px_1fr_1fr_auto]"
                onSubmit={(event) => void updateHours(event, member.id)}
              >
                <select className="merchant-input min-h-11" name="weekday" required>
                  {weekdayLabels.map((label, weekday) => (
                    <option key={label} value={weekday}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  className="merchant-input min-h-11"
                  defaultValue="10:00"
                  name="startsAt"
                  required
                  type="time"
                />
                <input
                  className="merchant-input min-h-11"
                  defaultValue="20:00"
                  name="endsAt"
                  required
                  type="time"
                />
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-plum)] px-4 text-xs font-black text-white disabled:opacity-70"
                  disabled={pendingStaffId === member.id}
                  type="submit"
                >
                  {pendingStaffId === member.id ? (
                    <LoaderCircle aria-hidden className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CalendarClock aria-hidden className="h-3.5 w-3.5" />
                  )}
                  Сохранить
                </button>
                <label className="flex min-h-10 items-center gap-2 text-xs font-black text-[var(--muted)] sm:col-span-4">
                  <input defaultChecked name="isActive" type="checkbox" />
                  Рабочий день активен
                </label>
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}
