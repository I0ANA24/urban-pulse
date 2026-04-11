"use client";

import { useRouter } from "next/navigation";
import { useSevereWeather } from "@/context/SevereWeatherContext";

export default function SevereWeatherFixedBanner() {
  const { isSevereWeather } = useSevereWeather();
  const router = useRouter();

  if (!isSevereWeather) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] px-4 pt-3 pb-2 pointer-events-none">
      <div className="relative pointer-events-auto max-w-190 mx-auto">
        <div className="absolute inset-0 bg-red-emergency rounded-2xl animate-ping opacity-20" />
        <div
          onClick={() => router.push("/severe-chat")}
          className="relative w-full bg-red-emergency rounded-2xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📌</span>
            <div>
              <p className="text-white font-bold text-sm">Safety Check-in</p>
              <p className="text-white/60 text-xs">
                Tap to let neighbors know you&apos;re safe
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
