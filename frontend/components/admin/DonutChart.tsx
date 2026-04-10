"use client";

interface DonutSegment {
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerText: string;
  centerSubtext?: string;
  size?: number;
  strokeWidth?: number;
}

export default function DonutChart({
  segments,
  centerText,
  centerSubtext,
  size = 220,
  strokeWidth = 32,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let cumulativeOffset = 0;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {total === 0 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth={strokeWidth}
          />
        ) : (
          segments.map((segment, i) => {
            if (segment.value === 0) return null;
            const segmentLength = (segment.value / total) * circumference;
            const gap = 4;
            const dashArray = `${segmentLength - gap} ${circumference - segmentLength + gap}`;
            const offset = -cumulativeOffset;
            cumulativeOffset += segmentLength;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            );
          })
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-bold text-2xl font-montagu">{centerText}</span>
        {centerSubtext && (
          <span className="text-white/60 text-sm">{centerSubtext}</span>
        )}
      </div>
    </div>
  );
}