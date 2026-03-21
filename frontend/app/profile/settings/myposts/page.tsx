"use client";

import { useEffect, useState, useRef } from "react";
import ProfilePageTemplate from "@/components/profile/ProfilePageTemplate";
import EventCard from "@/components/events/EventCard";
import { Event, EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import { Trash2 } from "lucide-react";

const FILTERS = ["ALL", "GENERAL", "EMERGENCY", "SKILL", "LEND"];

export default function MyPostsPage() {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [scrolledRight, setScrolledRight] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

        {/* Filter buttons */}
        <div className="relative w-full">
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-none pb-1"
            onScroll={(e) => {
              setScrolledRight(e.currentTarget.scrollLeft > 50);
            }}
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              const style = filter !== "ALL"
                ? EVENT_TAG_STYLES[filter.charAt(0) + filter.slice(1).toLowerCase() as EventType]
                : null;

              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all"
                  style={
                    style
                      ? {
                          backgroundColor: style.bgColor,
                          color: style.textColor,
                          opacity: isActive ? 1 : 0.5,
                        }
                      : {
                          backgroundColor: isActive ? "white" : "rgba(255,255,255,0.15)",
                          color: isActive ? "black" : "rgba(255,255,255,0.6)",
                        }
                  }
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <div className="absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        <div className="flex justify-center gap-1.5 -mt-2">
          <div className={`h-1.5 rounded-full transition-all ${!scrolledRight ? "w-4 bg-white/60" : "w-1.5 bg-white/20"}`} />
          <div className={`h-1.5 rounded-full transition-all ${scrolledRight ? "w-4 bg-white/60" : "w-1.5 bg-white/20"}`} />
        </div>

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

      {/* Delete confirm popup */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center px-6 z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-[#1e1e1e] w-full rounded-2xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-2 py-4 border-b border-white/10">
              <Trash2 className="size-5 text-red-500" strokeWidth={2} />
              <h2 className="text-base font-bold text-red-500">Delete post</h2>
            </div>

            <div className="px-6 py-5 text-center">
              <p className="text-white text-sm leading-relaxed">
                Are you sure you want to{" "}
                <span className="font-bold underline">delete this post?</span>
              </p>
            </div>

            <div className="flex border-t border-white/10">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-4 font-bold text-sm text-white bg-transparent border-r border-white/10"
              >
                YES
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-4 font-bold text-sm text-white bg-red-600"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}
    </ProfilePageTemplate>
  );
}