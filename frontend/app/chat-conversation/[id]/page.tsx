"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, MoreVertical, BadgeCheck } from "lucide-react";
import Image from "next/image";
import { useSignalR } from "@/context/SignalRContext";
import TopBar from "@/components/layout/TopBar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import ChatRightSidebar from "@/components/layout/ChatRightSidebar";

interface Message {
  id: number;
  text: string;
  senderId: number;
  senderEmail: string;
  senderFullName: string | null;
  createdAt: string;
  isRead: boolean;
  messageType?: string;
}

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [otherUserId, setOtherUserId] = useState<number | null>(null);
  const [otherUserName, setOtherUserName] = useState("");
  const [otherUserAvatar, setOtherUserAvatar] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [ratedMessages, setRatedMessages] = useState<Set<number>>(new Set());
  const [helpedMessages, setHelpedMessages] = useState<Set<number>>(new Set());
  const [hasRated, setHasRated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { connection } = useSignalR();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5248/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.id));

    fetch("http://localhost:5248/api/chat/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const conv = data.find((c: any) => c.id === Number(id));
        if (conv) {
          setOtherUserId(conv.otherUserId);
          setOtherUserName(conv.otherUserFullName ?? conv.otherUserEmail?.split("@")[0]);
          fetch(`http://localhost:5248/api/user/${conv.otherUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((profile) => {
              setOtherUserAvatar(profile.avatarUrl ?? null);
              setIsVerified(profile.isVerified ?? false);
            });
        }
      });

    fetch(`http://localhost:5248/api/chat/conversations/${id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data));

    fetch(`http://localhost:5248/api/chat/conversations/${id}/rating/check`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHasRated(data.hasRated));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!connection) return;
    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };
    connection.on(`NewMessage_${id}`, handleNewMessage);
    return () => connection.off(`NewMessage_${id}`, handleNewMessage);
  }, [connection, id]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5248/api/chat/conversations/${id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    setText("");
  };

  const handleHelped = (msgId: number, helped: boolean) => {
    if (helped) {
      setHelpedMessages((prev) => new Set([...prev, msgId]));
    } else {
      setRatedMessages((prev) => new Set([...prev, msgId]));
      setHasRated(true);
    }
  };

  const handleRating = async (msgId: number, rating: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5248/api/chat/conversations/${id}/rating`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating }),
    });
    setRatedMessages((prev) => new Set([...prev, msgId]));
    setHasRated(true);
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
            <button
              onClick={() => otherUserId && router.push(`/users/${otherUserId}`)}
              className="w-10 h-10 rounded-full bg-[#2e2e2e] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
            >
              {otherUserAvatar ? (
                <Image src={otherUserAvatar} width={40} height={40} alt={otherUserName} className="object-cover w-full h-full" />
              ) : (
                <span className="text-xs font-semibold text-white/60">
                  {otherUserName?.slice(0, 2).toUpperCase()}
                </span>
              )}
            </button>
            <button
              onClick={() => otherUserId && router.push(`/users/${otherUserId}`)}
              className="text-white font-bold flex-1 flex items-center gap-1.5 text-left cursor-pointer"
            >
              {otherUserName}
              {isVerified && (
                <BadgeCheck size={18} className="text-green-light fill-green-light/20 shrink-0" />
              )}
            </button>
            <button className="p-1">
              <MoreVertical size={20} className="text-white/60" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0" style={{ scrollbarWidth: "none" }}>
            {messages.length === 0 && (
              <p className="text-white/30 text-sm text-center mt-10">
                No messages yet. Say hi! 👋
              </p>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              const hasHelped = helpedMessages.has(msg.id);
              const hasRatedThis = ratedMessages.has(msg.id) || hasRated;

              if (msg.messageType === "rating_check" && !isMe) return null;

              if (msg.messageType === "rating_check" && isMe) {
                return (
                  <div key={msg.id} className="flex flex-col items-center gap-3 my-4 px-2">
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-4 w-full flex flex-col gap-3">
                      <p className="text-white/80 text-sm text-center font-medium">
                        {msg.text}
                      </p>
                      {!hasHelped && !hasRatedThis && (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleHelped(msg.id, true)}
                            className="flex-1 py-2.5 bg-green-400 text-black rounded-full text-xs font-bold"
                          >
                            Yes, they helped!
                          </button>
                          <button
                            onClick={() => handleHelped(msg.id, false)}
                            className="flex-1 py-2.5 bg-white/10 text-white rounded-full text-xs font-bold"
                          >
                            No, they didn&apos;t
                          </button>
                        </div>
                      )}
                      {hasHelped && !hasRatedThis && (
                        <>
                          <p className="text-white/50 text-xs text-center">
                            How would you rate the help?
                          </p>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleRating(msg.id, "helpful")}
                              className="flex-1 py-2.5 bg-green-400 text-black rounded-full text-xs font-bold"
                            >
                              👍 Helpful
                            </button>
                            <button
                              onClick={() => handleRating(msg.id, "not_helpful")}
                              className="flex-1 py-2.5 bg-red-600 text-white rounded-full text-xs font-bold"
                            >
                              👎 Not Helpful
                            </button>
                          </div>
                        </>
                      )}
                      {hasRatedThis && (
                        <p className="text-white/40 text-xs text-center">
                          ✓ Thank you for your feedback!
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-3xl text-sm ${
                      isMe
                        ? "bg-[#B8D4F0] text-[#003A69]"
                        : "bg-[#2A2A2A] text-white"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-4 border-t border-white/10 flex gap-3 items-center bg-background shrink-0">
            <button className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <Plus size={28} className="text-white" />
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type..."
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
