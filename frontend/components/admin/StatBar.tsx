interface StatBarProps {
  label: string;
  value: string;
  color: string;
  progress: number; // 0-100
}

export default function StatBar({ label, value, color, progress }: StatBarProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-white/50 text-xs font-montagu text-center leading-tight max-w-min">
        {label}
      </span>
      <span className="text-white font-montagu text-2xl">{value}</span>
      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}