"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { Plus, MoreVertical, BadgeCheck, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
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
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { connection } = useSignalR();

  useEffect(() => {
    const loadConversationData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [profileRes, conversationsRes, messagesRes] = await Promise.all([
          fetch("http://localhost:5248/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5248/api/chat/conversations", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5248/api/chat/conversations/${id}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCurrentUserId(profileData.id ?? null);
        }

        if (conversationsRes.ok) {
          const conversationsData = await conversationsRes.json();
          const conv = Array.isArray(conversationsData)
            ? conversationsData.find((c: any) => c.id === Number(id))
            : null;

          if (conv) {
            setOtherUserId(conv.otherUserId);
            setOtherUserName(conv.otherUserFullName ?? conv.otherUserEmail?.split("@")[0]);

            try {
              const otherProfileRes = await fetch(`http://localhost:5248/api/user/${conv.otherUserId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (otherProfileRes.ok) {
                const profile = await otherProfileRes.json();
                setOtherUserAvatar(profile.avatarUrl ?? null);
                setIsVerified(profile.isVerified ?? false);
              }
            } catch (error) {
              console.error("Failed to load other user profile:", error);
            }
          }
        }

        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(Array.isArray(messagesData) ? messagesData : []);
        }
      } catch (error) {
        console.error("Failed to load chat conversation page:", error);
      }
    };

    loadConversationData();
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
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5248/api/chat/conversations/${id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSendInfo = async () => {
    setShowPlusMenu(false);
    try {
      const token = localStorage.getItem("token");
      const profileRes = await fetch("http://localhost:5248/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!profileRes.ok) return;
      const profile = await profileRes.json();

      const payload = JSON.stringify({
        name: profile.fullName ?? profile.email?.split("@")[0] ?? "-",
        phone: profile.phoneNumber ?? "-",
        address: profile.address ?? "-",
      });

      const sendRes = await fetch(`http://localhost:5248/api/chat/conversations/${id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: `__INFO_CARD__${payload}` }),
      });
      if (!sendRes.ok) return;
    } catch (error) {
      console.error("Failed to send personal info card:", error);
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

              if (msg.text?.startsWith("__INFO_CARD__")) {
                const info = JSON.parse(msg.text.replace("__INFO_CARD__", ""));
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className="w-60 bg-secondary border-4 border-blue rounded-2xl px-5 py-4 flex flex-col gap-3">
                      <p className="text-white font-bold text-base text-center">{info.name}</p>
                      <div className="w-full h-px bg-white/20" />
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p>
                            <span className="font-bold text-white">Phone: </span>
                            <span className="text-yellow-primary">{info.phone}</span>
                          </p>
                          <button
                            onClick={() => navigator.clipboard.writeText(info.phone)}
                            className="shrink-0 text-white/40 hover:text-white transition-colors cursor-pointer"
                            title="Copy phone"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <p>
                            <span className="font-bold text-white">Address: </span>
                            <span className="text-yellow-primary">{info.address}</span>
                          </p>
                          <button
                            onClick={() => navigator.clipboard.writeText(info.address)}
                            className="shrink-0 text-white/40 hover:text-white transition-colors cursor-pointer mt-0.5"
                            title="Copy address"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (msg.messageType === "rating_check") return null;

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-3xl text-sm ${isMe ? "bg-[#B8D4F0] text-[#003A69]" : "bg-[#2A2A2A] text-white"}`}>
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Plus menu portal */}
          {showPlusMenu && createPortal(
            <>
              <div className="fixed inset-0 z-50" onClick={() => setShowPlusMenu(false)} />
              <div
                className="fixed z-50 bg-secondary border border-white/40 p-2 rounded-2xl overflow-hidden w-52 shadow-xl"
                style={{ top: menuPos.top, left: menuPos.left, transform: "translateY(calc(-100% - 8px))" }}
              >
                {otherUserId !== currentUserId && (
                  <>
                    <button
                      onClick={() => {
                        setShowPlusMenu(false);
                        if (otherUserId) router.push(`/rate?userId=${otherUserId}`);
                      }}
                      className="w-full flex items-center gap-0 px-4 py-3 hover:bg-green-light hover:text-black text-white text-base rounded-2xl cursor-pointer"
                    >
                      <ThumbsUp size={14} strokeWidth={2.5} />
                      <ThumbsDown size={14} strokeWidth={2.5} />
                      <p className="pl-4">Rate</p>
                    </button>
                    <div className="w-[95%] h-px bg-white/20 mx-auto my-2" />
                  </>
                )}
                <button onClick={handleSendInfo} className="group w-full flex items-center gap-3 px-4 py-3 text-white text-base hover:bg-green-light hover:text-black transition-colors rounded-2xl cursor-pointer">
                  <svg width="22" height="19" viewBox="0 0 37 32" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="filter-[brightness(0)_invert(1)] group-hover:filter-[brightness(0)]">
                    <rect width="37" height="31.7346" fill="url(#sendinfo-pattern)"/>
                    <defs>
                      <pattern id="sendinfo-pattern" patternContentUnits="objectBoundingBox" width="1" height="1">
                        <use xlinkHref="#sendinfo-img" transform="matrix(0.00952991 0 0 0.0111111 0.0711541 0)"/>
                      </pattern>
                      <image id="sendinfo-img" width="90" height="90" preserveAspectRatio="none" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAADsklEQVR4nO2cP08UQRjGzyBisEKo0MREbSxMjI0SE7XQwsSP4DcQtBMbnHnRQNBEQkJDZbRRiYnGwga1VIwFWFDYmhCNkJt3D9AQ/zxm9yD4746d5W5ndvf9JW9ojn1mfjvMLTO7WyoJgiAIgiAIgiBkFUDtRFlfhqE3YL0MJiQqQz/A+gOMvo+Aelz3yyuwqPaC6V1iufWkGxp03T9/RnIzJPPvpS+Wik40XTRVMoUj+ytY7S8Vmeqc3GTRHI3qp6UiA6aldEQTEKjzpaKSmmTOaullGD2NgC4BY20imlORPhteoYloTkl2kpHtvuGUwdJ9IppTKEOvRTSnUksimtMpEc0iGnkqEc0iGnkqEc1FEW30MwSDF8JlUXy8tSuqsjoJ1i9dy8mL6AABnauZA2yDoXuuBWVbtKFvqNCJTbOgtqMyeAis77oWlU3RTLetc41+6FpWtkSHG7Dl6/vsc68fgNE/XQvLjmjWs9aha4BpxrWwLIm+Yx26Bgw9cC0sS6JHrEPXAOtR18IyJJpubkH0iGthGRKtHyUWbSyuPAytwtAVLKjupHn/5C+obrDuj47tvWijF4GJVutcTLTC6M8WJ7TfunNx2xLK9l80zYW3lSW6Fc3QXOycBo7k/49s/0WPJ+6goXERHb+mEneQacqPqYOu+i/a6O9gdSZB7tnq78b+y1mN5tLCfhmuyw6GOuNnqt1Wkj0sN6Kr1WuR2etaVHZFG/0JFdW1aV5FdUWf9UBWNkVHpZ9jXrXXzJpX7WB64VpSDkQTYNTpmlllOuVakIjmbJV70YE6XjMroGPJT2DR1zr+kKGnw03Y+hu0ejrZ8Yu+1lEVHG5JPQ6vjzfNC4Y6o8/abmMV+l/wdcFGHbXONeooWD+JLbywog29b8QjyAioJzqW06nD17UOQ2/Bwx2N6+hwR/WYdTOLttahK+GtAo3q7DpgdTDVZx63WKUURI9ah8QERo+5FuiPaKOOWIfEBOXBw64F+iNaCiKaRTTyViKaRTTyVCKaRTTyVCKaRTTyVCKaRTTyVCKa/RWdZGlyBawHoieroHZEP5mugfUX1wLSabOupPGCwZVaO90Id0v8lN3YNid61U/4Pje7szlQ93islQdim93m2PcZboRgrC16xVjskPq7K6julHggt2ltngmnHmvRG681jikbky31T9xki3uxTWvzDBZv7Ekk+a+R3RfOP/W+IGMdiz2Q27g2L8HoV9GtxklHsiAIgiAIgiAIgiAIgiAIQqkw/ALko1jNDoh+KQAAAABJRU5ErkJggg=="/>
                    </defs>
                  </svg>
                  Send info
                </button>
              </div>
            </>,
            document.body
          )}

          {/* Input */}
          <div className="px-4 py-4 border-t border-white/10 flex gap-3 items-center bg-background shrink-0">
            <button
              ref={plusButtonRef}
              onClick={() => {
                if (!plusButtonRef.current) return;
                const rect = plusButtonRef.current.getBoundingClientRect();
                setMenuPos({ top: rect.top, left: rect.left });
                setShowPlusMenu((v) => !v);
              }}
              className="w-12 h-12 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Plus size={34} className="text-white" />
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