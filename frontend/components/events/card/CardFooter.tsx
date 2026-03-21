import { Heart, MessageCircle, Bookmark } from "lucide-react";
import EventTag from "@/components/ui/EventTag";
import { EventType } from "@/types/Event";

interface CardFooterProps {
  likes: number;
  liked: boolean;
  onLike: () => void;
  saved: boolean;
  onSave: () => void;
  type: EventType;
  comments: number;
  onComment: () => void;
}

export default function CardFooter({ likes, liked, onLike, saved, onSave, type, comments, onComment }: CardFooterProps) {
  return (
    <div className="flex items-center justify-between pt-1 border-t-2 border-white/10 mt-2">
      <div className="flex items-center gap-5 mt-3">
        <button onClick={onLike} className="flex items-center gap-1.5 transition-transform active:scale-90">
          <Heart size={22} className={liked ? "fill-green-light text-green-light" : "text-green-light"} />
          <span className="text-white font-bold">{likes}</span>
        </button>
        
        <button onClick={onComment} className="flex items-center gap-1.5 transition-transform active:scale-90">
          <MessageCircle size={22} className="fill-green-400 text-green-400" />
          <span className="text-white font-bold">{comments}</span>
        </button>

        <button onClick={onSave} className="flex items-center transition-transform active:scale-90">
          <Bookmark size={22} className={saved ? "fill-green-light text-green-light" : "text-green-light"} />
        </button>
      </div>
      
      <div className="mt-3">
        <EventTag type={type} />
      </div>
    </div>
  );
}