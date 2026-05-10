"use client";

import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

interface MapPickerProps {
  onSelect: (address: string, lat: number, lng: number, neighborhood: string) => void;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; neighborhood: string }> {
  // Try Nominatim up to 3 times
  for (let i = 0; i < 3; i++) {
    if (i > 0) await sleep(800);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ro,en`
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data.display_name) {
        return {
          address: data.display_name,
          neighborhood:
            data.address?.suburb ??
            data.address?.quarter ??
            data.address?.neighbourhood ??
            data.address?.city_district ??
            "",
        };
      }
    } catch {}
  }

  // Mapbox fallback
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (token) {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=ro&types=address,neighborhood,place`
      );
      if (res.ok) {
        const data = await res.json();
        const feature = data.features?.[0];
        if (feature) {
          const hood =
            feature.context?.find((c: { id: string; text: string }) =>
              c.id.startsWith("neighborhood.") || c.id.startsWith("locality.")
            )?.text ?? "";
          return { address: feature.place_name ?? "", neighborhood: hood };
        }
      }
    } catch {}
  }

  return { address: "", neighborhood: "" };
}

interface DragHandlerProps extends MapPickerProps {
  onLoadingChange: (v: boolean) => void;
}

function DragHandler({ onSelect, onLoadingChange }: DragHandlerProps) {
  useMapEvents({
    moveend: async (e) => {
      const center = e.target.getCenter();
      onLoadingChange(true);
      const result = await reverseGeocode(center.lat, center.lng);
      onSelect(result.address, center.lat, center.lng, result.neighborhood);
      onLoadingChange(false);
    },
  });
  return null;
}

export default function MapPicker({ onSelect }: MapPickerProps) {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <style>{`
        .leaflet-container { cursor: grab !important; }
        .leaflet-container:active { cursor: grabbing !important; }
      `}</style>

      <div className="w-full h-[280px] rounded-2xl overflow-hidden border border-white/10 relative">
        {/* Pin marker */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translateX(-50%) translateY(-100%)",
          zIndex: 1000, pointerEvents: "none",
        }}>
          <div style={{
            width: "32px", height: "32px", background: "#4ade80",
            borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)",
            border: "3px solid white", boxShadow: "0 4px 14px rgba(0,0,0,0.35)", position: "relative",
          }}>
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)", width: "10px", height: "10px",
              background: "white", borderRadius: "50%",
            }} />
          </div>
        </div>

        {/* Pin shadow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translateX(-50%)", zIndex: 1000, pointerEvents: "none",
          width: "16px", height: "6px", background: "rgba(0,0,0,0.3)",
          borderRadius: "50%", filter: "blur(3px)", marginTop: "2px",
        }} />

        <MapContainer
          center={[45.75, 24.0]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap'
          />
          <DragHandler onSelect={onSelect} onLoadingChange={setLoading} />
        </MapContainer>

        {/* Bottom hint / loading indicator */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center z-[1000] pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
            {loading ? (
              <>
                <div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                <p className="text-white text-xs font-medium">Detecting location...</p>
              </>
            ) : (
              <p className="text-white text-xs font-medium">Move the map to select your address</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}