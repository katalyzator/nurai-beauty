"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LocationButton() {
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
        router.push(`/?${next.toString()}`);
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={useMyLocation}
        className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-950"
      >
        {status === "loading" ? "Finding you..." : "Show nearest salons"}
      </button>
      {status === "denied" && (
        <span className="text-sm text-stone-500">
          Location unavailable. Showing central Bishkek.
        </span>
      )}
    </div>
  );
}
