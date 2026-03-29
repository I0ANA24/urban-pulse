"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface FlaggedUser {
  id: string;
  name: string;
  avatar: string;
  reportsCount: number;
  trustScore: number;
}

const mockFlaggedUsers: FlaggedUser[] = [
  { id: "1", name: "Johann Strauss", avatar: "/profile.png", reportsCount: 3, trustScore: 57 },
  { id: "2", name: "Monika Anderson", avatar: "/profile.png", reportsCount: 5, trustScore: 42 },
  { id: "3", name: "Chris Louboutin", avatar: "/profile.png", reportsCount: 2, trustScore: 68 },
  { id: "4", name: "Jimmy Choo", avatar: "/profile.png", reportsCount: 4, trustScore: 51 },
  { id: "5", name: "Anna Wintour", avatar: "/profile.png", reportsCount: 1, trustScore: 78 },
  { id: "6", name: "Johnny Depp", avatar: "/profile.png", reportsCount: 6, trustScore: 35 },
  { id: "7", name: "Shawn Mendes", avatar: "/profile.png", reportsCount: 2, trustScore: 72 },
];
// ──────────────────────────────────────────────────────────

export default function FlaggedUsersPage() {
  const router = useRouter();

  const handleUserClick = (userId: string) => {
    router.push(`/admin/tasks/flagged-users/${userId}`);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center relative">
        <button
          onClick={() => router.back()}
          className="cursor-pointer hover:scale-105 active:scale-95 z-10"
        >
          <Image
            src="/undo.svg"
            alt="go_back"
            width={69}
            height={49}
            className="-ml-2"
          />
        </button>

        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <h1 className="text-white font-bold text-xl">Flagged users</h1>
          <span className="w-2.5 h-2.5 rounded-full bg-red-emergency" />
        </div>
      </div>

      {/* User list */}
      <div className="flex flex-col gap-3 mt-2">
        {mockFlaggedUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserClick(user.id)}
            className="w-full bg-secondary border border-red-emergency rounded-2xl px-5 py-4 flex items-center justify-between transition-transform active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-white overflow-hidden shrink-0">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name */}
              <span className="text-white text-xl">
                {user.name}
              </span>
            </div>

            {/* Chevron */}
            <ChevronRight className={`size-9`} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </div>
  );
}