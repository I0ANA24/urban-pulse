"use client";

import { useEffect, useState } from "react";
import ProfilePageTemplate from "@/components/profile/ProfilePageTemplate";
import EventCard from "@/components/events/EventCard";
import { Event } from "@/types/Event";

export default function MyPostsPage() {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const res = await fetch("http://localhost:5248/api/event", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data: Event[] = await res.json();
          setMyEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch my posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handleDelete = async (id: number) => {
    setMyEvents((prev) => prev.filter((event) => event.id !== id));

    try {
      const token = localStorage.getItem("token");
      console.log(`Sending DELETE request for post ID: ${id}`);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  return (
    <ProfilePageTemplate title="My Posts">
      <div className="w-full flex flex-col">
        {loading && (
          <p className="text-white/40 text-sm text-center mt-10">Loading your posts...</p>
        )}

        {!loading && myEvents.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-10">
            You haven't posted anything yet.
          </p>
        )}

        {myEvents.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            isMyPost={true} 
            onDelete={handleDelete}
          />
        ))}
      </div>
    </ProfilePageTemplate>
  );
}