"use client";

import { useState, useEffect } from "react";
import EventCard from "@/components/events/EventCard";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { Event } from "@/types/Event";
import { API_BASE_URL as API } from "@/lib/api";

type PetTab = "LostPet" | "FoundPet";

export default function PetsPostsPage() {
  const [activeTab, setActiveTab] = useState<PetTab>("LostPet");
  const [posts, setPosts] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const [lostRes, foundRes] = await Promise.all([
          fetch(`${API}/api/Event/type/LostPet`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/Event/type/FoundPet`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const lostPosts: Event[] = lostRes.ok ? await lostRes.json() : [];
        const foundPosts: Event[] = foundRes.ok ? await foundRes.json() : [];
        setPosts([...lostPosts, ...foundPosts]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const typeToNumber: Record<PetTab, number> = { LostPet: 4, FoundPet: 5 };
  const filtered = posts.filter((p) => Number(p.type) === typeToNumber[activeTab]);

  return (
    <ThreeColumnLayout>
      <div className="flex flex-col gap-5 py-2">
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

        {loading ? (
          <p className="text-white/40 text-sm text-center mt-10">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-white/40 text-sm text-center mt-10">No posts yet.</p>
        ) : (
          <div className="flex flex-col">
            {filtered.map((post) => (
              <EventCard key={post.id} event={post} />
            ))}
          </div>
        )}
      </div>
    </ThreeColumnLayout>
  );
}