"use client";

import { useMemo, useState } from "react";
import {
  LoaderCircle,
  LocateFixed,
  MapPinned,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { SalonCard } from "@/components/marketplace/SalonCard";
import { SalonMapPanel } from "@/components/map/SalonMapPanel";
import {
  filterSalonCatalog,
  formatSalonCount,
  isWithinBishkekServiceArea,
  type CatalogOrigin,
} from "@/lib/domain/catalog-filters";
import type { SalonSummary } from "@/lib/domain/types";

const categories = ["Все", "Маникюр", "Волосы", "Брови", "Косметология", "Массаж"];

type LocationStatus = "idle" | "loading" | "ready" | "denied" | "outside";

export function SalonExplorer({
  salons,
  errorMessage,
}: {
  salons: SalonSummary[];
  errorMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");
  const [origin, setOrigin] = useState<CatalogOrigin | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");

  const visibleSalons = useMemo(
    () => filterSalonCatalog(salons, { query, category, origin }),
    [category, origin, query, salons],
  );
  const hasActiveFilters = Boolean(query.trim()) || category !== "Все";
  const originLabel =
    locationStatus === "ready"
      ? "От вашей геопозиции"
      : "От центра Бишкека";

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      setOrigin(null);
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextOrigin = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        if (!isWithinBishkekServiceArea(nextOrigin)) {
          setOrigin(null);
          setLocationStatus("outside");
          return;
        }

        setOrigin(nextOrigin);
        setLocationStatus("ready");
      },
      () => {
        setOrigin(null);
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function scrollToResults() {
    document.getElementById("salons")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <>
      <section className="py-6" id="search">
        <div className="max-w-3xl pt-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--rose-line)] bg-white px-3 py-1.5 text-xs font-extrabold text-[var(--rose-deep)] shadow-[var(--shadow-subtle)]">
            <span className="h-2 w-2 rounded-full bg-[var(--rose)]" />
            Бишкек · запись без ожидания ответа
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.04] tracking-normal text-[var(--ink)] sm:text-5xl lg:text-[56px]">
            Найдите свободное окно в салон рядом
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            Выберите услугу, мастера и время. nurAI показывает салоны на карте
            и создает запись без переписки в WhatsApp.
          </p>

          <div className="mt-6 grid gap-3 rounded-[20px] border border-[var(--rose-line)] bg-white p-3 shadow-[var(--shadow-subtle)] md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-[14px] bg-[var(--porcelain)] px-3 text-[var(--soft)]">
              <Search aria-hidden className="h-5 w-5 shrink-0 text-[var(--rose)]" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--soft)]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Маникюр, окрашивание, уход"
                value={query}
              />
            </label>
            <button
              type="button"
              onClick={useMyLocation}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--petal-line)] bg-[var(--brand-fog)] px-4 text-sm font-extrabold text-[var(--brand-plum)] hover:-translate-y-0.5 hover:border-[var(--rose)] disabled:cursor-wait disabled:opacity-70"
              disabled={locationStatus === "loading"}
            >
              {locationStatus === "loading" ? (
                <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed aria-hidden className="h-4 w-4" />
              )}
              {locationStatus === "loading" ? "Ищем рядом..." : "Рядом со мной"}
            </button>
            <button
              type="button"
              onClick={scrollToResults}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-plum)] px-5 text-sm font-extrabold text-white shadow-[var(--shadow-cta)]"
            >
              <SlidersHorizontal aria-hidden className="h-4 w-4" />
              Найти
            </button>
          </div>

          <div className="mt-3 min-h-5 text-sm font-semibold text-[var(--muted)]" aria-live="polite">
            {getLocationCopy(locationStatus)}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((item) => {
              const selected = item === category;

              return (
                <button
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    selected
                      ? "border-[var(--brand-plum)] bg-[var(--brand-plum)] text-white shadow-[var(--shadow-cta)]"
                      : "border-[var(--rose-line)] bg-white text-[var(--muted)] hover:border-[var(--rose)] hover:text-[var(--rose-deep)]"
                  }`}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <SalonMapPanel
        locationStatus={locationStatus}
        onUseMyLocation={useMyLocation}
        origin={origin ? { ...origin, label: "Вы здесь" } : null}
        originLabel={originLabel}
        salons={visibleSalons}
      />

      <section id="salons" className="mt-8">
        <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--line)] pb-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-[var(--rose-deep)]">
              <MapPinned aria-hidden className="h-4 w-4" />
              {formatSalonCount(visibleSalons.length)}
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-normal sm:text-3xl">
              Каталог салонов
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
            {originLabel}. Фильтры меняют и список, и карту одновременно.
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-[16px] border border-[var(--rose-line)] bg-[var(--blush-soft)] px-5 py-4 text-sm font-bold text-[var(--rose-deep)]">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="salon-list">
          {visibleSalons.length > 0 ? (
            visibleSalons.map((salon, index) => (
              <SalonCard
                key={salon.id}
                priority={index < 3}
                salon={salon}
              />
            ))
          ) : (
            <div className="rounded-[20px] border border-dashed border-[var(--rose-line)] bg-white px-6 py-12 text-center shadow-[var(--shadow-subtle)] md:col-span-2 xl:col-span-3">
              <p className="text-2xl font-black">
                {hasActiveFilters ? "Ничего не нашли" : "Салоны скоро появятся"}
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                {hasActiveFilters
                  ? "Попробуйте другой запрос или вернитесь к категории «Все»."
                  : "Когда Supabase вернет активные салоны, список и карта обновятся автоматически."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function getLocationCopy(status: LocationStatus) {
  if (status === "ready") return "Готово: ближайшие салоны подняты вверх.";
  if (status === "denied") {
    return "Нет доступа к геопозиции. Пока считаем расстояние от центра Бишкека.";
  }
  if (status === "outside") {
    return "Геопозиция вне зоны Бишкека. Показываем городской каталог без дальних скачков карты.";
  }

  return "По умолчанию расстояние считается от центра Бишкека.";
}
