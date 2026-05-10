"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/dashboard/EventFilters";
import { Event, EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import GoBackButton from "@/components/ui/GoBackButton";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";
import { API_BASE_URL as API } from "@/lib/api";

export default function FlaggedContentPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [flaggedEvents, setFlaggedEvents] = useState<(Event & { flagCount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/admin/flagged-content`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFlaggedEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredEvents =
    activeFilter === "ALL"
      ? flaggedEvents
      : flaggedEvents.filter((e) => {
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

  const handleViewInsights = (eventId: number) => {
    router.push(`/admin/tasks/flagged-content/${eventId}`);
  };

  return (
    <ThreeColumnLayoutAdmin>
      <div className="w-full flex flex-col gap-4 animate-fade-up pb-20">
        {/* Mobile Header */}
        <div className="flex items-center relative mb-4 lg:hidden">
          <GoBackButton />
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <h1 className="text-white font-bold text-xl">Flagged content</h1>
            <span className="w-2.5 h-2.5 rounded-full bg-blue" />
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/60" />
          <h1 className="text-white font-bold text-xl">Flagged content</h1>
          <span className="w-2.5 h-2.5 rounded-full bg-blue" />
          <div className="flex-1 h-px bg-white/60" />
        </div>

        <EventFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        {loading && (
          <div className="flex flex-col gap-3 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full bg-secondary rounded-2xl p-5 animate-pulse h-32" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-2 mt-2">
            {filteredEvents.length === 0 && (
              <p className="text-white/40 text-sm text-center mt-10">
                No flagged content found.
              </p>
            )}
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isAdminView={true}
                flagCount={event.flagCount}
                onViewInsights={handleViewInsights}
              />
            ))}
          </div>
        )}
      </div>
    </ThreeColumnLayoutAdmin>
  );
}