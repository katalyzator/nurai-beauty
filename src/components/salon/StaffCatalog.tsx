"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Star, Users } from "lucide-react";
import { getDisplayMasters } from "@/lib/domain/salon-masters";

export function StaffCatalog({ salonSlug }: { salonSlug: string }) {
  const masters = getDisplayMasters(salonSlug);
  // null = "any free master"; otherwise a demo master id (display only).
  const [activeId, setActiveId] = useState<string | null>(null);

  // Keep the catalog and the booking-form dropdown in sync.
  useEffect(() => {
    function handleSelection(event: Event) {
      const detail = (event as CustomEvent<{ staffId: string | null }>).detail;
      setActiveId(detail.staffId ?? null);
    }
    window.addEventListener("nurai:staff-selection", handleSelection);
    return () =>
      window.removeEventListener("nurai:staff-selection", handleSelection);
  }, []);

  function pick(id: string | null) {
    setActiveId(id);
    window.dispatchEvent(
      new CustomEvent("nurai:staff-selection", {
        detail: { staffId: id },
      }),
    );
  }

  return (
    <section className="reveal-in rounded-[24px] glass glass-edge p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
            Каталог мастеров
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Выберите специалиста или ближайшее окно
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
          Можно записаться к конкретному мастеру или оставить выбор салону:
          система назначит свободного специалиста на выбранный слот.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={() => pick(null)}
          className={`glow-hover flex min-h-[230px] flex-col gap-4 rounded-[20px] p-5 text-left ${
            activeId === null
              ? "bg-white/80 ring-1 ring-[var(--rose)] backdrop-blur"
              : "border border-[var(--glass-edge)] bg-white/45 backdrop-blur"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <span
              className="grid h-14 w-14 place-items-center rounded-[16px] text-white shadow-[var(--shadow-cta)]"
              style={{ background: "var(--grad-cta)" }}
            >
              <Users aria-hidden className="h-6 w-6" />
            </span>
            {activeId === null ? (
              <CheckCircle2 aria-hidden className="h-5 w-5 text-[var(--rose)]" />
            ) : null}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[var(--ink)]">
              Любой свободный мастер
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--muted)]">
              Лучший вариант, если важнее время. Салон сам назначит мастера,
              который свободен на этот слот.
            </p>
          </div>
          <span className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-[var(--cream)] px-3 py-1 text-xs font-extrabold text-[var(--cocoa)]">
            <Clock3 aria-hidden className="h-3.5 w-3.5" />
            быстрее всего
          </span>
        </button>

        {masters.map((master) => {
          const selected = activeId === master.id;
          return (
            <button
              type="button"
              key={master.id}
              onClick={() => pick(master.id)}
              className={`glow-hover overflow-hidden rounded-[20px] text-left ${
                selected
                  ? "bg-white/85 ring-1 ring-[var(--rose)] backdrop-blur"
                  : "border border-[var(--glass-edge)] bg-white/55 backdrop-blur"
              }`}
            >
              <div
                className="relative flex h-28 items-end p-4"
                style={{ background: master.accent }}
              >
                <span className="font-display text-6xl font-semibold leading-none text-white/95 drop-shadow">
                  {master.fullName.slice(0, 1)}
                </span>
                <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-extrabold text-[var(--rose-deep)] shadow-sm backdrop-blur">
                  {master.roleTitle}
                </span>
                {selected ? (
                  <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[var(--rose-deep)] shadow">
                    <CheckCircle2 aria-hidden className="h-5 w-5" />
                  </span>
                ) : null}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-extrabold text-[var(--ink)]">
                    {master.fullName}
                  </h3>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--cream)] px-2.5 py-1 text-xs font-extrabold text-[var(--cocoa)]">
                    <Star aria-hidden className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
                    {master.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-semibold leading-5 text-[var(--muted)]">
                  {master.bio}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {master.specialties.slice(0, 3).map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-[var(--blush-soft)] px-2.5 py-1 text-xs font-bold text-[var(--rose-deep)]"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs font-bold text-[var(--muted)]">
                  {master.reviewCount} отзывов · график 10:00–20:00
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
