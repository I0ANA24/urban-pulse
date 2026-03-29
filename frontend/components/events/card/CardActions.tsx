import { EventType } from "@/types/Event";

interface CardActionsProps {
  type: EventType;
  isMyPost?: boolean;
  onMessage?: () => void;
  isCompleted?: boolean;
  onComplete?: () => void;
}

export default function CardActions({ type, isMyPost, onMessage, isCompleted, onComplete }: CardActionsProps) {
  if (type === "Emergency") {
    return (
      <div className="flex flex-col gap-3 pb-3 mt-1">
        <div className="flex items-center gap-3 w-full">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">
            Is this info correct?
          </span>
          <div className="h-px bg-white/10 flex-1" />
        </div>
        <div className="flex gap-3 w-full">
          <button className="flex-1 bg-green-light text-black rounded-full py-1 font transition-transform active:scale-95 cursor-pointer">
            <span className="font-bold">Yes</span>, it is.
          </button>
          <button className="flex-1 bg-red-emergency text-white rounded-full py-1 font transition-transform active:scale-95 cursor-pointer">
            <span className="font-bold">No</span>, it isn't.
          </button>
        </div>
      </div>
    );
  }

  if (type === "Skill" || type === "Lend") {
    if (!isMyPost) {
      return (
        <div className="mt-4 mb-4 w-50 h-8 mx-auto flex justify-center">
          <button
            onClick={onMessage}
            className="w-full h-full bg-blue text-[#003A69] rounded-[10px] font-bold transition-transform active:scale-95 cursor-pointer"
          >
            Message
          </button>
        </div>
      );
    }

    return (
      <div className="mt-4 mb-4 mx-auto flex justify-center w-full">
        {isCompleted ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-400/10 border border-green-400/30 rounded-full">
            <span className="text-green-400 text-xs font-bold">✓ Completed</span>
          </div>
        ) : (
          <button
            onClick={onComplete}
            className="w-full h-8 bg-green-light text-black rounded-[10px] font-bold transition-transform active:scale-95 cursor-pointer"
          >
            Mark as Completed
          </button>
        )}
      </div>
    );
  }

  return null;
}