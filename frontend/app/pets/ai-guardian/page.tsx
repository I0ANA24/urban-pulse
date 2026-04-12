"use client";

import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import CardHeader from "@/components/events/card/CardHeader";
import CardMedia from "@/components/events/card/CardMedia";
import CardContent from "@/components/events/card/CardContent";
import ConfirmModal from "@/components/ui/ConfirmModal";
import EventTag from "@/components/ui/EventTag";
import { useUser } from "@/context/UserContext";
import { Event } from "@/types/Event";

const MOCK_POSTS: Event[] = [
  {
    id: 1,
    type: "LostPet",
    description: "Please help me find <strong>Bam</strong>. He has brown eyes, he\u2019s short and very scared!",
    latitude: 0,
    longitude: 0,
    tags: [],
    imageUrl: "https://picsum.photos/seed/bam-dog/600/400",
    createdByEmail: "greta.bennett@example.com",
    createdByFullName: "Greta Bennett",
    createdByAvatarUrl: "https://picsum.photos/seed/greta/100/100",
    createdByUserId: 1,
    isVerifiedUser: true,
    createdAt: "2026-03-02T08:33:00",
    isActive: true,
  },
  {
    id: 2,
    type: "LostPet",
    description: "Please help me find <strong>Doggie</strong>. He has brown eyes, he\u2019s short and very scared!",
    latitude: 0,
    longitude: 0,
    tags: [],
    imageUrl: "https://picsum.photos/seed/doggie-pet/600/400",
    createdByEmail: "greta.bennett@example.com",
    createdByFullName: "Greta Bennett",
    createdByAvatarUrl: "https://picsum.photos/seed/greta/100/100",
    createdByUserId: 1,
    isVerifiedUser: true,
    createdAt: "2026-03-01T14:12:00",
    isActive: true,
  },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} \u00A0 ${hours}:${minutes}`;
}

function AiGuardianCard({
  post,
  onDelete,
}: {
  post: Event;
  onDelete: (id: number) => void;
}) {
  const displayName = post.createdByFullName ?? post.createdByEmail?.split("@")[0] ?? "Unknown";

  return (
    <div className="w-full mb-4">
      <CardHeader
        initials={getInitials(displayName)}
        name={displayName}
        date={formatDate(post.createdAt)}
        avatarUrl={post.createdByAvatarUrl}
        isVerifiedUser={post.isVerifiedUser}
        isMyPost={true}
        onDelete={() => onDelete(post.id)}
        imageUrl={post.imageUrl}
        eventId={post.id}
        userId={post.createdByUserId}
      />
      <CardMedia imageUrl={post.imageUrl} />
      <div className={`bg-secondary -mt-4 z-10 rounded-b-4xl ${post.imageUrl ? "rounded-t-4xl" : "rounded-t-none"} p-5 lg:px-10`}>
        <CardContent description={post.description} />
        <div className="flex items-center justify-between pt-3 border-t-2 border-white/10 mt-3">
          <Link
            href={`/pets/matches/${post.id}`}
            className="flex items-center gap-2 bg-[#2D2A4A] hover:bg-[#3A3660] transition-colors px-4 py-2 rounded-full cursor-pointer"
          >
            <Sparkles size={14} className="text-white" />
            <span className="text-white text-xs font-bold">See matches</span>
          </Link>
          <EventTag type="LostPet" />
        </div>
      </div>
    </div>
  );
}

export default function AiGuardianPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Event[]>(MOCK_POSTS);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    setPosts((prev) => prev.filter((p) => p.id !== deleteId));
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  return (
    <ThreeColumnLayout>
      <div className="flex flex-col gap-5 py-2">

        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-20 h-20 rounded-full bg-[#2D2A4A] flex items-center justify-center shrink-0">
            <Sparkles size={36} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-3xl">Hello,<br />{firstName}!</h1>
          </div>
        </div>
        <p className="text-white/50 text-sm -mt-2">These suggestions might help you out:</p>

        {/* Posts */}
        {posts.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-10">No lost pet posts yet.</p>
        )}
        <div className="flex flex-col">
          {posts.map((post) => (
            <AiGuardianCard key={post.id} post={post} onDelete={handleDeleteClick} />
          ))}
        </div>

      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        icon={<Trash2 />}
        title="Delete post"
        boldText="delete this post"
      />

    </ThreeColumnLayout>
  );
}
