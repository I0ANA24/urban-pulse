import { EventType } from "@/types/Event";

interface CardActionsProps {
  type: EventType;
}

export default function CardActions({ type }: CardActionsProps) {
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
    return (
      <div className="mt-4 mb-4 w-50 h-8 mx-auto flex justify-center">
        <button className="w-full h-full bg-[#BEDCF5] text-[#003A69] rounded-[10px] font-bold transition-transform active:scale-95 cursor-pointer">
          Message
        </button>
      </div>
    );
  }

  return null;
}