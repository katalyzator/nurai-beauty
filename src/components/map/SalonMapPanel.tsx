"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import type { SalonSummary } from "@/lib/domain/types";
import { formatDistance } from "@/lib/geo/distance";
import { getSalonVisual } from "@/lib/domain/salon-visuals";

const SalonMap = dynamic(
  () => import("@/components/map/SalonMap").then((mod) => mod.SalonMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[438px] place-items-center rounded-[20px] bg-[var(--brand-fog)] text-sm font-bold text-[var(--brand-plum)]">
        Загружаем карту...
      </div>
    ),
  },
);

export function SalonMapPanel({ salons }: { salons: SalonSummary[] }) {
  const nearest = salons[0];
  const visual = nearest ? getSalonVisual(nearest) : null;

  return (
    <section className="overflow-hidden rounded-[24px] border border-[var(--rose-line)] bg-white shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--ink)]">Карта рядом</h2>
          <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
            Бишкек · {salons.length} салона в зоне
          </p>
        </div>
        <span className="rounded-full bg-[var(--brand-fog)] px-3 py-1 text-xs font-extrabold text-[var(--brand-plum)]">
          OSM
        </span>
      </div>

      <div className="border-y border-[var(--line)]">
        <SalonMap salons={salons} />
      </div>

      {nearest && visual ? (
        <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
              <Navigation aria-hidden className="h-4 w-4" />
              Ближайшее окно
            </p>
            <h3 className="mt-1 text-base font-extrabold text-[var(--ink)]">
              {nearest.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)]">
              <MapPin aria-hidden className="h-4 w-4" />
              {formatDistance(nearest.distanceMeters)} · {visual.nextSlot}
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-plum)] px-5 text-sm font-extrabold text-white shadow-[var(--shadow-cta)]"
            href={`/salons/${nearest.slug}`}
          >
            Забронировать
          </Link>
        </div>
      ) : null}
    </section>
  );
}
