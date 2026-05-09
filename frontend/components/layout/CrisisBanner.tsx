"use client";

import { useRouter } from "next/navigation";
import { useCrisis } from "@/context/CrisisContext";

export default function CrisisBanner() {
  const { isInLocalCrisis, isInGlobalCrisis, crisisSubTypes, localCrises, globalCrises } = useCrisis();
  const router = useRouter();

  if (!isInLocalCrisis && !isInGlobalCrisis) return null;

  const totalEvents = localCrises.reduce((sum, c) => sum + c.eventCount, 0);
  const label = crisisSubTypes.join(", ").toUpperCase();
  const modeLabel = isInGlobalCrisis ? "GLOBAL CRISIS MODE" : "CRISIS MODE";

  return (
    <div className="relative w-full animate-fade-up">
      <div className="absolute inset-0 bg-red-emergency rounded-2xl opacity-30" />
      <div
        onClick={() => router.push("/dashboard")}
        className="relative w-full bg-red-emergency rounded-2xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-white font-bold text-sm">{modeLabel}</p>
            <p className="text-white/70 text-xs">
              {label} {totalEvents > 0 && `· +${totalEvents} events`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
