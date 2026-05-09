import { EventType } from "@/types/Event";

interface CardActionsProps {
  type: EventType;
  isMyPost?: boolean;
  onMessage?: () => void;
  isCompleted?: boolean;
  onComplete?: () => void;
  onVote?: (vote: boolean) => void;
  userVote?: boolean | null;
}

export default function CardActions({
  type,
  isMyPost,
  onMessage,
  isCompleted,
  onComplete,
  onVote,
  userVote,
}: CardActionsProps) {
  if (type === "Emergency") {
    if (isMyPost === undefined) return null;
    if (isMyPost) return null;
    return (
      <div className="flex flex-col gap-3 pb-3 max-w-100 mx-auto mt-4">
        <div className="flex items-center gap-3 w-full">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">
            Is this info correct?
          </span>
          <div className="h-px bg-white/10 flex-1" />
        </div>
        <div className="flex gap-3 w-full">
          {userVote === null || userVote === undefined ? (
            <>
              <button
                onClick={() => onVote?.(true)}
                className="flex-1 bg-green-light text-black rounded-full py-2 font transition-transform active:scale-95 cursor-pointer"
              >
                <span className="font-bold">Yes</span>, it is.
              </button>
              <button
                onClick={() => onVote?.(false)}
                className="flex-1 bg-red-emergency text-white rounded-full py-2 font transition-transform active:scale-95 cursor-pointer"
              >
                <span className="font-bold">No</span>, it isn't.
              </button>
            </>
          ) : userVote === true ? (
            <button
              onClick={() => onVote?.(true)}
              className="flex-1 bg-green-light text-black rounded-full py-2 font transition-transform active:scale-95 cursor-pointer"
            >
              ✓ <span className="font-bold">Yes</span>, it is.
            </button>
          ) : (
            <button
              onClick={() => onVote?.(false)}
              className="flex-1 bg-red-emergency text-white rounded-full py-2 font transition-transform active:scale-95 cursor-pointer"
            >
              ✓ <span className="font-bold">No</span>, it isn't.
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === "Skill" || type === "Lend") {
    if (!isMyPost) {
      return (
        <div className="mt-4 mb-4 w-40 h-8 lg:w-50 lg:h-9 mx-auto flex justify-center">
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
          <div>
            <span className="bg-green-light text-black px-3 py-1 rounded-full text-xs font-semibold w-fit mt-1">
              ✓ Completed
            </span>
          </div>
        ) : (
          <button
            onClick={onComplete}
            className="px-8 h-8 bg-green-light text-black rounded-[10px] font-bold transition-transform active:scale-95 cursor-pointer"
          >
            Mark as Completed
          </button>
        )}
      </div>
    );
  }

  return null;
}