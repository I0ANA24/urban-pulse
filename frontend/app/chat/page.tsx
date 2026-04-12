"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { useSevereWeather } from "@/context/SevereWeatherContext";

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

export default function ChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [avatarUrls, setAvatarUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isSevereWeather } = useSevereWeather();

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/chat/conversations`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          setConversations([]);
          return;
        }
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load chat conversations:", error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;
    const loadAvatars = async () => {
      try {
        const token = localStorage.getItem("token");
        const uniqueIds = [...new Set(conversations.map((c) => c.otherUserId))];
        const results = await Promise.all(
          uniqueIds.map(async (uid) => {
            try {
              const res = await fetch(`${API}/api/user/${uid}`, { headers: { Authorization: `Bearer ${token}` } });
              if (!res.ok) return { uid, avatarUrl: null };
              const data = await res.json();
              return { uid, avatarUrl: data.avatarUrl ?? null };
            } catch {
              return { uid, avatarUrl: null };
            }
          })
        );

        const map: Record<number, string> = {};
        results.forEach(({ uid, avatarUrl }) => { if (avatarUrl) map[uid] = avatarUrl; });
        setAvatarUrls(map);
      } catch (error) {
        console.error("Failed to load chat avatars:", error);
        setAvatarUrls({});
      }
    };

    loadAvatars();
  }, [conversations]);

  return (
    <ThreeColumnLayout>
    <div className="w-full flex flex-col gap-4 pb-[8vh]">

      {/* Severe weather chat card — visible only during severe weather */}
      {isSevereWeather && (
        <button
          onClick={() => router.push("/severe-chat")}
          className="w-full bg-red-emergency/10 border border-red-emergency animate-pulse rounded-2xl px-4 py-4 flex flex-col gap-2 text-left cursor-pointer transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-emergency/20 border border-red-emergency flex items-center justify-center shrink-0">
              <span className="text-xl leading-none">📌</span>
            </div>
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span className="text-red-emergency font-bold text-base">
                Safety Check-in
              </span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-emergency animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-red-emergency animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-red-emergency animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
          <p className="text-white/40 text-sm">
            Severe weather detected — coordinate with your neighbours
          </p>
        </button>
      )}

      {/* Global chat card */}
      <button
        onClick={() => router.push("/global-chat")}
        className="w-full bg-secondary border border-green-light rounded-2xl px-4 py-4 flex flex-col gap-2 text-left cursor-pointer transition-transform active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-light/20 border border-green-light flex items-center justify-center shrink-0">
            <span className="text-green-light font-bold text-xs">ALL</span>
          </div>
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="text-green-light font-bold text-base">
              Neighbours' chat
            </span>
            <span className="w-2 h-2 rounded-full bg-green-light" />
          </div>
        </div>
        <p className="text-white/40 text-sm">
          Chat with all your neighbours
        </p>
      </button>

      {loading && <p className="text-white/40 text-sm text-center mt-6">Loading...</p>}

      {!loading && conversations.length === 0 && (
        <p className="text-white/40 text-sm text-center mt-6">No private conversations yet.</p>
      )}

      {conversations.length > 0 && (
        <>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-white font-bold text-lg">Your chats</span>
            <div className="w-full h-px bg-white/20" />
          </div>

          <div className="flex flex-col gap-3">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat-conversation/${conv.id}`)}
                className="w-full bg-secondary rounded-2xl px-4 py-3 flex flex-col gap-2 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#2e2e2e] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {avatarUrls[conv.otherUserId] ? (
                      <Image
                        src={avatarUrls[conv.otherUserId]}
                        width={36}
                        height={36}
                        alt={conv.otherUserFullName ?? ""}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-white/60">
                        {getInitials(conv.otherUserFullName, conv.otherUserEmail)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="text-white font-semibold text-base truncate">
                      {conv.otherUserFullName ?? conv.otherUserEmail?.split("@")[0]}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {conv.unreadCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                      )}
                      <span className="text-white/40 text-xs">{formatTime(conv.lastMessageAt)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-white/40 text-sm truncate">
                  {conv.lastMessage?.startsWith("__INFO_CARD__")
                    ? "📋 Personal Info"
                    : conv.lastMessage ?? "No messages yet"}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
    </ThreeColumnLayout>
  );
}