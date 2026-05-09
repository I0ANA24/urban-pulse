"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/dashboard/EventFilters";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import { Event, EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import { useSignalR } from "@/context/SignalRContext";
import { useRadius } from "@/context/RadiusContext";
import { useSevereWeather } from "@/context/SevereWeatherContext";
import { useUser } from "@/context/UserContext";
import UrbanTitle from "@/components/ui/UrbanTitle";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

const API = "http://localhost:5248";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MobileSafetyPortal({ onClick }: { onClick: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed left-0 right-0 z-200 px-4 pb-2 bg-background transition-[top] duration-300 ease-out lg:hidden"
      style={{ top: scrolled ? 0 : "12vh" }}
    >
      <SafetyBanner onClick={onClick} />
    </div>,
    document.body
  );
}

function SafetyBanner({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative w-full animate-fade-up mt-4">
      <div className="absolute inset-0 bg-red-emergency rounded-2xl opacity-30" />
      <div
        onClick={onClick}
        className="relative w-full bg-red-emergency rounded-2xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📌</span>
          <div>
            <p className="text-white font-bold text-sm">Safety Check-in</p>
            <p className="text-white/60 text-xs">Tap to let neighbors know you&apos;re safe</p>
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

function PawPrintFab() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <Link
      href="/pets"
      className="fixed bottom-22 right-6 z-50 w-14 h-14 rounded-full bg-green-light flex items-center justify-center shadow-lg hover:scale-105 transition-transform lg:hidden"
    >
      <PawPrint size={26} strokeWidth={2} fill="black" className="text-black" />
    </Link>,
    document.body
  );
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { connection } = useSignalR();
  const { radiusKm } = useRadius();
  const { isSevereWeather } = useSevereWeather();
  const { isAdmin } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetEventId = searchParams.get("eventId");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [profileRes, eventsRes] = await Promise.all([
          fetch(`${API}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/event`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.latitude && profileData.longitude) {
            setUserLocation({ lat: profileData.latitude, lng: profileData.longitude });
          }
        }

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!connection) return;

    const handleNewEvent = (newEvent: Event) => {
      setEvents((prev) => [newEvent, ...prev]);
    };

    const handleEventDeactivated = (eventId: number) => {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    };

    connection.on("NewEvent", handleNewEvent);
    connection.on("EventDeactivated", handleEventDeactivated);

    return () => {
      connection.off("NewEvent", handleNewEvent);
      connection.off("EventDeactivated", handleEventDeactivated);
    };
  }, [connection]);

  useEffect(() => {
    if (loading || !targetEventId) return;
    const el = document.getElementById(`event-${targetEventId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, targetEventId]);

  const typeMap: Record<number, EventType> = {
    0: "General",
    1: "Emergency",
    2: "Skill",
    3: "Lend",
  };

  const filteredEvents = events.filter((e) => {
    const mappedType = typeof e.type === "number" ? typeMap[e.type] : (e.type as EventType);

    if (activeFilter !== "ALL" && EVENT_TAG_STYLES[mappedType]?.title !== activeFilter) {
      return false;
    }

    if (mappedType === "General") return true;

    if (!userLocation) return true;

    if (e.latitude && e.longitude) {
      const dist = haversineKm(userLocation.lat, userLocation.lng, e.latitude, e.longitude);
      return dist <= radiusKm;
    }

    return true;
  });

  return (
    <ThreeColumnLayout>
      {!isAdmin && <PawPrintFab />}

      {/* Mobile: portal în document.body — fixed cu top dinamic bazat pe scroll */}
      {isSevereWeather && (
        <MobileSafetyPortal onClick={() => router.push("/severe-chat")} />
      )}
      {/* Spacer care împinge conținutul sub poziția inițială a bannerului */}
      {isSevereWeather && <div className="lg:hidden h-[calc(5vh)]" />}

      {/* Desktop: sticky în feed-scroll, deasupra filtrelor */}
      {isSevereWeather && (
        <div className="hidden lg:block sticky top-0 z-50 w-full pt-2 pb-1 bg-background">
          <SafetyBanner onClick={() => router.push("/severe-chat")} />
        </div>
      )}

      <div className="w-full py-2 flex flex-col items-center gap-4 mb-4 mt-4">
        <div className="lg:hidden">
          <UrbanTitle />
        </div>
        <div className="lg:hidden w-full">
          <DashboardBanner />
        </div>

        <EventFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {loading && (
          <p className="text-white/40 text-sm text-center mt-10">Loading...</p>
        )}
        {!loading && filteredEvents.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-10">
            No events in your area.
          </p>
        )}
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </ThreeColumnLayout>
  );
}
