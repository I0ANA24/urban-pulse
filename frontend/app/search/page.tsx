"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/dashboard/EventFilters";
import { Event, EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import SearchBar from "@/components/search/SearchBar";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { useUser } from "@/context/UserContext";

const API = "http://localhost:5248";

type TabType = "Posts" | "People";

interface UserResult {
  id: number;
  email: string;
  fullName?: string;
  isVerified?: boolean;
  trustScore?: number;
}

function getInitials(name: string) {
  return name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "UP";
}

const typeMap: Record<number, EventType> = {
  0: "General", 1: "Emergency", 2: "Skill", 3: "Lend",
};

function useDebounce(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const router = useRouter();
  const { isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("Posts");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allUsers, setAllUsers] = useState<UserResult[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoadingPosts(true);
    const url = debouncedQuery.trim()
      ? `${API}/api/event/search?query=${encodeURIComponent(debouncedQuery.trim())}`
      : `${API}/api/event`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: Event[]) => setAllEvents(d))
      .catch(() => setAllEvents([]))
      .finally(() => setLoadingPosts(false));
  }, [debouncedQuery]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoadingPeople(true);
    const url = debouncedQuery.trim()
      ? `${API}/api/User/search?query=${encodeURIComponent(debouncedQuery.trim())}`
      : `${API}/api/User/all`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: UserResult[]) => setAllUsers(d))
      .catch(() => setAllUsers([]))
      .finally(() => setLoadingPeople(false));
  }, [debouncedQuery]);

  const filteredEvents = useMemo(() => {
    const byTag = activeFilter === "ALL"
      ? allEvents
      : allEvents.filter((e) => {
          const t = typeof e.type === "number" ? typeMap[e.type] : (e.type as EventType);
          return EVENT_TAG_STYLES[t]?.title === activeFilter;
        });
    return byTag.slice(0, 20);
  }, [allEvents, activeFilter]);

  const handleViewInsights = useCallback(
    (eventId: number) => router.push(`/admin/tasks/flagged-content/${eventId}`),
    [router],
  );

  return (
    <ThreeColumnLayout>
      <div className="w-full flex flex-col gap-4 animate-fade-up pb-32 lg:pb-0">
        <SearchBar value={query} onChange={setQuery} placeholder="Search..." />

        <div className="flex w-full border-b border-white/10">
          {(["Posts", "People"] as TabType[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-2 text-center transition-all cursor-pointer ${
                activeTab === tab ? "text-white border-b-2 border-white font-bold" : "text-white/40 border-b-2 border-transparent"
              }`}
            >{tab}</button>
          ))}
        </div>

        {activeTab === "Posts" && (
          <>
            <EventFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <div className="flex flex-col gap-2">
              {loadingPosts && <p className="text-white/40 text-sm text-center mt-10">Searching posts...</p>}
              {!loadingPosts && filteredEvents.length === 0 && (
                <p className="text-white/40 text-sm text-center mt-10">
                  {query.trim() ? "No posts found." : "No posts available."}
                </p>
              )}
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isAdminView={isAdmin}
                  {...(isAdmin && { onViewInsights: handleViewInsights, flagCount: 0 })}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === "People" && (
          <div className="flex flex-col gap-1">
            {loadingPeople && <p className="text-white/40 text-sm text-center mt-10">Searching people...</p>}
            {!loadingPeople && allUsers.length === 0 && (
              <p className="text-white/40 text-sm text-center mt-10">
                {query.trim() ? "No people found." : "No users available."}
              </p>
            )}
            {allUsers.map((user) => (
              <button key={user.id} onClick={() => router.push(`/users/${user.id}`)}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-white/60 text-sm font-bold">
                    {getInitials(user.fullName ?? user.email)}
                  </span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-white font-semibold text-base">
                    {user.fullName ?? user.email.split("@")[0]}
                  </span>
                  <span className="text-white/40 text-xs">{user.email}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </ThreeColumnLayout>
  );
}