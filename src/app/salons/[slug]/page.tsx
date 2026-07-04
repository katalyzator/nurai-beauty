import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AtSign,
  Clock3,
  MapPin,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TelegramAuthButton } from "@/components/auth/TelegramAuthButton";
import { BookingForm } from "@/components/booking/BookingForm";
import { StaffCatalog } from "@/components/salon/StaffCatalog";
import { getSalonBySlug } from "@/lib/domain/salons";
import {
  formatPriceTier,
  formatReviewCount,
  getSalonVisual,
} from "@/lib/domain/salon-visuals";

export default async function SalonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  if (!salon) notFound();

  const visual = getSalonVisual(salon);

  return (
    <main className="beauty-shell min-h-screen px-3 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="reveal-in sticky top-3 z-40 flex min-h-16 items-center justify-between gap-4 rounded-full glass glass-edge px-3 py-2 sm:px-5">
          <Link
            href="/"
            className="btn-glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Назад
          </Link>
          <div className="hidden sm:block">
            <BrandLogo compact />
          </div>
          <TelegramAuthButton
            botUsername={process.env.TELEGRAM_BOT_USERNAME}
            compact
          />
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
          <div className="grid gap-6">
            <div className="reveal-in overflow-hidden rounded-[28px] glass glass-edge">
              <div className="relative min-h-[420px]">
                <Image
                  src={visual.imageUrl}
                  alt={visual.imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 64vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(50,24,18,0.76)] via-[rgba(104,24,41,0.18)] to-transparent" />
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/92 px-4 py-2 text-sm font-extrabold text-[var(--rose-deep)] shadow-sm backdrop-blur">
                    {visual.signal}
                  </span>
                  <span className="rounded-full bg-white/92 px-4 py-2 text-sm font-extrabold text-[var(--cocoa)] shadow-sm backdrop-blur">
                    {formatPriceTier(salon.priceTier)}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--blush)]">
                    <Sparkles aria-hidden className="h-4 w-4" />
                    {visual.specialty}
                  </p>
                  <h1 className="mt-3 max-w-4xl font-display text-5xl font-semibold leading-[0.96] sm:text-6xl">
                    {salon.name}
                  </h1>
                  <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-white/90">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/16 px-3 py-1.5 backdrop-blur">
                      <MapPin aria-hidden className="h-4 w-4" />
                      {salon.address}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/16 px-3 py-1.5 backdrop-blur">
                      <Star aria-hidden className="h-4 w-4 fill-[var(--cream)] text-[var(--cream)]" />
                      {salon.rating.toFixed(1)} · {formatReviewCount(salon.reviewCount)}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/16 px-3 py-1.5 backdrop-blur">
                      <Clock3 aria-hidden className="h-4 w-4" />
                      {visual.nextSlot}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <ServicesPanel salon={salon} />
            <StaffCatalog salon={salon} />
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-5 lg:self-start">
            <BookingForm salon={salon} />
            <ContactsPanel salon={salon} />
          </aside>
        </section>
      </div>
    </main>
  );
}

function ServicesPanel({
  salon,
}: {
  salon: Awaited<ReturnType<typeof getSalonBySlug>> extends infer T
    ? NonNullable<T>
    : never;
}) {
  return (
    <div className="reveal-in rounded-[24px] glass glass-edge p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
            Меню услуг
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Что можно забронировать
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
          {salon.description ??
            "Выберите услугу и время. Салон получит заявку без длинной переписки."}
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {salon.services.map((service) => (
          <article
            key={service.id}
            className="lift grid gap-4 rounded-[18px] border border-[var(--glass-edge)] bg-white/55 p-4 backdrop-blur transition-[transform,box-shadow] duration-200 md:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
                {service.category}
              </p>
              <h3 className="mt-1 text-lg font-extrabold text-[var(--ink)]">
                {service.name}
              </h3>
              {service.description ? (
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {service.description}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <span className="rounded-full bg-[var(--blush-soft)] px-3 py-1.5 text-sm font-extrabold text-[var(--rose-deep)]">
                {service.durationMinutes} мин
              </span>
              <span className="text-lg font-extrabold text-[var(--ink)]">
                {service.priceKgs} сом
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ContactsPanel({
  salon,
}: {
  salon: Awaited<ReturnType<typeof getSalonBySlug>> extends infer T
    ? NonNullable<T>
    : never;
}) {
  return (
    <div className="rounded-[24px] glass p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
        Контакты
      </p>
      <div className="mt-4 grid gap-3 text-sm font-bold text-[var(--muted)]">
        {salon.phone ? (
          <a className="flex items-center gap-2" href={`tel:${salon.phone}`}>
            <Phone aria-hidden className="h-4 w-4 text-[var(--rose)]" />
            {salon.phone}
          </a>
        ) : null}
        {salon.instagramUrl ? (
          <a
            className="flex items-center gap-2"
            href={salon.instagramUrl}
            rel="noreferrer"
            target="_blank"
          >
            <AtSign aria-hidden className="h-4 w-4 text-[var(--rose)]" />
            Instagram
          </a>
        ) : null}
      </div>
    </div>
  );
}
