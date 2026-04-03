"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/dashboard/EventFilters";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import { Event, EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import { useSignalR } from "@/context/SignalRContext";
import UrbanTitle from "@/components/ui/UrbanTitle";
import { Plus, Search, Map, MessageCircle } from "lucide-react";

/* ── Desktop sidebar nav item ── */
function SidebarNavItem({
  href,
  icon,
  label,
  isGreen,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isGreen?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-5 h-11 transition-opacity hover:opacity-80"
    >
      {/* Icon circle */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: isGreen ? "#001406" : "#1F1F1F",
          boxShadow:
            "inset 0.7px 0.7px 0.7px rgba(255,255,255,0.7), inset 1.4px 1.4px 6.4px rgba(255,255,255,0.4), inset -0.7px -0.7px 0.7px rgba(255,255,255,0.3)",
          filter: "drop-shadow(0px 4px 5.7px rgba(42,42,42,0.36))",
        }}
      >
        {icon}
      </div>

      <span
        className={`text-2xl font-normal tracking-tight ${
          isGreen ? "text-[#4ADE80]" : "text-white"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

/* ── Desktop right sidebar weather card ── */
function DesktopWeatherCard() {
  const [weather, setWeather] = useState<{
    temp: number;
    description: string;
    icon: string;
    isSevere: boolean;
  } | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const fetchWeather = () => {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Iasi,RO&units=metric&appid=${apiKey}`,
      )
        .then((res) => res.json())
        .then((data) => {
          const desc = data.weather[0].description as string;
          setWeather({
            temp: Math.round(data.main.temp),
            description: desc.charAt(0).toUpperCase() + desc.slice(1),
            icon: data.weather[0].icon,
            isSevere: false,
          });
        })
        .catch(console.error);
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`rounded-2xl p-8 h-35 flex items-center justify-between ${
        weather?.isSevere ? "bg-red-emergency" : "bg-weather-nice"
      }`}
    >
      <div className="flex flex-col gap-2">
        <p className="text-white font-bold text-3xl leading-tight tracking-tight">
          {weather ? `${weather.temp}° C` : "--° C"}
        </p>
        <p className="text-white font-normal text-2xl leading-tight tracking-tight">
          {weather ? weather.description : "Loading..."}
        </p>
      </div>
      <img
        src={
          weather
            ? `https://openweathermap.org/img/w/${weather.icon}.png`
            : "/sun.svg"
        }
        width={90}
        height={90}
        alt="weather icon"
        className="object-contain"
      />
    </div>
  );
}

/* MAIN DASHBOARD PAGE */
export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isSevereWeather, setIsSevereWeather] = useState(false);

  const { connection } = useSignalR();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5248/api/event", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!connection) return;

    const handleNewEvent = (newEvent: Event) => {
      setEvents((prev) => [newEvent, ...prev]);
    };

    connection.on("NewEvent", handleNewEvent);

    return () => {
      connection.off("NewEvent", handleNewEvent);
    };
  }, [connection]);

  const filteredEvents =
    activeFilter === "ALL"
      ? events
      : events.filter((e) => {
          const typeMap: Record<number, EventType> = {
            0: "General",
            1: "Emergency",
            2: "Skill",
            3: "Lend",
          };
          const mappedType =
            typeof e.type === "number"
              ? typeMap[e.type]
              : (e.type as EventType);

          return EVENT_TAG_STYLES[mappedType]?.title === activeFilter;
        });

  return (
    <div className="w-full pb-[8vh] lg:pb-0">
      {/* ── Desktop 3-column wrapper ── */}
      <div className="lg:flex lg:gap-8 xl:gap-14 lg:items-start">
        {/* LEFT SIDEBAR — Desktop only */}
        <aside className="hidden lg:flex lg:flex-col lg:flex-1 lg:sticky lg:top-8">
          {/* Add Post — separated with extra gap */}
          <SidebarNavItem
            href="/addPost"
            icon={<Plus size={26} strokeWidth={2.5} className="text-white" />}
            label="Add Post"
            isGreen
          />

          <div className="h-14" />

          {/* Nav links — tighter gap */}
          <div className="flex flex-col gap-5">
            <SidebarNavItem
              href="/search"
              icon={<Search size={24} className="text-white" />}
              label="Search"
            />
            <SidebarNavItem
              href="/map"
              icon={<Map size={24} className="text-white" />}
              label="Map"
            />
            <SidebarNavItem
              href="/chat"
              icon={<MessageCircle size={24} className="text-white" />}
              label="Chat"
            />
          </div>
        </aside>

        {/* CENTER COLUMN — Feed */}
        <div className="lg:flex-2 max-w-190">
          <div className="w-full py-2 flex flex-col items-center gap-4 mb-4">
            {/* UrbanTitle — mobile only (on desktop it's in the TopBar) */}
            <div className="lg:hidden">
              <UrbanTitle />
            </div>

            {/* Severe weather banner */}
            {isSevereWeather && (
              <div className="sticky top-0 z-50 w-full animate-fade-up">
                <div className="absolute inset-0 bg-red-emergency rounded-2xl animate-ping opacity-30" />

                <div className="relative w-full bg-red-emergency rounded-2xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:opacity-90 transition-opacity">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📌</span>
                    <div>
                      <p className="text-white font-bold text-sm">
                        Safety Check-in
                      </p>
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
            )}

            {/* DashboardBanner — mobile only */}
            <div className="lg:hidden w-full">
              <DashboardBanner onSevereWeather={setIsSevereWeather} />
            </div>

            <EventFilters
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          </div>

          {/* Feed */}
          <div className="flex flex-col gap-4 mt-2">
            {loading && (
              <p className="text-white/40 text-sm text-center mt-10">
                Loading...
              </p>
            )}
            {!loading && filteredEvents.length === 0 && (
              <p className="text-white/40 text-sm text-center mt-10">
                No events yet.
              </p>
            )}

            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR — Desktop only */}
        <aside className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-4 lg:sticky lg:top-8">
          {/* Weather card */}
          <DesktopWeatherCard />

          {/* Event card */}
          <div className="bg-weather-nice rounded-2xl p-8 h-35 flex flex-col justify-center gap-2">
            <p className="text-white font-bold text-3xl leading-tight tracking-tight">
              Event
            </p>
            <p className="text-white font-normal text-2xl leading-tight tracking-tight">
              Game Night
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
