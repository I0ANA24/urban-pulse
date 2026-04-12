"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import HorizontalCard from "@/components/profile/HorizontalCard";
import ProfilePageTemplate from "@/components/profile/ProfilePageTemplate";

const MapPicker = dynamic(() => import("@/components/profile/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-62.5 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
      <p className="text-white/30 text-sm">Loading map...</p>
    </div>
  ),
});

export default function PersonalInfoPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadPersonalInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5248/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setPhoneNumber(data.phoneNumber ?? "");
        setAddress(data.address ?? "");
        setLat(data.latitude ?? null);
        setLng(data.longitude ?? null);
      } catch (error) {
        console.error("Failed to load personal info:", error);
      }
    };

    loadPersonalInfo();
  }, []);

  const autoSave = (
    updatedPhone: string,
    updatedAddress: string,
    updatedLat: number | null,
    updatedLng: number | null
  ) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5248/api/user/profile", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: updatedPhone,
            address: updatedAddress,
            latitude: updatedLat,
            longitude: updatedLng,
          }),
        });
        if (!res.ok) return;
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (error) {
        console.error("Failed to autosave personal info:", error);
      }
    }, 1000);
  };

  const handleMapSelect = (addr: string, selectedLat: number, selectedLng: number) => {
    setAddress(addr);
    setLat(selectedLat);
    setLng(selectedLng);
    autoSave(phoneNumber, addr, selectedLat, selectedLng);
  };

  return (
    <ProfilePageTemplate title="Personal Info">
      <div className="w-full flex flex-col gap-6">

        <HorizontalCard
          title="Phone Number"
          type="tel"
          placeholder="Add your phone number..."
          value={phoneNumber}
          inputMode="numeric"
          pattern="[0-9+\s]*"
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9+\s]/g, "");
            setPhoneNumber(value);
            autoSave(value, address, lat, lng);
          }}
        />

        <HorizontalCard
          title="Address"
          type="text"
          placeholder="Pick from map or type..."
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            autoSave(phoneNumber, e.target.value, lat, lng);
          }}
        />

        <p className="text-white/30 text-xs text-center -mt-2">
          📍 Tap on the map to set your address
        </p>

        <MapPicker onSelect={handleMapSelect} />

        {saved && (
          <p className="text-green-light text-sm animate-fade-up text-center">✓ Saved</p>
        )}

      </div>
    </ProfilePageTemplate>
  );
}