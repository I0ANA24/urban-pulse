"use client";

import { useEffect, useState } from "react";
import ProfilePageTemplate from "@/components/profile/ProfilePageTemplate";
import EventCard from "@/components/events/EventCard";
import { Event } from "@/types/Event";

export default function SavedPostsPage() {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <ProfilePageTemplate title="Saved Posts">
      <div className="w-full flex flex-col mt-4">
        {loading && (
          <p className="text-white/40 text-sm text-center mt-10">Loading saved posts...</p>
        )}

        {!loading && savedEvents.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-10">
            You haven't saved any posts yet.
          </p>
        )}

        {savedEvents.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
          />
        ))}
      </div>
    </ProfilePageTemplate>
  );
}