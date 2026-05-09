"use client";

import { DEFAULT_INCIDENT_TYPES } from "@/lib/constants";

export interface ClusterData {
  id: number;
  isCluster: true;
  isGlobal: boolean;
  reportCount: number;
  neighbourhoodCount: number;
  emergencySubType: string;
  affectedNeighbourhoods: string[];
  description: string;
  createdAt: string;
  latitude: number;
  longitude: number;
}

interface ClusterCardProps {
  cluster: ClusterData;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} \u00A0 ${hours}:${minutes}`;
}

export default function ClusterCard({ cluster }: ClusterCardProps) {
  const incident = DEFAULT_INCIDENT_TYPES.find(
    (i) => i.key === cluster.emergencySubType
  );

  const icon = incident?.icon ?? "🚨";
  const label = incident?.label ?? cluster.emergencySubType;

  return (
    <div className="w-full relative mb-4 animate-fade-up">
      {/* glow exterior */}
      <div className="absolute inset-0 rounded-4xl bg-red-emergency opacity-10 blur-md pointer-events-none" />

      <div className="relative w-full rounded-4xl border border-red-emergency/30 bg-secondary overflow-hidden">
        {/* top bar */}
        <div className="w-full bg-red-emergency/15 border-b border-red-emergency/20 px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <p className="text-red-emergency font-bold text-sm uppercase tracking-wide">
                {cluster.isGlobal ? "City-wide Alert" : "Local Alert"}
              </p>
              <p className="text-white font-bold text-base">{label}</p>
            </div>
          </div>

          {/* counter badge */}
          <div className="flex flex-col items-center bg-red-emergency/20 border border-red-emergency/40 rounded-2xl px-3 py-1.5">
            <span className="text-red-emergency font-black text-xl leading-none">
              {cluster.reportCount}
            </span>
            <span className="text-red-emergency/70 text-[10px] font-bold uppercase">
              reports
            </span>
          </div>
        </div>

        {/* body */}
        <div className="px-5 lg:px-10 py-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <p className="text-white/40 text-xs uppercase font-bold tracking-wider">
              {cluster.isGlobal ? "Affected areas" : "Area"}
            </p>
            <div className="flex flex-wrap gap-2">
              {cluster.affectedNeighbourhoods.map((n) => (
                <span
                  key={n}
                  className="px-2.5 py-1 rounded-full bg-red-emergency/10 border border-red-emergency/25 text-red-emergency/80 text-xs font-semibold"
                >
                  📍 {n}
                </span>
              ))}
            </div>
          </div>

          {/* info row */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <p className="text-white/30 text-xs">{formatDate(cluster.createdAt)}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-emergency animate-pulse" />
              <p className="text-red-emergency/70 text-xs font-semibold">
                {cluster.isGlobal
                  ? `${cluster.neighbourhoodCount} zones affected`
                  : "Local cluster"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}