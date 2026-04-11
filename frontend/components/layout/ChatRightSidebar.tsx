"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API = "http://localhost:5248";

interface Conversation {
  id: number;
  otherUserId: number;
  otherUserEmail: string;
  otherUserFullName: string | null;
  otherUserAvatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return email?.split("@")[0]?.slice(0, 2).toUpperCase() ?? "UP";
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday)
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function ChatRightSidebar() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [avatarUrls, setAvatarUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setConversations(data));
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;
    const token = localStorage.getItem("token");
    const uniqueIds = [...new Set(conversations.map((c) => c.otherUserId))];
    Promise.all(
      uniqueIds.map((uid) =>
        fetch(`${API}/api/user/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => ({ uid, avatarUrl: data.avatarUrl ?? null }))
      )
    ).then((results) => {
      const map: Record<number, string> = {};
      results.forEach(({ uid, avatarUrl }) => {
        if (avatarUrl) map[uid] = avatarUrl;
      });
      setAvatarUrls(map);
    });
  }, [conversations]);

  return (
    <aside
      className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-3 lg:overflow-y-auto"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Neighbours' chat */}
      <button
        onClick={() => router.push("/global-chat")}
        className="w-full bg-secondary border border-green-light rounded-2xl px-4 py-3 flex flex-col gap-1.5 text-left cursor-pointer transition-transform active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-light/20 border border-green-light flex items-center justify-center shrink-0">
            <span className="text-green-light font-bold text-xs">ALL</span>
          </div>
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="text-green-light font-bold text-sm">
              Neighbours&apos; chat
            </span>
            <span className="w-2 h-2 rounded-full bg-green-light" />
          </div>
        </div>
      </button>

      {conversations.length > 0 && (
        <>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-white font-bold text-base">Your chats</span>
            <div className="w-full h-px bg-white/20" />
          </div>

          <div className="flex flex-col gap-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat-conversation/${conv.id}`)}
                className="w-full bg-secondary rounded-2xl px-3 py-2.5 flex flex-col gap-1 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2e2e2e] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {avatarUrls[conv.otherUserId] ? (
                      <Image
                        src={avatarUrls[conv.otherUserId]}
                        width={32}
                        height={32}
                        alt={conv.otherUserFullName ?? ""}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-[10px] font-semibold text-white/60">
                        {getInitials(conv.otherUserFullName, conv.otherUserEmail)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="text-white font-semibold text-sm truncate">
                      {conv.otherUserFullName ?? conv.otherUserEmail?.split("@")[0]}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {conv.unreadCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                      )}
                      <span className="text-white/40 text-xs">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-white/40 text-xs truncate pl-10">
                  {conv.lastMessage ?? "No messages yet"}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
