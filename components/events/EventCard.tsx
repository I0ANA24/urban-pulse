"use client";

import { useState } from "react";
import { Event, EventType } from "@/types/Event";
import CardHeader from "./card/CardHeader";
import CardMedia from "./card/CardMedia";
import CardContent from "./card/CardContent";
import CardActions from "./card/CardActions";
import CardFooter from "./card/CardFooter";

interface EventCardProps {
  event: Event;
  isMyPost?: boolean;
  onDelete?: (id: number) => void;
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
}: EventCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(32);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const typeMap: Record<number, EventType> = {
    0: "General",
    1: "Emergency",
    2: "Skill",
    3: "Lend",
  };
  const mappedType =
    typeof event.type === "number" ? typeMap[event.type] : event.type;

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
      <div className={`bg-secondary -mt-4 z-10 rounded-4xl ${event.imageUrl ? "rounded-t-4xl" : "rounded-t-none"} p-5`}>
        <CardContent
          description={event.description}
          isVerified={mappedType === "Emergency"}
        />

        <CardActions type={mappedType} />

        <CardFooter
          likes={likes}
          liked={liked}
          onLike={handleLike}
          saved={saved}
          onSave={() => setSaved(!saved)}
          type={mappedType}
        />
      </div>
    </div>
  );
}
