"use client";

import { DivIcon } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { schoolLocationMapProvider } from "./mapProvider";

const DEFAULT_CENTER: [number, number] = [24.7136, 46.6753];
const DEFAULT_ZOOM = 11;
const RESOLVED_ZOOM = 13;
const LOCATION_MARKER_ICON = new DivIcon({
  className: "school-location-marker",
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:36px;height:48px;">
      <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18 2C10.268 2 4 8.26801 4 16C4 26.5 18 46 18 46C18 46 32 26.5 32 16C32 8.26801 25.732 2 18 2Z" fill="#ff0000"/>
        <path d="M18 9C14.134 9 11 12.134 11 16C11 19.866 14.134 23 18 23C21.866 23 25 19.866 25 16C25 12.134 21.866 9 18 9Z" fill="#ffffff"/>
      </svg>
    </div>
  `,
  iconSize: [36, 48],
  iconAnchor: [18, 46],
  popupAnchor: [0, -40],
});

interface SchoolLocationPreviewProps {
  cityLabel: string;
  regionLabel: string;
  providerLabel: string;
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
}

interface GeocodingResult {
  lat: string;
  lon: string;
}

function MapViewportUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, RESOLVED_ZOOM);
  }, [center, map]);

  return null;
}

export function SchoolLocationPreview({
  cityLabel,
  regionLabel,
  providerLabel,
  loadingLabel,
  emptyLabel,
  errorLabel,
}: SchoolLocationPreviewProps) {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading",
  );

  // todo: change it to use location from response instead of city and region.
  const placeQuery = useMemo(
    () => [cityLabel, regionLabel].filter(Boolean).join(", "),
    [cityLabel, regionLabel],
  );

  useEffect(() => {
    let isCancelled = false;

    async function resolvePlace() {
      if (!placeQuery) {
        setCoordinates(null);
        setStatus("empty");
        return;
      }

      setStatus("loading");

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
            placeQuery,
          )}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to geocode place.");
        }

        const results = (await response.json()) as GeocodingResult[];
        const firstResult = results[0];

        if (!firstResult) {
          if (!isCancelled) {
            setCoordinates(null);
            setStatus("empty");
          }
          return;
        }

        const lat = Number.parseFloat(firstResult.lat);
        const lng = Number.parseFloat(firstResult.lon);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          throw new Error("Invalid geocoding result.");
        }

        if (!isCancelled) {
          setCoordinates([lat, lng]);
          setStatus("ready");
        }
      } catch {
        if (!isCancelled) {
          setCoordinates(null);
          setStatus("error");
        }
      }
    }

    void resolvePlace();

    return () => {
      isCancelled = true;
    };
  }, [placeQuery]);

  const activeCenter = coordinates ?? DEFAULT_CENTER;
  const statusLabel =
    status === "loading"
      ? loadingLabel
      : status === "empty"
        ? emptyLabel
        : status === "error"
          ? errorLabel
          : null;

  return (
    <div className="relative min-h-[350px] overflow-hidden rounded-[1.75rem] border border-white/60 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <MapContainer
        center={activeCenter}
        zoom={coordinates ? RESOLVED_ZOOM : DEFAULT_ZOOM}
        scrollWheelZoom={true}
        zoomControl={false}
        className="min-h-[350px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewportUpdater center={activeCenter} />
        {coordinates ? (
          <Marker position={coordinates} icon={LOCATION_MARKER_ICON}>
            <Popup>
              <div className="space-y-1 text-right">
                <p className="text-sm font-semibold text-slate-800">{cityLabel}</p>
                <p className="text-xs text-slate-500">{regionLabel}</p>
              </div>
            </Popup>
          </Marker>
        ) : null}
      </MapContainer>

      <div className="h-full w-full pointer-events-none absolute bottom-0 z-[400] bg-gradient-to-t to-[#2B415E00] via-[#2B415ECC]/50 from-[#2B415ECC] px-6 py-5">
        <div className="h-full w-full flex items-end justify-center">
          <div className="space-y-2 text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.32em] text-[#D4AF37]">
              {providerLabel} · {schoolLocationMapProvider.engineName}
            </p>
            <p className="text-lg font-bold text-white drop-shadow-[0_2px_10px_rgba(15,23,42,0.45)]">
              {cityLabel}
            </p>
            <p className="text-sm text-white/85 drop-shadow-[0_2px_10px_rgba(15,23,42,0.3)]">
              {regionLabel}
            </p>
          </div>
        </div>
      </div>

      {statusLabel ? (
        <div className="pointer-events-none absolute inset-x-6 bottom-6 z-[400] rounded-2xl bg-white/92 px-4 py-3 text-right shadow-lg backdrop-blur-sm">
          <p className="text-sm font-medium text-slate-700">{statusLabel}</p>
        </div>
      ) : null}
    </div>
  );
}
