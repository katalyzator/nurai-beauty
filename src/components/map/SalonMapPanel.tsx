"use client";

import dynamic from "next/dynamic";
import type { SalonSummary } from "@/lib/domain/types";

const SalonMap = dynamic(
  () => import("@/components/map/SalonMap").then((mod) => mod.SalonMap),
  { ssr: false },
);

export function SalonMapPanel({ salons }: { salons: SalonSummary[] }) {
  return <SalonMap salons={salons} />;
}
