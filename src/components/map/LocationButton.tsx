"use client";

import { LoaderCircle, LocateFixed } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LocationButton() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "denied">("idle");

  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = new URLSearchParams(searchParams.toString());
        next.set("lat", String(position.coords.latitude));
        next.set("lng", String(position.coords.longitude));
        router.push(`${pathname}?${next.toString()}`);
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={useMyLocation}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--rose-line)] bg-[var(--blush-soft)] px-4 text-sm font-extrabold text-[var(--rose-deep)] hover:-translate-y-0.5 hover:border-[var(--rose)]"
      >
        {status === "loading" ? (
          <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <LocateFixed aria-hidden className="h-4 w-4" />
        )}
        {status === "loading" ? "Ищем рядом..." : "Рядом со мной"}
      </button>
      {status === "denied" && (
        <span className="max-w-52 text-xs font-semibold text-[var(--muted)]">
          Показываем центр Бишкека.
        </span>
      )}
    </div>
  );
}
