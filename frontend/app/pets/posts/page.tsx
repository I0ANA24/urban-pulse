"use client";

import { useState } from "react";
import EventCard from "@/components/events/EventCard";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { Event } from "@/types/Event";

type PetTab = "LostPet" | "FoundPet";

const MOCK_POSTS: Event[] = [
  {
    id: 1,
    type: "LostPet",
    description: "Please help me find <strong>Bam</strong>. He has brown eyes, he\u2019s short and very scared!",
    latitude: 0,
    longitude: 0,
    tags: [],
    imageUrl: null,
    createdByEmail: "ian.kook@example.com",
    createdByFullName: "Ian Kook",
    createdByAvatarUrl: undefined,
    createdByUserId: 1,
    isVerifiedUser: true,
    createdAt: "2026-03-02T08:33:00",
    isActive: true,
  },
  {
    id: 2,
    type: "FoundPet",
    description: "Heyy I found this cutie right on my street. The owner should contact me so we can discuss",
    latitude: 0,
    longitude: 0,
    tags: [],
    imageUrl: null,
    createdByEmail: "moore.b@example.com",
    createdByFullName: "Moore B",
    createdByAvatarUrl: undefined,
    createdByUserId: 2,
    isVerifiedUser: true,
    createdAt: "2026-03-02T08:33:00",
    isActive: true,
  },
  {
    id: 3,
    type: "LostPet",
    description: "Has anyone seen <strong>Mochi</strong>? She\u2019s a white cat with blue eyes, very shy.",
    latitude: 0,
    longitude: 0,
    tags: [],
    imageUrl: null,
    createdByEmail: "clara.rumpel@example.com",
    createdByFullName: "Clara Rumpel",
    createdByAvatarUrl: undefined,
    createdByUserId: 3,
    isVerifiedUser: false,
    createdAt: "2026-03-01T14:12:00",
    isActive: true,
  },
];

export default function PetsPostsPage() {
  const [activeTab, setActiveTab] = useState<PetTab>("LostPet");

  const filtered = MOCK_POSTS.filter((p) => p.type === activeTab);

  return (
    <ThreeColumnLayout>
      <div className="flex flex-col gap-5 py-2">

        {/* Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("LostPet")}
            className={`flex-1 py-3 rounded-full font-bold text-sm transition-colors cursor-pointer ${
              activeTab === "LostPet"
                ? "bg-yellow-primary text-[#4D3B03]"
                : "bg-secondary text-white/50"
            }`}
          >
            LOST PETS
          </button>
          <button
            onClick={() => setActiveTab("FoundPet")}
            className={`flex-1 py-3 rounded-full font-bold text-sm transition-colors cursor-pointer ${
              activeTab === "FoundPet"
                ? "bg-blue text-[#04007D]"
                : "bg-secondary text-white/50"
            }`}
          >
            FOUND PETS
          </button>
        </div>

        {/* Posts */}
        <div className="flex flex-col">
          {filtered.map((post) => (
            <EventCard key={post.id} event={post} />
          ))}
        </div>

      </div>
    </ThreeColumnLayout>
  );
}
