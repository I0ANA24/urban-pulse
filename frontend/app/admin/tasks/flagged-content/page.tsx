"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/dashboard/EventFilters";
import { Event, EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import GoBackButton from "@/components/ui/GoBackButton";

const mockFlaggedEvents: (Event & { flagCount: number })[] = [
  {
    id: 101,
    description:
      "A huge <strong>flood</strong> happened this morning..Let's do something now because we are blocked here",
    type: "Emergency" as EventType,
    latitude: 47.15,
    longitude: 27.58,
    tags: ["Emergency"],
    imageUrl: null,
    createdByEmail: "carolina.gorge@mail.com",
    createdByUserId: 10,
    createdAt: "2026-03-02T08:30:00Z",
    isActive: true,
    flagCount: 1,
  },
  {
    id: 102,
    description:
      "HAHAHHA loooookkk this is soooo funny!!! Not an emergency but HEHEHEHEHEHEHEEHEHEHE",
    type: "Emergency" as EventType,
    latitude: 47.16,
    longitude: 27.59,
    tags: ["Emergency"],
    imageUrl: null,
    createdByEmail: "ioana.baciu@mail.com",
    createdByUserId: 11,
    createdAt: "2026-03-02T09:15:00Z",
    isActive: true,
    flagCount: 14,
  },
  {
    id: 103,
    description:
      "Bluey bluey hair guyysss. I love this apppppppppppppppp urban pulse heh",
    type: "Skill" as EventType,
    latitude: 47.17,
    longitude: 27.57,
    tags: ["Skill"],
    imageUrl: null,
    createdByEmail: "carolina.gorge@mail.com",
    createdByUserId: 10,
    createdAt: "2026-03-02T09:30:00Z",
    isActive: true,
    flagCount: 5,
  },
];

export default function FlaggedContentPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filteredEvents =
    activeFilter === "ALL"
      ? mockFlaggedEvents
      : mockFlaggedEvents.filter((e) => {
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
    <div className="w-full flex flex-col gap-4 animate-fade-up pb-20">
      {/* Header */}
      <div className="flex items-center relative mb-4">
        <GoBackButton />

        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <h1 className="text-white font-bold text-xl">Flagged content</h1>
          <span className="w-2.5 h-2.5 rounded-full bg-blue" />
        </div>
      </div>

      {/* Filters */}
      <EventFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {/* Flagged posts feed */}
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
    </div>
  );
}
