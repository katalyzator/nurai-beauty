"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { SalonSummary } from "@/lib/domain/types";

export function SalonMap({ salons }: { salons: SalonSummary[] }) {
  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ??
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution =
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <MapContainer
      center={[42.8746, 74.6122]}
      zoom={13}
      className="h-[420px] w-full rounded-lg border border-stone-200"
    >
      <TileLayer attribution={attribution} url={tileUrl} />
      {salons.map((salon) => (
        <Marker key={salon.id} position={[salon.latitude, salon.longitude]}>
          <Popup>
            <strong>{salon.name}</strong>
            <br />
            {salon.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
