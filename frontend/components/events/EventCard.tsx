"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Event, EventType } from "@/types/Event";
import CardHeader from "./card/CardHeader";
import CardMedia from "./card/CardMedia";
import CardContent from "./card/CardContent";
import CardActions from "./card/CardActions";
import CardFooter from "./card/CardFooter";
import CommentsSheet from "@/components/events/CommentsSheet";
import { useSignalR } from "@/context/SignalRContext";
import { useUser } from "@/context/UserContext";

const API = "http://localhost:5248";

interface EventCardProps {
  event: Event;
  isMyPost?: boolean;
  onDelete?: (id: number) => void;
  flagCount?: number;
  onViewInsights?: (eventId: number) => void;
  isAdminView?: boolean;
}

function getInitials(name: string) {
  return name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "UP";
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} \u00A0 ${hours}:${minutes}`;
}

export default function EventCard({ event, isMyPost, onDelete, flagCount, onViewInsights, isAdminView }: EventCardProps) {
  const router = useRouter();
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(event.isCompleted ?? false);
  const { connection } = useSignalR();

  useEffect(() => {
    if (user) setCurrentUserId(user.id);
  }, [user]);

  useEffect(() => {
    if (event.id === -1) return;
    const token = localStorage.getItem("token");

    fetch(`${API}/api/event/${event.id}/like`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setLikes(d.count); setLiked(d.liked); });

    fetch(`${API}/api/event/${event.id}/comment`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setCommentCount(d.length));

    fetch(`${API}/api/event/${event.id}/save`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setSaved(d.saved));
  }, [event.id]);

  useEffect(() => {
    if (!connection) return;
    const handleLikeUpdated = (d: { eventId: number; count: number }) => { if (d.eventId === event.id) setLikes(d.count); };
    const handleNewComment = (d: { eventId: number }) => { if (d.eventId === event.id) setCommentCount((p) => p + 1); };
    const handleCommentDeleted = (d: { eventId: number }) => { if (d.eventId === event.id) setCommentCount((p) => p - 1); };
    connection.on("LikeUpdated", handleLikeUpdated);
    connection.on("NewComment", handleNewComment);
    connection.on("CommentDeleted", handleCommentDeleted);
    return () => {
      connection.off("LikeUpdated", handleLikeUpdated);
      connection.off("NewComment", handleNewComment);
      connection.off("CommentDeleted", handleCommentDeleted);
    };
  }, [connection, event.id]);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/event/${event.id}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    setLikes(d.count); setLiked(d.liked);
  };

  const handleSave = async () => {
    setSaved((p) => !p);
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/event/${event.id}/save`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    setSaved(d.saved);
  };

  const handleMessage = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/chat/conversations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: event.createdByUserId, eventId: event.id }),
    });
    const d = await res.json();
    router.push(`/chat-conversation/${d.conversationId}`);
  };

  const handleComplete = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/event/${event.id}/complete`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
    setIsCompleted(true);
  };

  const typeMap: Record<number, EventType> = { 0: "General", 1: "Emergency", 2: "Skill", 3: "Lend" };
  const mappedType = typeof event.type === "number" ? typeMap[event.type] : (event.type as EventType);
  const isOwner = isMyPost || currentUserId === event.createdByUserId;
  const displayName = event.createdByFullName ?? event.createdByEmail?.split("@")[0] ?? "Unknown";

  return (
    <div className="w-full relative mb-4">
      <CardHeader
        initials={getInitials(displayName)}
        name={displayName}
        date={formatDate(event.createdAt)}
        avatarUrl={event.createdByAvatarUrl}
        isVerifiedUser={event.isVerifiedUser ?? false}
        isMyPost={isMyPost}
        onDelete={() => onDelete && onDelete(event.id)}
        imageUrl={event.imageUrl}
        eventId={event.id}
        userId={event.createdByUserId}
      />
      <CardMedia imageUrl={event.imageUrl} />
      <div className={`bg-secondary -mt-4 z-10 rounded-4xl ${event.imageUrl ? "rounded-t-4xl" : "rounded-t-none"} p-5 lg:px-10`}>
        <CardContent description={event.description} isVerified={mappedType === "Emergency"} />
        <CardActions type={mappedType} isMyPost={isOwner} onMessage={handleMessage} isCompleted={isCompleted} onComplete={handleComplete} />
        <CardFooter
          likes={likes} liked={liked} onLike={handleLike}
          saved={saved} onSave={handleSave}
          type={mappedType} comments={commentCount} onComment={() => setShowComments(true)}
          flagCount={flagCount}
          onViewInsights={onViewInsights ? () => onViewInsights(event.id) : undefined}
          isMyPost={isOwner}
          isAdminView={isAdminView}
        />
      </div>
      {showComments && typeof window !== "undefined" && createPortal(
        <CommentsSheet eventId={event.id} onClose={() => setShowComments(false)} />,
        document.body,
      )}
    </div>
  );
}