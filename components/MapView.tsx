"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Fix Leaflet default icon in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

type Trip = {
  id: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  coverPhoto?: string | null;
  tags: string[];
};

function FitBounds({ trips }: { trips: Trip[] }) {
  const map = useMap();
  useEffect(() => {
    if (trips.length === 0) return;
    if (trips.length === 1) {
      map.setView([trips[0].latitude, trips[0].longitude], 10);
      return;
    }
    const bounds = L.latLngBounds(trips.map((t) => [t.latitude, t.longitude]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [map, trips]);
  return null;
}

export default function MapView({ trips }: { trips: Trip[] }) {
  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        maxBounds={[[8.1, 68.2], [35.5, 97.4]]}
        maxBoundsViscosity={1}
        className="h-full w-full"
        style={{ minHeight: "calc(100vh - 60px)" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds trips={trips} />
        {trips.map((trip) => (
          <Marker
            key={trip.id}
            position={[trip.latitude, trip.longitude]}
            icon={
              L.divIcon({
                className: "map-pin",
                html: `<div style="
                  width: 32px; height: 32px;
                  background: #0d9488;
                  border: 2px solid white;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
              })
            }
          >
            <Popup>
              <div className="min-w-[180px]">
                <h3 className="font-semibold text-earth-900">{trip.city}, {trip.country}</h3>
                <p className="text-sm text-earth-600 mt-1">
                  {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
                </p>
                {trip.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {trip.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-wander-teal/20 text-wander-teal"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  href={`/trip/${trip.id}`}
                  className="inline-block mt-3 text-sm font-medium text-wander-teal hover:underline"
                >
                  View trip →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
