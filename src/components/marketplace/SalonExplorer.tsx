"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  LoaderCircle,
  LocateFixed,
  MapPinned,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";
import { SalonCard } from "@/components/marketplace/SalonCard";
import { SalonMapPanel } from "@/components/map/SalonMapPanel";
import {
  filterSalonCatalog,
  formatSalonCount,
  isWithinBishkekServiceArea,
  type CatalogOrigin,
} from "@/lib/domain/catalog-filters";
import { getSalonVisual } from "@/lib/domain/salon-visuals";
import type { SalonSummary } from "@/lib/domain/types";

const categories = ["Все", "Маникюр", "Волосы", "Брови", "Косметология", "Массаж"];
const priceTiers = [
  { value: null as number | null, label: "Любая" },
  { value: 1, label: "Эконом" },
  { value: 2, label: "Комфорт" },
  { value: 3, label: "Премиум" },
  { value: 4, label: "Luxe" },
];
const ratingOptions = [
  { value: 0, label: "Любой" },
  { value: 4.5, label: "4.5+" },
  { value: 4.8, label: "4.8+" },
];

// Curated high-quality beauty / salon photography for the hero slider.
const HERO_PHOTOS = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=90",
  "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1400&q=90",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1400&q=90",
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1400&q=90",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=90",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1400&q=90",
];

type LocationStatus = "idle" | "loading" | "ready" | "denied" | "outside";
type SortMode = "distance" | "rating";

export function SalonExplorer({
  salons,
  errorMessage,
}: {
  salons: SalonSummary[];
  errorMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");
  const [priceTier, setPriceTier] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortMode>("distance");
  const [origin, setOrigin] = useState<CatalogOrigin | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");

  const baseSalons = useMemo(
    () => filterSalonCatalog(salons, { query, category, origin }),
    [category, origin, query, salons],
  );
  const finalSalons = useMemo(() => {
    let list = baseSalons;
    if (priceTier) list = list.filter((salon) => salon.priceTier === priceTier);
    if (minRating) list = list.filter((salon) => salon.rating >= minRating);
    return [...list].sort((a, b) =>
      sort === "rating"
        ? b.rating - a.rating
        : (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity),
    );
  }, [baseSalons, priceTier, minRating, sort]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    category !== "Все" ||
    priceTier !== null ||
    minRating > 0;
  const originLabel =
    locationStatus === "ready" ? "От вашей геопозиции" : "От центра Бишкека";
  const marqueeNames =
    salons.length > 0
      ? salons.map((salon) => salon.name)
      : ["Onstudio", "InStyle", "Cheguevara", "Lash Book", "Amor Nail Studio"];

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

  function resetFilters() {
    setQuery("");
    setCategory("Все");
    setPriceTier(null);
    setMinRating(0);
    setSort("distance");
  }

  return (
    <>
      <section className="relative pb-4 pt-3 sm:pt-4" id="search">
        <h1 className="sr-only">
          nurAI — запись в салоны красоты Бишкека без ожидания ответа
        </h1>

        <HeroSalonSlider salons={salons} />

        {/* trusted salons marquee */}
        <div className="marquee-wrap mt-6 overflow-hidden rounded-full glass px-1 py-2.5">
          <div className="marquee items-center text-sm font-bold text-[var(--muted)]">
            {[...marqueeNames, ...marqueeNames].map((name, index) => (
              <span key={`${name}-${index}`} className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--rose)]" />
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLORE — filters (left) live next to the map (right), equal height */}
      <section
        id="explore"
        className="mt-8 grid scroll-mt-24 gap-5 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-stretch"
      >
        <FiltersPanel
          category={category}
          count={finalSalons.length}
          hasActiveFilters={hasActiveFilters}
          locationCopy={getLocationCopy(locationStatus)}
          locationStatus={locationStatus}
          minRating={minRating}
          onCategory={setCategory}
          onMinRating={setMinRating}
          onPriceTier={setPriceTier}
          onQuery={setQuery}
          onReset={resetFilters}
          onSort={setSort}
          onUseMyLocation={useMyLocation}
          priceTier={priceTier}
          query={query}
          sort={sort}
        />

        <SalonMapPanel
          locationStatus={locationStatus}
          onUseMyLocation={useMyLocation}
          origin={origin ? { ...origin, label: "Вы здесь" } : null}
          originLabel={originLabel}
          salons={finalSalons}
        />
      </section>

      <section id="salons" className="mt-10 scroll-mt-24">
        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-[var(--line)] pb-5 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[var(--rose-deep)]">
              <MapPinned aria-hidden className="h-4 w-4" />
              {formatSalonCount(finalSalons.length)}
            </p>
            <h2 className="mt-1.5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Каталог салонов
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
            {originLabel}. Фильтры слева меняют и список, и карту одновременно.
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-[18px] glass px-5 py-4 text-sm font-bold text-[var(--rose-deep)]">
            {errorMessage}
          </div>
        ) : null}

        <div
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          data-testid="salon-list"
        >
          {finalSalons.length > 0 ? (
            finalSalons.map((salon, index) => (
              <SalonCard key={salon.id} priority={index < 3} salon={salon} />
            ))
          ) : (
            <div className="rounded-[24px] glass px-6 py-14 text-center md:col-span-2 xl:col-span-3">
              <p className="font-display text-3xl font-semibold">
                {hasActiveFilters ? "Ничего не нашли" : "Салоны скоро появятся"}
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                {hasActiveFilters
                  ? "Попробуйте другой запрос или сбросьте фильтры."
                  : "Когда Supabase вернет активные салоны, список и карта обновятся автоматически."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ---- Left filter rail — stretches to the same height as the map ---- */
function FiltersPanel({
  category,
  count,
  hasActiveFilters,
  locationCopy,
  locationStatus,
  minRating,
  onCategory,
  onMinRating,
  onPriceTier,
  onQuery,
  onReset,
  onSort,
  onUseMyLocation,
  priceTier,
  query,
  sort,
}: {
  category: string;
  count: number;
  hasActiveFilters: boolean;
  locationCopy: string;
  locationStatus: LocationStatus;
  minRating: number;
  onCategory: (value: string) => void;
  onMinRating: (value: number) => void;
  onPriceTier: (value: number | null) => void;
  onQuery: (value: string) => void;
  onReset: () => void;
  onSort: (value: SortMode) => void;
  onUseMyLocation: () => void;
  priceTier: number | null;
  query: string;
  sort: SortMode;
}) {
  const pill = (active: boolean) =>
    `rounded-full px-3.5 py-2 text-sm font-bold transition ${
      active
        ? "btn-primary text-white"
        : "border border-[var(--glass-edge)] bg-white/55 text-[var(--muted)] backdrop-blur hover:bg-white/80 hover:text-[var(--rose-deep)]"
    }`;

  return (
    <aside className="reveal-in flex flex-col gap-5 rounded-[24px] glass glass-edge p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
          <SlidersHorizontal aria-hidden className="h-4 w-4" />
          Фильтры
        </p>
        <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-extrabold text-[var(--brand-plum)] backdrop-blur">
          {count} салонов
        </span>
      </div>

      <label className="flex min-h-12 items-center gap-3 rounded-[14px] border border-[var(--glass-edge)] bg-white/70 px-3.5 text-[var(--soft)] backdrop-blur transition focus-within:border-[var(--rose)]">
        <Search aria-hidden className="h-5 w-5 shrink-0 text-[var(--rose)]" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--soft)]"
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Маникюр, окрашивание, уход"
          value={query}
        />
      </label>

      <FilterGroup label="Категория">
        {categories.map((item) => (
          <button
            className={pill(item === category)}
            key={item}
            onClick={() => onCategory(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup label="Цена">
        {priceTiers.map((tier) => (
          <button
            className={pill(priceTier === tier.value)}
            key={tier.label}
            onClick={() => onPriceTier(tier.value)}
            type="button"
          >
            {tier.label}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup label="Рейтинг">
        {ratingOptions.map((option) => (
          <button
            className={pill(minRating === option.value)}
            key={option.label}
            onClick={() => onMinRating(option.value)}
            type="button"
          >
            {option.value > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star aria-hidden className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
                {option.label}
              </span>
            ) : (
              option.label
            )}
          </button>
        ))}
      </FilterGroup>

      <FilterGroup label="Сортировка">
        <button
          className={pill(sort === "distance")}
          onClick={() => onSort("distance")}
          type="button"
        >
          Ближе
        </button>
        <button
          className={pill(sort === "rating")}
          onClick={() => onSort("rating")}
          type="button"
        >
          По рейтингу
        </button>
      </FilterGroup>

      <div className="mt-auto grid gap-2 border-t border-[var(--line)] pt-4">
        <button
          type="button"
          onClick={onUseMyLocation}
          className="btn-glass inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold disabled:cursor-wait disabled:opacity-70"
          disabled={locationStatus === "loading"}
        >
          {locationStatus === "loading" ? (
            <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed aria-hidden className="h-4 w-4" />
          )}
          {locationStatus === "loading" ? "Ищем рядом..." : "Рядом со мной"}
        </button>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full text-sm font-extrabold text-[var(--rose-deep)] transition hover:text-[var(--brand-plum)]"
          >
            <RotateCcw aria-hidden className="h-4 w-4" />
            Сбросить фильтры
          </button>
        ) : (
          <p className="px-1 text-xs font-semibold leading-5 text-[var(--muted)]" aria-live="polite">
            {locationCopy}
          </p>
        )}
      </div>
    </aside>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/* ---- Auto-rotating hero slider with curated, full-bleed photography ---- */
function HeroSalonSlider({ salons }: { salons: SalonSummary[] }) {
  const items = useMemo(() => salons.slice(0, 6), [salons]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [items.length, paused]);

  if (items.length === 0) return <div className="hidden lg:block" />;

  return (
    <div
      className="relative z-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-[30px] border border-white/15 shadow-[var(--shadow-soft)]">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.3,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((salon, slideIndex) => {
            const v = getSalonVisual(salon);
            const photo = HERO_PHOTOS[slideIndex % HERO_PHOTOS.length];
            return (
              <Link
                key={salon.id}
                href={`/salons/${salon.slug}`}
                className="group relative block h-[clamp(24rem,64vh,46rem)] w-full shrink-0"
              >
                <Image
                  src={photo}
                  alt={`${salon.name} — ${v.specialty}`}
                  fill
                  priority={slideIndex === 0}
                  sizes="(min-width: 1024px) 46vw, 92vw"
                  className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(38,12,22,0.86)] via-[rgba(38,12,22,0.18)] to-[rgba(38,12,22,0.12)]" />

                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-extrabold text-white backdrop-blur">
                  <Star aria-hidden className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
                  {salon.rating.toFixed(1)}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--gold-2)]">
                    <Sparkles aria-hidden className="h-3.5 w-3.5" />
                    {v.specialty}
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                    {salon.name}
                  </h3>
                  <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-white/80">
                    <span>{v.nextSlot}</span>
                    <span className="inline-flex items-center gap-1 text-white">
                      Открыть запись
                      <ArrowUpRight
                        aria-hidden
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* dots overlaid on the image */}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-2">
          {items.map((salon, dotIndex) => (
            <button
              key={salon.id}
              type="button"
              aria-label={`Показать ${salon.name}`}
              onClick={() => setIndex(dotIndex)}
              className={`pointer-events-auto h-2 rounded-full transition-all duration-300 ${
                dotIndex === index
                  ? "w-7 bg-[var(--gold)]"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
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
