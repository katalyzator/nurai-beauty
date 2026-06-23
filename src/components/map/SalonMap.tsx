"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { SalonSummary } from "@/lib/domain/types";
import { formatDistance } from "@/lib/geo/distance";

function createMarkerIcon(index: number) {
  return L.divIcon({
    className: "",
    html: `<div class="nurai-marker ${index === 0 ? "is-nearest" : ""}">${index + 1}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  });
}

export function SalonMap({ salons }: { salons: SalonSummary[] }) {
  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ??
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution =
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const center = salons[0]
    ? ([salons[0].latitude, salons[0].longitude] as [number, number])
    : ([42.8746, 74.6122] as [number, number]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-[438px] w-full"
    >
      <TileLayer attribution={attribution} url={tileUrl} />
      {salons.map((salon, index) => (
        <Marker
          icon={createMarkerIcon(index)}
          key={salon.id}
          position={[salon.latitude, salon.longitude]}
        >
          <Popup>
            <div className="min-w-44">
              <p className="text-sm font-black text-[var(--ink)]">
                {salon.name}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">{salon.address}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[var(--rose-deep)]">
                  {formatDistance(salon.distanceMeters)}
                </span>
                <Link
                  href={`/salons/${salon.slug}`}
                  className="rounded-full bg-[var(--brand-plum)] px-3 py-1.5 text-xs font-bold text-white"
                >
                  Открыть
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
