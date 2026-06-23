import Link from "next/link";
import { Suspense } from "react";
import { CalendarClock, Search, Sparkles } from "lucide-react";
import type { SalonSummary } from "@/lib/domain/types";
import { TelegramAuthButton } from "@/components/auth/TelegramAuthButton";
import { LocationButton } from "@/components/map/LocationButton";
import { SalonMapPanel } from "@/components/map/SalonMapPanel";
import { SalonCard } from "@/components/marketplace/SalonCard";
import { getSalonVisual } from "@/lib/domain/salon-visuals";

const categories = ["Маникюр", "Волосы", "Брови", "Косметология"];

export function SalonSearchShell({
  salons,
  errorMessage,
}: {
  salons: SalonSummary[];
  errorMessage?: string;
}) {
  const featuredSalon = salons[0];
  const featuredVisual = featuredSalon ? getSalonVisual(featuredSalon) : null;
  const averageRating =
    salons.length > 0
      ? salons.reduce((total, salon) => total + salon.rating, 0) / salons.length
      : 0;

  return (
    <main className="beauty-shell min-h-screen px-3 pb-8 pt-4 text-[var(--ink)] sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--rose-line)]">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--rose-line)] bg-white font-display text-2xl font-bold leading-none text-[var(--rose-deep)] shadow-[var(--shadow-subtle)]">
              N
            </span>
            <span className="font-display text-[32px] font-bold leading-none">
              NurAI
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-bold text-[var(--muted)] md:flex">
            <a
              className="rounded-full bg-[var(--blush)] px-4 py-2 text-[var(--rose-deep)]"
              href="#salons"
            >
              Салоны
            </a>
            <a className="rounded-full px-4 py-2 hover:text-[var(--ink)]" href="#map">
              Карта
            </a>
            <Link
              className="rounded-full px-4 py-2 hover:text-[var(--ink)]"
              href="/merchant"
            >
              Для салонов
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <TelegramAuthButton
              botUsername={process.env.TELEGRAM_BOT_USERNAME}
              compact
            />
            <Link
              href="#salons"
              className="hidden min-h-11 items-center rounded-full bg-[var(--rose)] px-5 text-sm font-extrabold text-white shadow-[0_16px_34px_rgba(232,93,143,0.24)] hover:-translate-y-0.5 sm:inline-flex"
            >
              Записаться
            </Link>
          </div>
        </header>

        <section className="grid gap-6 py-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.72fr)] lg:items-stretch">
          <div className="flex flex-col justify-center py-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--rose-line)] bg-white px-3 py-2 text-xs font-extrabold text-[var(--rose-deep)] shadow-[var(--shadow-subtle)]">
              <span className="h-2 w-2 rounded-full bg-[var(--rose)] shadow-[0_0_0_6px_rgba(232,93,143,0.14)]" />
              Бишкек · ближайшие окна сегодня
            </div>

            <h1 className="mt-5 max-w-4xl font-display text-[50px] font-semibold leading-[0.95] text-[var(--ink)] sm:text-[72px] lg:text-[86px]">
              Запись в салон без ожидания ответа
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              NurAI показывает свободное время, расстояние, отзывы и услуги в
              одном месте. Клиент выбирает слот, салон получает запись без
              переписки.
            </p>

            <div className="mt-7 grid gap-3 rounded-[24px] border border-[var(--rose-line)] bg-white/86 p-3 shadow-[var(--shadow-soft)] backdrop-blur md:grid-cols-[minmax(0,1fr)_auto_auto] md:rounded-full">
              <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-full px-3 text-[var(--soft)]">
                <Search aria-hidden className="h-5 w-5 shrink-0 text-[var(--rose)]" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--soft)]"
                  placeholder="Маникюр, окрашивание, массаж"
                />
              </label>
              <Suspense
                fallback={<div className="h-12 rounded-full bg-[var(--blush-soft)]" />}
              >
                <LocationButton />
              </Suspense>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--rose)] px-6 text-sm font-extrabold text-white shadow-[0_16px_34px_rgba(232,93,143,0.22)]"
                href="#salons"
              >
                Найти время
              </a>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-bold text-white">
                Сегодня
              </span>
              {categories.map((category) => (
                <button
                  className="rounded-full border border-[var(--rose-line)] bg-white px-4 py-2 text-sm font-bold text-[var(--muted)] hover:border-[var(--rose)] hover:text-[var(--rose-deep)]"
                  key={category}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-[28px] border border-[var(--rose-line)] bg-white p-4 shadow-[var(--shadow-card)] lg:self-center">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
                  <CalendarClock aria-hidden className="h-4 w-4" />
                  Ближайшее окно
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-[var(--ink)]">
                  {featuredSalon?.name ?? "Салоны подключаются"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {featuredSalon && featuredVisual
                    ? `${featuredVisual.nextSlot} · ${featuredVisual.specialty}`
                    : "После подключения Supabase здесь появятся реальные окна."}
                </p>
              </div>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--cream)] text-sm font-black text-[#8f5c18]">
                {featuredSalon ? featuredSalon.rating.toFixed(1) : "4.8"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {["12:30", "14:00", "16:15", "18:40"].map((slot, index) => (
                <Link
                  className={`grid min-h-12 place-items-center rounded-[8px] border text-sm font-extrabold ${
                    index === 0
                      ? "border-[var(--rose)] bg-[var(--rose)] text-white"
                      : "border-[var(--rose-line)] bg-white text-[var(--ink)]"
                  }`}
                  href={featuredSalon ? `/salons/${featuredSalon.slug}` : "#salons"}
                  key={slot}
                >
                  {slot}
                </Link>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-5">
              <Metric label="салонов" value={String(salons.length)} />
              <Metric
                label="рейтинг"
                value={averageRating ? averageRating.toFixed(1) : "—"}
              />
              <Metric label="ответ" value="без чата" />
            </div>
          </aside>
        </section>

        <section
          id="salons"
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_520px]"
        >
          <div className="min-w-0">
            <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
                  <Sparkles aria-hidden className="h-4 w-4" />
                  Подходящие салоны
                </p>
                <h2 className="mt-1 text-3xl font-extrabold tracking-[-0.02em]">
                  Рядом и с понятным временем
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                Сначала показываем тех, кто ближе и может принять без длинной
                переписки.
              </p>
            </div>

            {errorMessage ? (
              <div className="mb-4 rounded-[18px] border border-[var(--rose-line)] bg-[var(--blush-soft)] px-5 py-4 text-sm font-bold text-[var(--rose-deep)]">
                {errorMessage}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              {salons.length > 0 ? (
                salons.map((salon, index) => (
                  <SalonCard
                    key={salon.id}
                    priority={index < 2}
                    salon={salon}
                  />
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-[var(--rose-line)] bg-white/80 px-6 py-12 text-center shadow-[var(--shadow-subtle)] md:col-span-2">
                  <p className="font-display text-3xl font-semibold">
                    Скоро здесь будут салоны
                  </p>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                    Когда Supabase вернет активные салоны, список и карта
                    обновятся автоматически.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside id="map" className="lg:sticky lg:top-5 lg:self-start">
            <SalonMapPanel salons={salons} />
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--rose-line)] bg-[var(--porcelain)] px-4 py-3">
      <p className="font-display text-3xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-xs font-bold text-[var(--muted)]">{label}</p>
    </div>
  );
}
