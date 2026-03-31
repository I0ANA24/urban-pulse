"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
        <span className="text-sm text-gray-400 tracking-widest uppercase">
          Se incarca harta...
        </span>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="relative h-screen w-full">
      <MapView />
    </div>
  );
}