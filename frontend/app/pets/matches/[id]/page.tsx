"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";
import EventCard from "@/components/events/EventCard";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { Event } from "@/types/Event";

// Mock: original lost pet posts (keyed by id)
const ORIGINAL_POSTS: Record<number, { imageUrl: string | null; description: string }> = {
  1: {
    imageUrl: "https://picsum.photos/seed/bam-dog/600/400",
    description: "Please help me find <strong>Bam</strong>. He has brown eyes, he\u2019s short and very scared!",
  },
  2: {
    imageUrl: "https://picsum.photos/seed/doggie-pet/600/400",
    description: "Please help me find <strong>Doggie</strong>. He has brown eyes, he\u2019s short and very scared!",
  },
};

// Mock: matched found-pet posts per original post id
const MOCK_MATCHES: Record<number, Array<{ score: number; event: Event }>> = {
  1: [
    {
      score: 50,
      event: {
        id: 101,
        type: "FoundPet",
        description: "Hi, we call this one Momo. He seems like he can be someones' pet.",
        latitude: 0,
        longitude: 0,
        tags: [],
        imageUrl: "https://picsum.photos/seed/moore-dog/600/400",
        createdByEmail: "moore.b@example.com",
        createdByFullName: "Moore B",
        createdByAvatarUrl: "https://picsum.photos/seed/moore/100/100",
        createdByUserId: 10,
        isVerifiedUser: true,
        createdAt: "2026-03-02T08:33:00",
        isActive: true,
      },
    },
    {
      score: 80,
      event: {
        id: 102,
        type: "FoundPet",
        description: "Heyy I found this cutie right on my street. The owner should contact me so we can discuss",
        latitude: 0,
        longitude: 0,
        tags: [],
        imageUrl: "https://picsum.photos/seed/penelope-dog/600/400",
        createdByEmail: "penelope.bonk@example.com",
        createdByFullName: "Penelope Bonk",
        createdByAvatarUrl: "https://picsum.photos/seed/penelope/100/100",
        createdByUserId: 11,
        isVerifiedUser: false,
        createdAt: "2026-03-01T10:05:00",
        isActive: true,
      },
    },
  ],
  2: [
    {
      score: 70,
      event: {
        id: 103,
        type: "FoundPet",
        description: "Found a small brown dog near the train station. Very friendly, no collar.",
        latitude: 0,
        longitude: 0,
        tags: [],
        imageUrl: "https://picsum.photos/seed/alex-dog/600/400",
        createdByEmail: "alex.m@example.com",
        createdByFullName: "Alex M",
        createdByAvatarUrl: "https://picsum.photos/seed/alexm/100/100",
        createdByUserId: 12,
        isVerifiedUser: true,
        createdAt: "2026-02-28T10:05:00",
        isActive: true,
      },
    },
  ],
};

export default function PetMatchesPage({ params }: { params: { id: string } }) {
  const postId = Number(params.id);
  const original = ORIGINAL_POSTS[postId];
  const matches = MOCK_MATCHES[postId] ?? [];

  const imgSrc = original?.imageUrl?.startsWith("http")
    ? original.imageUrl
    : original?.imageUrl
    ? `http://localhost:5248${original.imageUrl}`
    : null;

  return (
    <ThreeColumnLayout>
      <div className="flex flex-col gap-4 py-2">

        {/* Original post image */}
        {imgSrc ? (
          <div className="relative w-full h-52 rounded-3xl overflow-hidden">
            <Image src={imgSrc} alt="Your post" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-full h-52 rounded-3xl bg-secondary flex items-center justify-center">
            <span className="text-white/20 text-sm">No image</span>
          </div>
        )}

        {/* Match count */}
        <div className="flex items-center gap-2 px-1">
          <Sparkles size={18} className="text-white" />
          <p className="text-white font-bold text-lg">
            You have {matches.length} {matches.length === 1 ? "match" : "matches"}!
          </p>
        </div>

        {/* Match cards */}
        {matches.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-10">No matches found yet.</p>
        )}

        <div className="flex flex-col">
          {matches.map(({ score, event }) => (
            <div key={event.id}>
              <p className="text-white/60 text-sm font-bold mb-2 px-1">
                Score: <span className="text-white">{score}%</span>
              </p>
              <EventCard event={event} />
            </div>
          ))}
        </div>

      </div>
    </ThreeColumnLayout>
  );
}
