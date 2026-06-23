"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
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

function createOriginIcon() {
  return L.divIcon({
    className: "",
    html: '<div class="nurai-origin-marker"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

export function SalonMap({
  origin,
  salons,
}: {
  origin?: { latitude: number; longitude: number; label: string } | null;
  salons: SalonSummary[];
}) {
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
      <MapAutoFit origin={origin} salons={salons} />
      {origin ? (
        <Marker
          icon={createOriginIcon()}
          position={[origin.latitude, origin.longitude]}
        >
          <Popup>{origin.label}</Popup>
        </Marker>
      ) : null}
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

function MapAutoFit({
  origin,
  salons,
}: {
  origin?: { latitude: number; longitude: number; label: string } | null;
  salons: SalonSummary[];
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = salons.map((salon) => [
      salon.latitude,
      salon.longitude,
    ]);
    if (origin) points.push([origin.latitude, origin.longitude]);

    if (points.length === 0) {
      map.setView([42.8746, 74.6122], 12);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }

    map.fitBounds(points, {
      padding: [34, 34],
      maxZoom: 14,
    });
  }, [map, origin, salons]);

  return null;
}
