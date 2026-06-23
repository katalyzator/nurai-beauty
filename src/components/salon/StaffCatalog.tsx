"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Clock3, Star, Users } from "lucide-react";
import type { StaffMember } from "@/lib/domain/types";

export function StaffCatalog({
  staff,
}: {
  staff: StaffMember[];
}) {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  useEffect(() => {
    function handleStaffSelection(event: Event) {
      const customEvent = event as CustomEvent<{ staffId: string | null }>;
      setSelectedStaffId(customEvent.detail.staffId);
    }

    window.addEventListener("nurai:staff-selection", handleStaffSelection);
    return () =>
      window.removeEventListener("nurai:staff-selection", handleStaffSelection);
  }, []);

  function selectStaff(staffId: string | null) {
    setSelectedStaffId(staffId);
    window.dispatchEvent(
      new CustomEvent("nurai:staff-selection", {
        detail: { staffId },
      }),
    );
  }

  return (
    <section className="rounded-[24px] border border-[var(--rose-line)] bg-white/88 p-5 shadow-[var(--shadow-subtle)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
            Каталог мастеров
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.02em]">
            Выберите специалиста или ближайшее окно
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
          Можно записаться к конкретному мастеру или оставить выбор салону:
          система назначит свободного специалиста на выбранный слот.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => selectStaff(null)}
          className={`grid min-h-[180px] gap-4 rounded-[20px] border p-4 text-left transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 ${
            selectedStaffId === null
              ? "border-[var(--brand-plum)] bg-[var(--brand-fog)] shadow-[var(--shadow-card)]"
              : "border-[var(--rose-line)] bg-white hover:border-[var(--petal)]"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-[18px] bg-[var(--brand-plum)] text-white">
              <Users aria-hidden className="h-7 w-7" />
            </span>
            {selectedStaffId === null ? (
              <CheckCircle2
                aria-hidden
                className="h-5 w-5 text-[var(--brand-plum)]"
              />
            ) : null}
          </div>
          <div>
            <h3 className="text-xl font-black text-[var(--ink)]">
              Любой свободный мастер
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--muted)]">
              Лучший вариант, если важнее время. Салон сам назначит мастера,
              который свободен на этот слот.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[var(--cream)] px-3 py-1 text-xs font-extrabold text-[var(--cocoa)]">
            <Clock3 aria-hidden className="h-3.5 w-3.5" />
            быстрее всего
          </span>
        </button>

        {staff.map((member) => (
          <button
            type="button"
            key={member.id}
            onClick={() => selectStaff(member.id)}
            className={`overflow-hidden rounded-[20px] border bg-white text-left transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 ${
              selectedStaffId === member.id
                ? "border-[var(--brand-plum)] shadow-[var(--shadow-card)]"
                : "border-[var(--rose-line)] hover:border-[var(--petal)]"
            }`}
          >
            <div className="relative h-44 bg-[var(--brand-fog)]">
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt={member.fullName}
                  fill
                  sizes="(min-width: 768px) 36vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center font-display text-5xl font-bold text-[var(--brand-plum)]">
                  {member.fullName.slice(0, 1)}
                </div>
              )}
              <div className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-extrabold text-[var(--rose-deep)] shadow-sm backdrop-blur">
                {member.roleTitle}
              </div>
              {selectedStaffId === member.id ? (
                <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[var(--brand-plum)] text-white">
                  <CheckCircle2 aria-hidden className="h-5 w-5" />
                </div>
              ) : null}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-[var(--ink)]">
                    {member.fullName}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                    {member.bio}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cream)] px-2.5 py-1 text-xs font-extrabold text-[var(--cocoa)]">
                  <Star aria-hidden className="h-3.5 w-3.5 fill-current" />
                  {member.rating ? member.rating.toFixed(1) : "4.8"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {member.specialties.slice(0, 3).map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full bg-[var(--blush-soft)] px-3 py-1 text-xs font-bold text-[var(--rose-deep)]"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs font-bold text-[var(--muted)]">
                {member.reviewCount || 12} отзывов · график 10:00-20:00
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
