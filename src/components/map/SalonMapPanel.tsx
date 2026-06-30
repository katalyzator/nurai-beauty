"use client";

import dynamic from "next/dynamic";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowUpRight,
  Clock3,
  Layers3,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Navigation,
  Scissors,
  Star,
} from "lucide-react";
import type { SalonSummary } from "@/lib/domain/types";
import { formatDistance } from "@/lib/geo/distance";
import {
  formatPriceTier,
  formatReviewCount,
  getSalonVisual,
} from "@/lib/domain/salon-visuals";

const SalonMap = dynamic(
  () => import("@/components/map/SalonMap").then((mod) => mod.SalonMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[560px] min-h-[520px] place-items-center rounded-[22px] bg-[var(--brand-fog)] text-sm font-bold text-[var(--brand-plum)] lg:h-[640px]">
        Загружаем карту...
      </div>
    ),
  },
);

export function SalonMapPanel({
  locationStatus,
  onUseMyLocation,
  origin,
  originLabel,
  salons,
}: {
  locationStatus: "idle" | "loading" | "ready" | "denied" | "outside";
  onUseMyLocation: () => void;
  origin?: { latitude: number; longitude: number; label: string } | null;
  originLabel: string;
  salons: SalonSummary[];
}) {
  const router = useRouter();
  const [isOpenPending, startOpenTransition] = useTransition();
  const [openingSalonId, setOpeningSalonId] = useState<string | null>(null);
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [focusedSalonId, setFocusedSalonId] = useState<string | null>(null);
  const selectedSalon = useMemo(
    () =>
      salons.find((salon) => salon.id === selectedSalonId) ?? salons[0] ?? null,
    [salons, selectedSalonId],
  );
  const visual = selectedSalon ? getSalonVisual(selectedSalon) : null;
  const selectedSalonHref = selectedSalon
    ? (`/salons/${selectedSalon.slug}` as Route)
    : null;
  const isOpeningSelectedSalon =
    isOpenPending || openingSalonId === selectedSalon?.id;

  useEffect(() => {
    if (!selectedSalonHref) return;

    router.prefetch(selectedSalonHref);
  }, [router, selectedSalonHref]);

  function selectSalon(salon: SalonSummary) {
    setOpeningSalonId(null);
    setSelectedSalonId(salon.id);
    setFocusedSalonId(salon.id);
  }

  function openSelectedSalon() {
    if (!selectedSalon || !selectedSalonHref) return;

    setOpeningSalonId(selectedSalon.id);
    startOpenTransition(() => {
      router.push(selectedSalonHref);
    });
  }

  return (
    <section
      id="map"
      className="overflow-hidden rounded-[28px] border border-[var(--rose-line)] bg-white shadow-[var(--shadow-card)]"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] px-4 py-4 sm:flex-row sm:items-center sm:px-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
            <Layers3 aria-hidden className="h-4 w-4" />
            Интерактивная карта
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-normal text-[var(--ink)]">
            Карта салонов рядом
          </h2>
          <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
            {originLabel} · {salons.length} точек · кластеры раскрываются при
            приближении
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            aria-label="Моя геопозиция"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-[var(--petal-line)] bg-white px-3 text-xs font-extrabold text-[var(--brand-plum)] shadow-[var(--shadow-subtle)] hover:-translate-y-0.5 hover:border-[var(--rose)] disabled:cursor-wait disabled:opacity-70"
            disabled={locationStatus === "loading"}
            onClick={onUseMyLocation}
            type="button"
          >
            {locationStatus === "loading" ? (
              <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed aria-hidden className="h-4 w-4" />
            )}
            {locationStatus === "loading" ? "Ищем..." : "Моя геопозиция"}
          </button>
          <span className="rounded-full bg-[var(--brand-fog)] px-3 py-1 text-xs font-extrabold text-[var(--brand-plum)]">
            OpenStreetMap
          </span>
          <span className="rounded-full bg-[#eef7f1] px-3 py-1 text-xs font-extrabold text-[#416c5a]">
            cluster zoom
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_410px]">
        <div className="min-w-0 border-b border-[var(--line)] lg:border-b-0 lg:border-r">
          <SalonMap
            focusedSalonId={focusedSalonId}
            onSelectSalon={selectSalon}
            origin={origin}
            salons={salons}
            selectedSalonId={selectedSalon?.id ?? null}
          />
        </div>

        <aside className="flex min-h-[520px] flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_48%,#fff8fb_100%)] p-4 lg:h-[640px] lg:p-5">
          {selectedSalon && visual ? (
            <div>
              <div className="rounded-[22px] border border-[var(--rose-line)] bg-white p-4 shadow-[var(--shadow-subtle)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
                      <Navigation aria-hidden className="h-4 w-4" />
                      Выбранный салон
                    </p>
                    <h3 className="mt-2 text-2xl font-black leading-tight text-[var(--ink)]">
                      {selectedSalon.name}
                    </h3>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--cream)] px-3 py-1 text-sm font-extrabold text-[var(--cocoa)]">
                    <Star aria-hidden className="h-4 w-4 fill-current" />
                    {selectedSalon.rating.toFixed(1)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm font-semibold text-[var(--muted)]">
                  <p className="flex items-start gap-2">
                    <MapPin
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rose)]"
                    />
                    <span>{selectedSalon.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-[var(--sage)]"
                    />
                    <span>
                      {visual.nextSlot} · {formatDistance(selectedSalon.distanceMeters)}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Scissors
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-[var(--rose-deep)]"
                    />
                    <span>{visual.specialty}</span>
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--blush-soft)] px-3 py-1 text-xs font-extrabold text-[var(--rose-deep)]">
                    {formatPriceTier(selectedSalon.priceTier)}
                  </span>
                  <span className="rounded-full bg-[var(--brand-fog)] px-3 py-1 text-xs font-extrabold text-[var(--brand-plum)]">
                    {formatReviewCount(selectedSalon.reviewCount)}
                  </span>
                  {visual.tags.slice(0, 2).map((tag) => (
                    <span
                      className="rounded-full border border-[var(--rose-line)] bg-white px-3 py-1 text-xs font-extrabold text-[var(--muted)]"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  aria-label={`Открыть запись в ${selectedSalon.name}`}
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-plum)] px-5 text-sm font-extrabold text-white shadow-[var(--shadow-cta)] disabled:cursor-wait disabled:opacity-80"
                  disabled={isOpeningSelectedSalon}
                  onClick={openSelectedSalon}
                  onFocus={() => selectedSalonHref && router.prefetch(selectedSalonHref)}
                  onMouseEnter={() =>
                    selectedSalonHref && router.prefetch(selectedSalonHref)
                  }
                  type="button"
                >
                  {isOpeningSelectedSalon ? "Открываем..." : "Открыть запись"}
                  {isOpeningSelectedSalon ? (
                    <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpRight aria-hidden className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--rose-line)] bg-white px-5 py-10 text-center">
              <p className="text-xl font-black text-[var(--ink)]">
                Нет салонов на карте
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Измените запрос или категорию, чтобы вернуть точки.
              </p>
            </div>
          )}

          <div className="mt-5 min-h-0 flex-1">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
                Точки на карте
              </p>
              <span className="text-xs font-bold text-[var(--muted)]">
                {salons.length}
              </span>
            </div>

            <div className="grid max-h-[312px] gap-2 overflow-y-auto pr-1 lg:max-h-[348px]">
              {salons.map((salon, index) => {
                const isSelected = selectedSalon?.id === salon.id;
                const itemVisual = getSalonVisual(salon);

                return (
                  <button
                    className={`group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[16px] border px-3 py-3 text-left transition ${
                      isSelected
                        ? "border-[var(--brand-plum)] bg-[var(--petal-soft)] shadow-[var(--shadow-subtle)]"
                        : "border-[var(--line)] bg-white hover:border-[var(--rose)]"
                    }`}
                    key={salon.id}
                    onClick={() => selectSalon(salon)}
                    type="button"
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ${
                        isSelected
                          ? "bg-[var(--brand-plum)] text-white"
                          : "bg-[var(--brand-fog)] text-[var(--brand-plum)]"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-[var(--ink)]">
                        {salon.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-semibold text-[var(--muted)]">
                        {formatDistance(salon.distanceMeters)} · {itemVisual.nextSlot}
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className={`h-4 w-4 ${
                        isSelected
                          ? "text-[var(--brand-plum)]"
                          : "text-[var(--soft)] group-hover:text-[var(--rose-deep)]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
