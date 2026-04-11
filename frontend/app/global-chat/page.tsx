"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSignalR } from "@/context/SignalRContext";
import TopBar from "@/components/layout/TopBar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import ChatRightSidebar from "@/components/layout/ChatRightSidebar";

const API = "http://localhost:5248";

interface GlobalMessage {
  id: number;
  text: string;
  senderId: number;
  senderFullName: string;
  senderAvatarUrl: string | null;
  createdAt: string;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday)
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function GlobalChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { globalChatConnection } = useSignalR();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.id));

    fetch(`${API}/api/global-chat/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, []);

  useEffect(() => {
    if (!globalChatConnection) return;
    const handler = (msg: GlobalMessage) => {
      setMessages((prev) => [...prev, msg]);
    };
    globalChatConnection.on("NewGlobalMessage", handler);
    return () => globalChatConnection.off("NewGlobalMessage", handler);
  }, [globalChatConnection]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !globalChatConnection) return;
    try {
      await globalChatConnection.invoke("SendMessage", text.trim());
      setText("");
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      {/* Desktop TopBar */}
      <div className="hidden lg:block shrink-0 px-6">
        <TopBar back={false} notifications={true} settings={false} />
      </div>

      {/* Content area: sidebars + conversation */}
      <div className="flex-1 flex overflow-hidden lg:px-6 lg:gap-8 xl:gap-14 min-h-0">
        <LeftSidebar />

        {/* Conversation */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-background shrink-0">
            <button onClick={() => router.back()} className="lg:hidden">
              <Image src="/undo.svg" alt="back" width={40} height={30} />
            </button>
            <div className="w-10 h-10 rounded-full bg-green-light/20 border border-green-light flex items-center justify-center shrink-0">
              <span className="text-green-light font-bold text-xs">ALL</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold">Neighbours&apos; chat</span>
              <span className="text-white/40 text-xs">All neighbours</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0" style={{ scrollbarWidth: "none" }}>
            {messages.length === 0 && (
              <p className="text-white/30 text-sm text-center mt-10">
                No messages yet. Say hi to your neighbours! 👋
              </p>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <button
                      onClick={() => router.push(`/users/${msg.senderId}`)}
                      className="w-8 h-8 rounded-full overflow-hidden bg-secondary flex items-center justify-center shrink-0 self-end cursor-pointer"
                    >
                      {msg.senderAvatarUrl ? (
                        <Image
                          src={msg.senderAvatarUrl}
                          alt={msg.senderFullName}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-white text-[10px] font-bold">
                          {getInitials(msg.senderFullName)}
                        </span>
                      )}
                    </button>
                  )}
                  <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <button
                        onClick={() => router.push(`/users/${msg.senderId}`)}
                        className="text-white/50 text-xs px-1 hover:text-white/80 transition-colors cursor-pointer"
                      >
                        {msg.senderFullName}
                      </button>
                    )}
                    <div className={`px-4 py-2.5 rounded-3xl text-sm ${
                      isMe ? "bg-[#B8D4F0] text-[#003A69]" : "bg-[#2A2A2A] text-white"
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-white/30 text-[10px] px-1">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-4 border-t border-white/10 flex gap-3 items-center bg-background shrink-0">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Say something to your neighbours..."
              className="flex-1 bg-[#2e2e2e] text-white text-sm px-4 py-3 rounded-full outline-none placeholder:text-white/30"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="w-10 h-10 bg-[#B8D4F0] rounded-full flex items-center justify-center disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#003A69]">
                <path d="M2 12l19-9-9 19-2-8-8-2z" />
              </svg>
            </button>
          </div>
        </div>

        <ChatRightSidebar />
      </div>
    </div>
  );
}
