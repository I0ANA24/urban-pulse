"use client";

import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

interface MapPickerProps {
  onSelect: (address: string) => void;
}

function DragHandler({ onSelect }: MapPickerProps) {
  const [loading, setLoading] = useState(false);

  useMapEvents({
    moveend: async (e) => {
      const center = e.target.getCenter();
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${center.lat}&lon=${center.lng}&format=json`
        );
        const data = await res.json();
        onSelect(data.display_name ?? `${center.lat}, ${center.lng}`);
      } catch {
        onSelect(`${center.lat}, ${center.lng}`);
      } finally {
        setLoading(false);
      }
    },
  });

  return null;
}

export default function MapPicker({ onSelect }: MapPickerProps) {
  return (
    <>
      <style>{`
        .leaflet-container { cursor: grab !important; }
        .leaflet-container:active { cursor: grabbing !important; }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-6px); }
        }
      `}</style>

      <div className="w-full h-[280px] rounded-2xl overflow-hidden border border-white/10 relative">

        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translateX(-50%) translateY(-100%)",
          zIndex: 1000,
          pointerEvents: "none",
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            background: "#4ade80",
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            border: "3px solid white",
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "10px",
              height: "10px",
              background: "white",
              borderRadius: "50%",
            }} />
          </div>
        </div>

        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          pointerEvents: "none",
          width: "16px",
          height: "6px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "50%",
          filter: "blur(3px)",
          marginTop: "2px",
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
          <DragHandler onSelect={onSelect} />
        </MapContainer>

        <div className="absolute bottom-3 left-0 right-0 flex justify-center z-[1000] pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
            <p className="text-white text-xs font-medium">Move the map to select your address</p>
          </div>
        </div>

      </div>
    </>
  );
}