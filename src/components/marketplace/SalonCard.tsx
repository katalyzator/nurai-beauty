import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, Star } from "lucide-react";
import type { SalonSummary } from "@/lib/domain/types";
import { formatDistance } from "@/lib/geo/distance";
import {
  formatPriceTier,
  formatReviewCount,
  getSalonVisual,
} from "@/lib/domain/salon-visuals";

export function SalonCard({
  salon,
  priority = false,
}: {
  salon: SalonSummary;
  priority?: boolean;
}) {
  const visual = getSalonVisual(salon);

  return (
    <Link
      href={`/salons/${salon.slug}`}
      className="group glow-hover relative flex flex-col overflow-hidden rounded-[24px] glass glass-edge"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={visual.imageUrl}
          alt={visual.imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 768px) 46vw, 100vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(43,18,30,0.62)] via-transparent to-transparent" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-xs font-extrabold text-[var(--rose-deep)] shadow-sm backdrop-blur">
          {formatDistance(salon.distanceMeters)}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-extrabold text-[var(--cocoa)] shadow-sm backdrop-blur">
          <Star aria-hidden className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
          {salon.rating.toFixed(1)}
        </span>
        <h3 className="absolute bottom-3 left-4 right-4 font-display text-2xl font-semibold leading-tight text-white drop-shadow">
          {salon.name}
        </h3>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-extrabold text-[var(--rose-deep)]">
          {formatReviewCount(salon.reviewCount)}
        </p>
        <p className="mt-1.5 min-h-10 text-sm leading-5 text-[var(--muted)]">
          {visual.specialty}. {visual.responseTime}.
        </p>

        <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
          <p className="flex items-center gap-2">
            <MapPin aria-hidden className="h-4 w-4 shrink-0 text-[var(--rose)]" />
            <span className="truncate">{salon.address}</span>
          </p>
          <p className="flex items-center gap-2">
            <Clock3 aria-hidden className="h-4 w-4 shrink-0 text-[var(--sage)]" />
            <span>{visual.nextSlot}</span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--blush-soft)] px-3 py-1 text-xs font-bold text-[var(--rose-deep)]">
            {formatPriceTier(salon.priceTier)}
          </span>
          <span className="chip-mint inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold">
            {visual.tags?.[0] ?? "Запись онлайн"}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-4">
          <span className="text-sm font-extrabold text-[var(--ink)]">
            от {salon.priceTier * 300 + 300} сом
          </span>
          <span className="btn-primary inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-extrabold text-white">
            Записаться
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
