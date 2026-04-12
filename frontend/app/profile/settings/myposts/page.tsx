"use client";

import { useEffect, useState } from "react";
import ProfilePageTemplate from "@/components/profile/ProfilePageTemplate";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/dashboard/EventFilters";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Event, EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import { Trash2 } from "lucide-react";

export default function MyPostsPage() {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5248/api/user/my-posts", {
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

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setMyEvents((prev) => prev.filter((event) => event.id !== deleteId));
    setShowDeleteConfirm(false);
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5248/api/event/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
    setDeleteId(null);
  };

  const typeMap: Record<number, EventType> = {
    0: "General",
    1: "Emergency",
    2: "Skill",
    3: "Lend",
  };

  const filteredEvents =
    activeFilter === "ALL"
      ? myEvents
      : myEvents.filter((e) => {
          const mappedType =
            typeof e.type === "number" ? typeMap[e.type] : (e.type as EventType);
          return EVENT_TAG_STYLES[mappedType]?.title === activeFilter;
        });

  return (
    <ProfilePageTemplate title="My Posts">
      <div className="w-full flex flex-col gap-4 mt-4">

        <EventFilters 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
        />

        {loading && (
          <p className="text-white/40 text-sm text-center mt-10">Loading your posts...</p>
        )}

        {!loading && filteredEvents.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-10">
            No posts yet.
          </p>
        )}

        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isMyPost={true}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        icon={<Trash2 />}
        title="Delete post"
        boldText="delete this post"
      />
    </ProfilePageTemplate>
  );
}