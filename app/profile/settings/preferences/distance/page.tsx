"use client";

import { useState } from "react";
import ProfilePageTemplate from "@/components/profile/ProfilePageTemplate";

export default function DistanceLimitPage() {
  const [distance, setDistance] = useState("100");
  const [unit, setUnit] = useState("KM");

  const toggleUnit = () => {
    setUnit((prevUnit) => (prevUnit === "KM" ? "M" : "KM"));
  };

  return (
    <ProfilePageTemplate title="Distance Limit">
      <div className="w-full flex flex-col items-center gap-4 text-white">
        <p className="w-full text-white/48 text-sm">
          * Choose from who you can receive alerts
        </p>

        <section className="w-full">
          <h2 className="text-lg">Radius</h2>
          <div className="w-full h-px bg-[#383838] my-2 mb-4"></div>

          <div className="w-46 h-12.5 p-2 bg-secondary flex items-center justify-between rounded-2xl border border-transparent">
            <div className="w-30">
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full bg-transparent text-white text-center text-xl font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
              />
            </div>

            <div className="w-15">
              <button
                onClick={toggleUnit}
                className="w-full block h-8.5 bg-[#383838] hover:bg-[#454545] cursor-pointer text-white text-xl font-bold rounded-lg transition-colors"
              >
                {unit}
              </button>
            </div>
          </div>
        </section>
      </div>
    </ProfilePageTemplate>
  );
}
