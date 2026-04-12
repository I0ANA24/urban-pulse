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
      className={`block w-fit min-w-22 lg:min-w-28 px-2 text-center py-2 rounded-[10px] text-[10px] lg:text-[12px] font-bold uppercase ${className}`}
      style={{
        backgroundColor: style.bgColor,
        color: style.textColor,
      }}
    >
      {style.title}
    </span>
  );
}