"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/dashboard/EventFilters";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import { Event, EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import { useSignalR } from "@/context/SignalRContext";

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

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
    <div className="w-full pb-[8vh]">
      {/* logo, event, weather and filter buttons */}
      <div className="w-full py-2 flex flex-col items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <h1 className="font-montagu text-white text-[32px]">UrbanPulse</h1>
          <span className="w-2 h-2 rounded-full bg-green-400" />
        </div>

        <DashboardBanner />

        <EventFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      </div>

      {/* feed */}
      <div className="flex flex-col gap-4 mt-2">
        {loading && (
          <p className="text-white/40 text-sm text-center mt-10">Loading...</p>
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
  );
}
