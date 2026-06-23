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
      className="group overflow-hidden rounded-[20px] border border-[var(--rose-line)] bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--rose)] hover:shadow-[0_28px_70px_rgba(191,75,119,0.16)]"
    >
      <div className="relative h-36 overflow-hidden bg-[var(--blush-soft)]">
        <Image
          src={visual.imageUrl}
          alt={visual.imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 768px) 46vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3 text-xs font-extrabold text-[var(--rose-deep)]">
          <span>{formatDistance(salon.distanceMeters)}</span>
          <span>
            {salon.rating.toFixed(1)} · {formatReviewCount(salon.reviewCount)}
          </span>
        </div>

        <h3 className="mt-2 text-lg font-extrabold leading-tight text-[var(--ink)]">
          {salon.name}
        </h3>
        <p className="mt-2 min-h-10 text-sm leading-5 text-[var(--muted)]">
          {visual.specialty}. {visual.responseTime}.
        </p>

        <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
          <p className="flex items-center gap-2">
            <MapPin aria-hidden className="h-4 w-4 text-[var(--rose)]" />
            <span className="truncate">{salon.address}</span>
          </p>
          <p className="flex items-center gap-2">
            <Clock3 aria-hidden className="h-4 w-4 text-[var(--sage)]" />
            <span>{visual.nextSlot}</span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--blush-soft)] px-3 py-1 text-xs font-bold text-[var(--rose-deep)]">
            {formatPriceTier(salon.priceTier)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cream)] px-3 py-1 text-xs font-bold text-[#8f5c18]">
            <Star aria-hidden className="h-3.5 w-3.5 fill-current" />
            {salon.rating.toFixed(1)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
          <span className="text-sm font-extrabold text-[var(--ink)]">
            от {salon.priceTier * 300 + 300} сом
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-extrabold text-white">
            Записаться
            <ArrowUpRight aria-hidden className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
