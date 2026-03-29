"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GoBackButton from "@/components/ui/GoBackButton";
import { HiUsers } from "react-icons/hi";

// ── Types ──
type TabType = "Users" | "Posts";

interface DuplicateUser {
  id: string;
  name: string;
  avatar: string;
  matchesCount: number;
}

interface DuplicatePost {
  id: string;
  preview: string;
  matchesCount: number;
}

const mockDuplicateUsers: DuplicateUser[] = [
  {
    id: "1",
    name: "Johnny Depp",
    avatar: "/profile.png",
    matchesCount: 2,
  },
  {
    id: "2",
    name: "Charles Leclerc",
    avatar: "/profile.png",
    matchesCount: 3,
  },
];

const mockDuplicatePosts: DuplicatePost[] = [
  {
    id: "1",
    preview: "Hellooo! My TV is suddenly not working anymore and I really...",
    matchesCount: 2,
  },
  {
    id: "2",
    preview: "What do you guys think about this pink colour for my door...",
    matchesCount: 2,
  },
];

export default function MergeDuplicatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("Users");

  const handleReviewUser = (userId: string) => {
    router.push(`/admin/tasks/merge-duplicates/users/${userId}`);
  };

  const handleReviewPost = (postId: string) => {
    router.push(`/admin/tasks/merge-duplicates/posts/${postId}`);
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-up pb-20">
      {/* Header */}
      <div className="flex items-center relative mb-4">
        <GoBackButton />

        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <h1 className="text-white font-bold text-xl">Merge duplicates</h1>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-primary" />
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full flex justify-between items-center gap-3">
        <button
          onClick={() => setActiveTab("Users")}
          className={`w-38 h-11 rounded-[10] font-bold text-xl transition-all cursor-pointer ${
            activeTab === "Users"
              ? "bg-yellow-primary text-black"
              : "bg-yellow-primary/32 text-black/47"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("Posts")}
          className={`w-38 h-11 rounded-[10] font-bold text-xl transition-all cursor-pointer ${
            activeTab === "Posts"
              ? "bg-yellow-primary text-black"
              : "bg-yellow-primary/32 text-black/47"
          }`}
        >
          Posts
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 mt-1">
        {activeTab === "Users" && (
          <>
            {mockDuplicateUsers.length === 0 && (
              <p className="text-white/40 text-center mt-10">
                No duplicate users found.
              </p>
            )}

            {mockDuplicateUsers.map((user) => (
              <div
                key={user.id}
                className="bg-secondary border border-yellow-primary rounded-[20] p-5 flex flex-col gap-3"
              >
                {/* Top row: avatar + name + duplicate icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-13 h-13 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={52}
                        height={52}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Name */}
                    <span className="text-white text-xl">{user.name}</span>
                  </div>

                  {/* Duplicate users icon */}
                  <HiUsers
                    size={46}
                    fill="#FFF081"
                    className="text-yellow-primary"
                  />
                </div>

                {/* Matches count */}
                <p className="text-green-light text-xl">
                  {user.matchesCount} matches
                </p>

                {/* Review button */}
                <button
                  onClick={() => handleReviewUser(user.id)}
                  className="w-36 h-8.5 self-start bg-green-light hover:bg-green-light/80 active:scale-95 transition-all text-black font-bold rounded-full cursor-pointer"
                >
                  Review
                </button>
              </div>
            ))}
          </>
        )}

        {activeTab === "Posts" && (
          <>
            {mockDuplicatePosts.length === 0 && (
              <p className="text-white/40 text-sm text-center mt-10">
                No duplicate posts found.
              </p>
            )}

            {mockDuplicatePosts.map((post) => (
              <div
                key={post.id}
                className="bg-secondary border border-yellow-primary rounded-[20] p-5 flex flex-col gap-3"
              >
                {/* Post preview text */}
                <p className="line-clamp-2 pr-16">{post.preview}</p>

                {/* Matches count + duplicate posts icon */}
                <div className="flex items-center justify-between -my-1">
                  <p className="text-green-light text-xl">
                    {post.matchesCount} matches
                  </p>

                  {/* Overlapping squares icon */}
                  <div className="relative w-10 h-10">
                    <div className="absolute top-0 left-0 w-7 h-7 border-2 border-yellow-primary rounded-md bg-transparent" />
                    <div className="absolute bottom-0 right-0 w-7 h-7 border-2 border-yellow-primary rounded-md bg-yellow-primary/20" />
                  </div>
                </div>

                {/* Review button */}
                <button
                  onClick={() => handleReviewPost(post.id)}
                  className="w-36 h-8.5 self-start bg-green-light hover:bg-green-light/80 active:scale-95 transition-all text-black font-bold rounded-full cursor-pointer"
                >
                  Review
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
