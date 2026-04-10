"use client";

import { MoreVertical, BadgeCheck, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = "http://localhost:5248";

interface CardHeaderProps {
  initials: string;
  name: string;
  date: string;
  avatarUrl?: string | null;
  isVerifiedUser?: boolean;
  isMyPost?: boolean;
  onDelete?: () => void;
  imageUrl: string | null;
  eventId: number;
  userId: number;
}

export default function CardHeader({
  initials,
  name,
  date,
  avatarUrl,
  isVerifiedUser,
  isMyPost,
  onDelete,
  imageUrl,
  eventId,
  userId,
}: CardHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  return (
    <div className={`w-full h-17.5 lg:h-20 p-5 lg:px-10 z-10 flex justify-between items-center bg-secondary rounded-3xl ${imageUrl ? "rounded-b-3xl" : "rounded-b-none"}`}>
      <Link href={`/users/${userId}`}>
        <div className="flex gap-4 justify-center items-center">
          <div className="size-10 lg:size-11 rounded-full overflow-hidden bg-[#2e2e2e] flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                width={44}
                height={44}
                alt={name}
                className="rounded-full w-full h-full object-cover"
              />
            ) : (
              <span className="text-white/60 text-sm font-bold">
                {initials}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center items-start">
            <div className="flex items-center gap-1">
              <p className="font-bold lg:text-lg">{name}</p>
              {isVerifiedUser && (
                <BadgeCheck size={20} className="text-green-light fill-green-light/20" />
              )}
            </div>
            <span className="text-white/40 text-xs lg:text-sm">{date}</span>
          </div>
        </div>
      </Link>

      <div className="relative flex justify-center items-center">
        {isMyPost ? (
          <button onClick={onDelete} className="p-1.5 bg-red-emergency/20 rounded-md transition-colors hover:bg-red-emergency/40 cursor-pointer">
            <Trash2 size={18} className="text-red-emergency" />
          </button>
        ) : (
          <>
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 transition-colors hover:text-white/70 cursor-pointer">
              <MoreVertical size={24} className="text-white" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full bg-background border border-red-emergency/60 rounded-full overflow-hidden z-50">
                <button
                  onClick={() => { setShowMenu(false); router.push(`/report?eventId=${eventId}`); }}
                  className="w-full text-center px-6 py-2 text-red-emergency font-bold text-sm hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                >
                  Report
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}