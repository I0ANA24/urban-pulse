import { useRef, useState } from "react";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import { EventType } from "@/types/Event";

interface EventFiltersProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export default function EventFilters({ activeFilter, setActiveFilter }: EventFiltersProps) {
  const [scrolledRight, setScrolledRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="relative w-full overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory"
          onScroll={(e) => {
            const el = e.currentTarget;
            setScrolledRight(el.scrollLeft > 50);
          }}
          style={{ scrollbarWidth: "none" }}
        >
          {(Object.keys(EVENT_TAG_STYLES) as EventType[]).map((typeKey) => {
            const filter = EVENT_TAG_STYLES[typeKey];
            return (
              <button
                key={filter.title}
                onClick={() =>
                  setActiveFilter(activeFilter === filter.title ? "ALL" : filter.title)
                }
                className={`shrink-0 w-25 h-11 rounded-[10px] text-xs font-bold snap-start transition-opacity ${
                  activeFilter === "ALL" || activeFilter === filter.title
                    ? "opacity-100"
                    : "opacity-40"
                }`}
                style={{
                  backgroundColor: filter.bgColor,
                  color: filter.textColor,
                }}
              >
                {filter.title}
              </button>
            );
          })}
        </div>
        {/* right fade */}
        <div className="absolute -right-10 top-0 bottom-0 w-16 bg-linear-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* dots */}
      <div className="flex justify-center gap-1.5 -mt-2">
        <div className={`h-1.5 rounded-full transition-all ${!scrolledRight ? "w-1.5 bg-white/60" : "w-1.5 bg-white/20"}`} />
        <div className={`h-1.5 rounded-full transition-all ${scrolledRight ? "w-1.5 bg-white/60" : "w-1.5 bg-white/20"}`} />
      </div>
    </>
  );
}