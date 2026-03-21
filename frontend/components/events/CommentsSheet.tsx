"use client";

import { useEffect, useState, useRef } from "react";
import { X, Send } from "lucide-react";
import { useSignalR } from "@/context/SignalRContext";

interface Comment {
  id: number;
  text: string;
  createdByEmail: string;
  fullName: string | null;
  createdByUserId: number;
  createdAt: string;
  eventId: number;
}

interface CommentsSheetProps {
  eventId: number;
  onClose: () => void;
}

function getInitials(comment: Comment) {
  if (comment.fullName) {
    return comment.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }
  return comment.createdByEmail?.split("@")[0]?.slice(0, 2).toUpperCase() ?? "UP";
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommentsSheet({ eventId, onClose }: CommentsSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { connection } = useSignalR();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5248/api/event/${eventId}/comment`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setComments(data))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    if (!connection) return;

    const handleNewComment = (comment: Comment) => {
      if (comment.eventId === eventId) {
        setComments((prev) => [comment, ...prev]);
      }
    };

    const handleCommentDeleted = (data: { commentId: number }) => {
      setComments((prev) => prev.filter((c) => c.id !== data.commentId));
    };

    connection.on("NewComment", handleNewComment);
    connection.on("CommentDeleted", handleCommentDeleted);

    return () => {
      connection.off("NewComment", handleNewComment);
      connection.off("CommentDeleted", handleCommentDeleted);
    };
  }, [connection, eventId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5248/api/event/${eventId}/comment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    setText("");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl flex flex-col max-h-[75vh] animate-fade-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">Comments</h2>
          <button onClick={onClose}>
            <X size={22} className="text-white/50" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {loading && (
            <p className="text-white/30 text-sm text-center mt-4">Loading...</p>
          )}
          {!loading && comments.length === 0 && (
            <p className="text-white/30 text-sm text-center mt-4">
              No comments yet. Be the first!
            </p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-[#2e2e2e] border border-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-white/60">
                  {getInitials(comment)}
                </span>
              </div>
              {/* Content */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-semibold">
                    {comment.fullName ?? comment.createdByEmail?.split("@")[0]}
                  </span>
                  <span className="text-white/30 text-xs">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-white/80 text-sm mt-0.5">{comment.text}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-white/10 flex gap-3 items-center">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Write a comment..."
            className="flex-1 bg-[#2e2e2e] text-white text-sm px-4 py-3 rounded-2xl outline-none placeholder:text-white/30"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity"
          >
            <Send size={16} className="text-black" />
          </button>
        </div>
      </div>
    </>
  );
}