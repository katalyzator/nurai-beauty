import Link from "next/link";
import type { SalonSummary } from "@/lib/domain/types";
import { formatDistance } from "@/lib/geo/distance";

export function SalonCard({ salon }: { salon: SalonSummary }) {
  return (
    <Link
      href={`/salons/${salon.slug}`}
      className="block rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition hover:border-stone-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-950">
            {salon.name}
          </h2>
          <p className="mt-1 text-sm text-stone-600">{salon.address}</p>
          <p className="mt-2 text-sm text-stone-700">
            {formatDistance(salon.distanceMeters)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-stone-950">
            {salon.rating.toFixed(1)}
          </p>
          <p className="text-xs text-stone-500">{salon.reviewCount} reviews</p>
        </div>
      </div>
    </Link>
  );
}
