import { EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";

interface EventTagProps {
  type: EventType;
  className?: string;
}

export default function EventTag({ type, className = "" }: EventTagProps) {
  const style = EVENT_TAG_STYLES[type];

  if (!style) return null; 

  return (
    <span
      className={`px-3 py-1 rounded-[10px] text-[10px] font-bold uppercase tracking-wide w-fit ${className}`}
      style={{
        backgroundColor: style.bgColor,
        color: style.textColor,
      }}
    >
      {style.title}
    </span>
  );
}