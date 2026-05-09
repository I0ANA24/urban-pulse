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
  const [yesCount, setYesCount] = useState(event.yesCount ?? 0);
  const [noCount, setNoCount] = useState(event.noCount ?? 0);
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(event.isCompleted ?? false);
  const { connection } = useSignalR();

  const typeMap: Record<number, EventType> = {
    0: "General", 1: "Emergency", 2: "Skill", 3: "Lend", 4: "LostPet", 5: "FoundPet"
  };
  const mappedType = typeof event.type === "number" ? typeMap[event.type] : (event.type as EventType);
  const isOwner = isMyPost || (currentUserId !== null && currentUserId === event.createdByUserId);
  const displayName = event.createdByFullName ?? event.createdByEmail?.split("@")[0] ?? "Unknown";

  useEffect(() => {
    if (user) setCurrentUserId(user.id);
  }, [user]);

  useEffect(() => {
    if (event.id === -1) return;
    const loadCardState = async () => {
      try {
        const token = localStorage.getItem("token");
        const [likeRes, commentRes, saveRes] = await Promise.all([
          fetch(`${API}/api/event/${event.id}/like`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/event/${event.id}/comment`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/event/${event.id}/save`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (likeRes.ok) {
          const likeData = await likeRes.json();
          setLikes(Number(likeData.count ?? 0));
          setLiked(Boolean(likeData.liked));
        }

        if (commentRes.ok) {
          const commentData = await commentRes.json();
          setCommentCount(Array.isArray(commentData) ? commentData.length : 0);
        }

        if (saveRes.ok) {
          const saveData = await saveRes.json();
          setSaved(Boolean(saveData.saved));
        }

        if (mappedType === "Emergency") {
          const verifyRes = await fetch(`${API}/api/event/${event.id}/verify`, { headers: { Authorization: `Bearer ${token}` } });
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            setYesCount(Number(verifyData.yesCount ?? 0));
            setNoCount(Number(verifyData.noCount ?? 0));
            setUserVote(verifyData.userVote ?? null);
          }
        }
      } catch (error) {
        console.error("Failed to load event card state:", error);
      }
    };

    loadCardState();
  }, [event.id, mappedType]);

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
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/event/${event.id}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const d = await res.json();
      setLikes(Number(d.count ?? 0));
      setLiked(Boolean(d.liked));
    } catch (error) {
      console.error("Failed to like event:", error);
    }
  };

  const handleSave = async () => {
    setSaved((p) => !p);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/event/${event.id}/save`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        setSaved((p) => !p);
        return;
      }
      const d = await res.json();
      setSaved(Boolean(d.saved));
    } catch (error) {
      console.error("Failed to save event:", error);
      setSaved((p) => !p);
    }
  };

  const handleMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/chat/conversations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: event.createdByUserId, eventId: event.id }),
      });
      if (!res.ok) return;
      const d = await res.json();
      if (!d?.conversationId) return;
      router.push(`/chat-conversation/${d.conversationId}`);
    } catch (error) {
      console.error("Failed to create conversation from event:", error);
    }
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/event/${event.id}/complete`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      setIsCompleted(true);
    } catch (error) {
      console.error("Failed to complete event:", error);
    }
  };

  const handleVote = async (vote: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/event/${event.id}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });
      if (!res.ok) return;
      const d = await res.json();
      setYesCount(Number(d.yesCount ?? 0));
      setNoCount(Number(d.noCount ?? 0));
      setUserVote(d.userVote ?? null);
    } catch (error) {
      console.error("Failed to verify event:", error);
    }
  };

  return (
    <div id={`event-${event.id}`} className="w-full relative mb-4">
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
        <CardContent
          description={event.description}
          isVerified={mappedType === "Emergency"}
          yesCount={yesCount}
        />
        <CardActions
          type={mappedType}
          isMyPost={isOwner}
          onMessage={handleMessage}
          isCompleted={isCompleted}
          onComplete={handleComplete}
          onVote={handleVote}
          userVote={userVote}
        />
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