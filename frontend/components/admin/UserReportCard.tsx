"use client";

import Image from "next/image";

interface UserReportCardProps {
  reporterName: string;
  reporterAvatar: string;
  date: string;
  time: string;
  title: string;
  description: string;
}

export default function UserReportCard({
  reporterName,
  reporterAvatar,
  date,
  time,
  title,
  description,
}: UserReportCardProps) {
  return (
    <div className="bg-secondary rounded-[20] p-4 flex flex-col gap-3">
      {/* Reporter info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white overflow-hidden shrink-0">
          <Image
            src={reporterAvatar}
            alt={reporterName}
            width={35}
            height={35}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col flex-1">
          <span className="text-white font-bold text-base">
            {reporterName}
          </span>
          <span className="text-white/40 text-xs">
            {date} · {time}
          </span>
        </div>
      </div>

      <div className="h-px bg-white/40 mb-2" />

      {/* Title */}
      <div className="bg-red-emergency/50 rounded-[10] px-4 py-2.5">
        <span className="text-white">{title}</span>
      </div>

      {/* Description */}
      <div className="bg-third rounded-[20] p-4">
        <p className="text-white">
          {description}
        </p>
      </div>
    </div>
  );
}