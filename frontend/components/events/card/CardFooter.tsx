import { Heart, MessageCircle, Bookmark, Flag, ThumbsUp } from "lucide-react";
import EventTag from "@/components/ui/EventTag";
import { EventType } from "@/types/Event";
import { DEFAULT_INCIDENT_TYPES } from "@/lib/constants";

interface CardFooterProps {
  likes: number;
  liked: boolean;
  onLike: () => void;
  saved: boolean;
  onSave: () => void;
  type: EventType;
  tags?: string[];
  comments: number;
  onComment: () => void;
  flagCount?: number;
  onViewInsights?: () => void;
  isMyPost?: boolean;
  isAdminView?: boolean;
}

export default function CardFooter({
  likes,
  liked,
  onLike,
  saved,
  onSave,
  type,
  tags,
  comments,
  onComment,
  flagCount,
  onViewInsights,
  isAdminView,
}: CardFooterProps) {
  const isAdmin = isAdminView === true;

  const incidentMatch = Array.isArray(tags) && tags.length > 0
    ? DEFAULT_INCIDENT_TYPES.find((it) =>
        tags.some((t) => t.toUpperCase() === it.key || t.toUpperCase() === it.label.toUpperCase())
      )
    : null;

  const typeTag = incidentMatch ? (
    <span className="block w-fit min-w-22 lg:min-w-28 px-2 text-center py-2 rounded-[10px] text-[10px] lg:text-[12px] font-bold uppercase bg-red-emergency text-white">
      {incidentMatch.icon} {incidentMatch.label}
    </span>
  ) : (
    <EventTag type={type} />
  );

  if (isAdmin) {
    return (
      <div className="flex items-center justify-between pt-1 border-t-2 border-white/10 mt-2">
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={onViewInsights}
            className="h-10 w-30 rounded-[20] bg-blue text-[#04007D] text-sm font-bold transition-transform active:scale-95 cursor-pointer hover:bg-blue/95 duration-200"
          >
            View insights
          </button>

          <div className="flex items-center gap-1.5">
            <Flag size={20} className="text-red-emergency fill-red-emergency" />
            <span className="text-white font-bold text-sm">{flagCount}</span>
          </div>
        </div>

        <div className="mt-3">
          {typeTag}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between pt-1 border-t-2 border-white/10 mt-2">
      <div className="flex items-center gap-5 mt-3">
        <button
          onClick={onLike}
          className="flex items-center gap-1.5 transition-transform active:scale-90 cursor-pointer"
        >
          <ThumbsUp
            size={22}
            className={`lg:size-7 ${liked ? "fill-green-light text-green-light" : "text-green-light"}`}
          />
          <span className="text-white font-bold lg:text-lg">{likes}</span>
        </button>

        <button
          onClick={onComment}
          className="flex items-center gap-1.5 transition-transform active:scale-90 cursor-pointer"
        >
          <MessageCircle
            size={22}
            className="lg:size-7 fill-green-light text-green-light"
          />
          <span className="text-white font-bold lg:text-lg">{comments}</span>
        </button>

        <button
          onClick={onSave}
          className="flex items-center transition-transform active:scale-90 cursor-pointer"
        >
          <Bookmark
            size={22}
            className={`lg:size-7 ${saved ? "fill-green-light text-green-light" : "text-green-light"}
  `}
          />
        </button>
      </div>

      <div className="mt-3">
        {typeTag}
      </div>
    </div>
  );
}
