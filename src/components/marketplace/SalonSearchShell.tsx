import Link from "next/link";
import { Suspense } from "react";
import { MapPinned, Search, SlidersHorizontal } from "lucide-react";
import type { SalonSummary } from "@/lib/domain/types";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TelegramAuthButton } from "@/components/auth/TelegramAuthButton";
import { NurAiAssistant } from "@/components/assistant/NurAiAssistant";
import { LocationButton } from "@/components/map/LocationButton";
import { SalonMapPanel } from "@/components/map/SalonMapPanel";
import { SalonCard } from "@/components/marketplace/SalonCard";

const categories = ["Маникюр", "Волосы", "Брови", "Косметология"];

export function SalonSearchShell({
  salons,
  errorMessage,
}: {
  salons: SalonSummary[];
  errorMessage?: string;
}) {
  return (
    <main className="beauty-shell min-h-screen px-3 pb-8 pt-4 text-[var(--ink)] sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--line)]">
          <BrandLogo />

          <nav className="hidden items-center gap-1 text-sm font-bold text-[var(--muted)] md:flex">
            <a
              className="rounded-full px-4 py-2 text-[var(--ink)] hover:bg-white"
              href="#salons"
            >
              Салоны
            </a>
            <a className="rounded-full px-4 py-2 hover:bg-white hover:text-[var(--ink)]" href="#map">
              Карта
            </a>
            <a
              className="rounded-full px-4 py-2 hover:bg-white hover:text-[var(--ink)]"
              href="#assistant"
            >
              AI запись
            </a>
            <Link
              className="rounded-full px-4 py-2 hover:bg-white hover:text-[var(--ink)]"
              href="/merchant"
            >
              Для салонов
            </Link>
          </nav>

          <TelegramAuthButton
            botUsername={process.env.TELEGRAM_BOT_USERNAME}
            compact
          />
        </header>

        <section className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
          <div className="pt-2">
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
                  placeholder="Маникюр, окрашивание, уход"
                />
              </label>
              <Suspense
                fallback={<div className="h-12 rounded-full bg-[var(--brand-fog)]" />}
              >
                <LocationButton />
              </Suspense>
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-plum)] px-5 text-sm font-extrabold text-white shadow-[var(--shadow-cta)]"
                href="#salons"
              >
                <SlidersHorizontal aria-hidden className="h-4 w-4" />
                Найти
              </a>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
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

          <div id="assistant">
            <NurAiAssistant />
          </div>
        </section>

        <section
          id="salons"
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_500px]"
        >
          <div className="min-w-0">
            <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--line)] pb-4 md:flex-row md:items-end">
              <div>
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-[var(--rose-deep)]">
                  <MapPinned aria-hidden className="h-4 w-4" />
                  {salons.length ? `${salons.length} салона` : "Каталог"}
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-normal sm:text-3xl">
                  Салоны с понятным временем
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                Список можно открыть как обычный web marketplace или внутри
                Telegram Mini App. Карта использует OpenStreetMap.
              </p>
            </div>

            {errorMessage ? (
              <div className="mb-4 rounded-[16px] border border-[var(--rose-line)] bg-[var(--blush-soft)] px-5 py-4 text-sm font-bold text-[var(--rose-deep)]">
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
                <div className="rounded-[20px] border border-dashed border-[var(--rose-line)] bg-white px-6 py-12 text-center shadow-[var(--shadow-subtle)] md:col-span-2">
                  <p className="text-2xl font-black">Салоны скоро появятся</p>
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
