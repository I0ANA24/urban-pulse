"use client";

import { useEffect, useState } from "react";
import ProfilePageTemplate from "@/components/profile/ProfilePageTemplate";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/dashboard/EventFilters";
import { Event, EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";

export default function SavedPostsPage() {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const res = await fetch("http://localhost:5248/api/event", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data: Event[] = await res.json();
          setSavedEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch saved posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  const typeMap: Record<number, EventType> = {
    0: "General",
    1: "Emergency",
    2: "Skill",
    3: "Lend",
  };

  const filteredEvents =
    activeFilter === "ALL"
      ? savedEvents
      : savedEvents.filter((e) => {
          const mappedType =
            typeof e.type === "number" ? typeMap[e.type] : (e.type as EventType);
          return EVENT_TAG_STYLES[mappedType]?.title === activeFilter;
        });

  return (
    <ProfilePageTemplate title="Saved Posts">
      <div className="w-full flex flex-col gap-4 mt-4">
        
        <EventFilters 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
        />

        {loading && (
          <p className="text-white/40 text-sm text-center mt-10">Loading saved posts...</p>
        )}

        {!loading && filteredEvents.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-10">
            {savedEvents.length === 0 
              ? "You haven't saved any posts yet." 
              : "No saved posts found for this filter."}
          </p>
        )}

        {filteredEvents.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
          />
        ))}
      </div>
    </ProfilePageTemplate>
  );
}