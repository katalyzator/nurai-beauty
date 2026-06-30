"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { SalonSummary } from "@/lib/domain/types";
import { formatDistance } from "@/lib/geo/distance";
import {
  createCoordinateClusters,
  type MapCluster,
} from "@/lib/geo/map-clusters";

function createMarkerIcon(index: number, isSelected: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="nurai-marker ${index === 0 ? "is-nearest" : ""} ${isSelected ? "is-selected" : ""}">${index + 1}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -16],
  });
}

function createClusterIcon(count: number) {
  return L.divIcon({
    className: "",
    html: `<div class="nurai-cluster-marker">${count}</div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -20],
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
  focusedSalonId,
  onSelectSalon,
  selectedSalonId,
}: {
  origin?: { latitude: number; longitude: number; label: string } | null;
  focusedSalonId?: string | null;
  onSelectSalon?: (salon: SalonSummary) => void;
  selectedSalonId?: string | null;
  salons: SalonSummary[];
}) {
  const [zoom, setZoom] = useState(13);
  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ??
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution =
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const center = salons[0]
    ? ([salons[0].latitude, salons[0].longitude] as [number, number])
    : ([42.8746, 74.6122] as [number, number]);
  const clusters = useMemo(
    () => createCoordinateClusters(salons, zoom),
    [salons, zoom],
  );
  const focusedSalon =
    salons.find((salon) => salon.id === focusedSalonId) ?? null;

  return (
    <MapContainer
      center={center}
      zoom={13}
      minZoom={11}
      maxZoom={18}
      scrollWheelZoom
      className="h-[560px] min-h-[520px] w-full lg:h-[640px]"
    >
      <TileLayer attribution={attribution} url={tileUrl} />
      <MapZoomTracker onZoomChange={setZoom} />
      <MapAutoFit origin={origin} salons={salons} />
      <FocusSalon salon={focusedSalon} />
      {origin ? (
        <Marker
          icon={createOriginIcon()}
          position={[origin.latitude, origin.longitude]}
          zIndexOffset={900}
        >
          <Popup>{origin.label}</Popup>
        </Marker>
      ) : null}
      {clusters.map((cluster) =>
        cluster.isCluster ? (
          <SalonClusterMarker cluster={cluster} key={cluster.id} />
        ) : (
          <SalonMarker
            isSelected={selectedSalonId === cluster.points[0].id}
            key={cluster.id}
            onSelectSalon={onSelectSalon}
            salon={cluster.points[0]}
            salonIndex={salons.findIndex(
              (salon) => salon.id === cluster.points[0].id,
            )}
          />
        ),
      )}
    </MapContainer>
  );
}

function MapZoomTracker({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

function FocusSalon({ salon }: { salon: SalonSummary | null }) {
  const map = useMap();

  useEffect(() => {
    if (!salon) return;

    map.flyTo(
      [salon.latitude, salon.longitude],
      Math.max(map.getZoom(), 15),
      { duration: 0.55 },
    );
  }, [map, salon]);

  return null;
}

function SalonClusterMarker({
  cluster,
}: {
  cluster: MapCluster<SalonSummary>;
}) {
  const map = useMap();

  return (
    <Marker
      eventHandlers={{
        click: () => {
          const bounds = L.latLngBounds(
            cluster.points.map((salon) => [salon.latitude, salon.longitude]),
          );

          map.fitBounds(bounds, {
            maxZoom: Math.min(map.getZoom() + 2, 17),
            padding: [72, 72],
          });
        },
      }}
      icon={createClusterIcon(cluster.points.length)}
      position={[cluster.latitude, cluster.longitude]}
      zIndexOffset={800}
    >
      <Popup>
        <div className="min-w-48">
          <p className="text-sm font-black text-[var(--ink)]">
            {cluster.points.length} салона рядом
          </p>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
            Нажмите на круг или приблизьте карту, чтобы раскрыть точки.
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

function SalonMarker({
  isSelected,
  onSelectSalon,
  salon,
  salonIndex,
}: {
  isSelected: boolean;
  onSelectSalon?: (salon: SalonSummary) => void;
  salon: SalonSummary;
  salonIndex: number;
}) {
  return (
    <Marker
      eventHandlers={{
        click: () => onSelectSalon?.(salon),
      }}
      icon={createMarkerIcon(Math.max(salonIndex, 0), isSelected)}
      position={[salon.latitude, salon.longitude]}
      zIndexOffset={isSelected ? 700 : 400}
    >
      <Popup>
        <div className="min-w-44">
          <p className="text-sm font-black text-[var(--ink)]">{salon.name}</p>
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
