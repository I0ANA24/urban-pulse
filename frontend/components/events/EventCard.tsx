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

interface EventCardProps {
  event: Event;
  isMyPost?: boolean;
  onDelete?: (id: number) => void;
  /** Admin: număr de flag-uri (activează modul admin pe footer) */
  flagCount?: number;
  /** Admin: callback la click pe "View insights" */
  onViewInsights?: (eventId: number) => void;
}

function getInitials(email: string) {
  return email?.split("@")[0]?.slice(0, 2).toUpperCase() ?? "UP";
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

export default function EventCard({
  event,
  isMyPost,
  onDelete,
  flagCount,
  onViewInsights,
}: EventCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(event.isCompleted ?? false);
  const { connection } = useSignalR();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5248/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.id));
  }, []);

  useEffect(() => {
    if (event.id === -1) return;
    const token = localStorage.getItem("token");

    fetch(`http://localhost:5248/api/event/${event.id}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setLikes(data.count);
        setLiked(data.liked);
      });

    fetch(`http://localhost:5248/api/event/${event.id}/comment`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCommentCount(data.length));
  }, [event.id]);

  useEffect(() => {
    if (!connection) return;

    const handleLikeUpdated = (data: { eventId: number; count: number }) => {
      if (data.eventId === event.id) {
        setLikes(data.count);
      }
    };

    const handleNewComment = (data: { eventId: number }) => {
      if (data.eventId === event.id) {
        setCommentCount((prev) => prev + 1);
      }
    };

    const handleCommentDeleted = (data: { eventId: number }) => {
      if (data.eventId === event.id) {
        setCommentCount((prev) => prev - 1);
      }
    };

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
    const res = await fetch(
      `http://localhost:5248/api/event/${event.id}/like`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    setLikes(data.count);
    setLiked(data.liked);
  };

  const handleMessage = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5248/api/chat/conversations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        otherUserId: event.createdByUserId,
        eventId: event.id,
      }),
    });
    const data = await res.json();
    router.push(`/chat-conversation/${data.conversationId}`);
  };

  const handleComplete = async () => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5248/api/event/${event.id}/complete`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setIsCompleted(true);
  };

  const typeMap: Record<number, EventType> = {
    0: "General",
    1: "Emergency",
    2: "Skill",
    3: "Lend",
  };
  const mappedType =
    typeof event.type === "number"
      ? typeMap[event.type]
      : (event.type as EventType);

  const isOwner = isMyPost || currentUserId === event.createdByUserId;

  return (
    <div className="w-full relative mb-4">
      <CardHeader
        initials={getInitials(event.createdByEmail)}
        name={event.createdByEmail?.split("@")[0] ?? "Unknown"}
        date={formatDate(event.createdAt)}
        isVerifiedUser={true}
        isMyPost={isMyPost}
        onDelete={() => onDelete && onDelete(event.id)}
        imageUrl={event.imageUrl}
      />
      <CardMedia imageUrl={event.imageUrl} />
      <div
        className={`bg-secondary -mt-4 z-10 rounded-4xl ${event.imageUrl ? "rounded-t-4xl" : "rounded-t-none"} p-5`}
      >
        <CardContent
          description={event.description}
          isVerified={mappedType === "Emergency"}
        />

        <CardActions
          type={mappedType}
          isMyPost={isOwner}
          onMessage={handleMessage}
          isCompleted={isCompleted}
          onComplete={handleComplete}
        />

        <CardFooter
          likes={likes}
          liked={liked}
          onLike={handleLike}
          saved={saved}
          onSave={() => setSaved(!saved)}
          type={mappedType}
          comments={commentCount}
          onComment={() => setShowComments(true)}
          flagCount={flagCount}
          onViewInsights={
            onViewInsights ? () => onViewInsights(event.id) : undefined
          }
          isMyPost={isOwner}
        />
      </div>

      {showComments &&
        typeof window !== "undefined" &&
        createPortal(
          <CommentsSheet
            eventId={event.id}
            onClose={() => setShowComments(false)}
          />,
          document.body,
        )}
    </div>
  );
}
