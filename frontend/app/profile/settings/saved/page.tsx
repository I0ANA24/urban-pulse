"use client";

import { useEffect, useState } from "react";
import ProfilePageTemplate from "@/components/profile/ProfilePageTemplate";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/dashboard/EventFilters";
import { Event, EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import { Bookmark } from "lucide-react";
import { API_BASE_URL as API } from "@/lib/api";

const typeMap: Record<number, EventType> = {
  0: "General", 1: "Emergency", 2: "Skill", 3: "Lend",
};

export default function SavedPostsPage() {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/event/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Event[]) => {
        const unique = data.filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i);
        setSavedEvents(unique);
      })
      .catch(() => setSavedEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (eventId: number) => {
    setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/event/${eventId}/save`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const filteredEvents = activeFilter === "ALL"
    ? savedEvents
    : savedEvents.filter((e) => {
        const mappedType = typeof e.type === "number" ? typeMap[e.type] : (e.type as EventType);
        return EVENT_TAG_STYLES[mappedType]?.title === activeFilter;
      });

  return (
    <ProfilePageTemplate title="Saved Posts">
      <div className="w-full flex flex-col gap-4 mt-4">
        <EventFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        {loading && (
          <p className="text-white/40 text-sm text-center mt-10">Loading saved posts...</p>
        )}
        {!loading && filteredEvents.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-10">
            {savedEvents.length === 0 ? "You haven't saved any posts yet." : "No saved posts for this filter."}
          </p>
        )}
        {filteredEvents.map((event) => (
          <div key={event.id} className="relative">
            <EventCard event={event} />
            <button
              onClick={() => handleUnsave(event.id)}
              className="absolute top-4 right-14 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-light/10 border border-green-light/30 hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
            >
              <Bookmark size={14} className="text-green-light fill-green-light group-hover:text-red-400 group-hover:fill-transparent transition-colors" />
              <span className="text-green-light text-xs font-medium group-hover:hidden transition-colors">Saved=</span>
              <span className="text-red-400 text-xs font-medium hidden group-hover:inline transition-colors">Remove</span>
            </button>
          </div>
        ))}
      </div>
    </ProfilePageTemplate>
  );
}