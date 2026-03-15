"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { Event, EventType } from "@/types/Event";
import EventTag from "../ui/EventTag";

function getInitials(email: string) {
  return email?.split("@")[0]?.slice(0, 2).toUpperCase() ?? "UP";
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    " · " +
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function VerificationBlock() {
  return (
    <div className="flex flex-col gap-3 mt-3 mb-1 w-full">
      <div className="flex items-center gap-3 w-full">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">
          Is this info correct?
        </span>
        <div className="h-px bg-white/10 flex-1" />
      </div>
      <div className="flex gap-3 w-full">
        <button className="flex-1 bg-[#4ADE80] text-[#023612] rounded-full py-2 text-xs font-bold transition-transform active:scale-95">
          Yes, it is.
        </button>
        <button className="flex-1 bg-red-emergency text-white rounded-full py-2 text-xs font-bold transition-transform active:scale-95">
          No, it isn't.
        </button>
      </div>
    </div>
  );
}

// Blocul de mesagerie pentru SKILL și LEND
function MessageBlock() {
  return (
    <div className="mt-3 mb-1 w-full flex justify-center">
      <button className="w-3/4 bg-[#BEDCF5] text-[#04007D] rounded-full py-2 text-xs font-bold transition-transform active:scale-95">
        Message
      </button>
    </div>
  );
}

export default function EventCard({ event }: { event: Event }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(0);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const typeMap: Record<number, EventType> = {
    0: "General",
    1: "Emergency",
    2: "Skill",
    3: "Lend",
  };
  const mappedType =
    typeof event.type === "number" ? typeMap[event.type] : event.type;

  return (
    <div className="w-full bg-[#111111] border border-white/6 rounded-2xl overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-white/60">
              {getInitials(event.createdByEmail)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-white text-sm font-medium leading-tight">
              {event.createdByEmail?.split("@")[0] ?? "Unknown"}
            </span>
            <span className="text-white/30 text-xs">
              {formatDate(event.createdAt)}
            </span>
          </div>
        </div>

        <button
          onClick={() => setSaved(!saved)}
          className="p-1.5 rounded-full transition-colors"
        >
          <Bookmark
            size={18}
            className={
              saved ? "fill-green-400 text-green-400" : "text-white/30"
            }
          />
        </button>
      </div>

      {/* image */}
      {event.imageUrl && (
        <div className="relative w-full aspect-video mt-2 rounded-xl overflow-hidden">
          {" "}
          <Image
            src={`http://localhost:5248${event.imageUrl}`}
            alt="event"
            fill
            sizes="100vw"
            className="object-cover"
            loading="eager"
          />
        </div>
      )}

      {/* text */}
      <div className="px-4 pt-3 pb-2">
        {event.title && (
          <h3 className="text-white font-bold text-[15px] flex items-center gap-1">
            {event.title}{" "}
            {mappedType === "Lend" && <span className="text-blue-400">💧</span>}
          </h3>
        )}
        <p className="text-white/85 text-sm leading-relaxed">
          {event.description}
        </p>
      </div>

      <div className="px-4">
        {mappedType === "Emergency" && <VerificationBlock />}
        {(mappedType === "Skill" || mappedType === "Lend") && <MessageBlock />}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between px-4 pb-4 pt-1">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 transition-colors"
          >
            <Heart
              size={18}
              className={liked ? "fill-red-400 text-red-400" : "text-white/30"}
            />
            <span className="text-white/40 text-xs">{likes}</span>
          </button>

          <button className="flex items-center gap-1.5">
            <MessageCircle size={18} className="text-white/30" />
            <span className="text-white/40 text-xs">0</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <EventTag type={mappedType} />
        </div>
      </div>
    </div>
  );
}
