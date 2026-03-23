"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Conversation {
  id: number;
  otherUserId: number;
  otherUserEmail: string;
  otherUserFullName: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  eventId: number | null;
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
  if (isToday) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function ChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5248/api/chat/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 pb-[8vh]">
      <h1 className="text-white font-bold text-2xl">Messages</h1>

      {loading && (
        <p className="text-white/40 text-sm text-center mt-10">Loading...</p>
      )}

      {!loading && conversations.length === 0 && (
        <p className="text-white/40 text-sm text-center mt-10">
          No conversations yet.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => router.push(`/chat-conversation/${conv.id}`)}
            className="w-full bg-secondary rounded-2xl px-4 py-3 flex items-center gap-3 text-left"
          >
            <div className="w-12 h-12 rounded-full bg-[#2e2e2e] border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-white/60">
                {getInitials(conv.otherUserFullName, conv.otherUserEmail)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-sm">
                  {conv.otherUserFullName ?? conv.otherUserEmail?.split("@")[0]}
                </span>
                <span className="text-white/30 text-xs">
                  {formatTime(conv.lastMessageAt)}
                </span>
              </div>
              <p className="text-white/40 text-xs mt-0.5 truncate">
                {conv.lastMessage ?? "No messages yet"}
              </p>
            </div>

            {conv.unreadCount > 0 && (
              <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                <span className="text-black text-[10px] font-bold">{conv.unreadCount}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}