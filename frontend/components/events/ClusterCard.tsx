"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ThumbsUp, MessageCircle, BadgeCheck } from "lucide-react";
import { Cluster } from "@/types/Cluster";
import { EventType } from "@/types/Event";

interface ClusterCardProps {
  cluster: Cluster;
}

function getInitials(name?: string | null) {
  if (!name) return "UP";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year}  ${hours}:${minutes}`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").slice(0, 120);
}

export default function ClusterCard({ cluster }: ClusterCardProps) {
  const router = useRouter();
  const latest = cluster.latestEvent;

  const typeMap: Record<number, EventType> = {
    0: "General", 1: "Emergency", 2: "Skill", 3: "Lend", 4: "LostPet", 5: "FoundPet",
  };
  const mappedType = latest
    ? (typeof latest.type === "number" ? typeMap[latest.type] : (latest.type as EventType))
    : "Emergency";

  const name = latest?.createdByFullName ?? latest?.createdByEmail?.split("@")[0] ?? "Unknown";
  const initials = getInitials(name);

  return (
    <div
      onClick={() => router.push(`/cluster/${cluster.id}`)}
      className="w-full bg-secondary rounded-2xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-secondary/80 transition-colors active:scale-[0.99]"
    >
      {/* Cluster header */}
      <div className="flex flex-col items-center gap-0.5 pb-3 border-b border-white/10">
        <h2 className="text-white font-bold text-2xl font-montagu tracking-tight">
          {cluster.subType}
        </h2>
        {cluster.neighborhood && (
          <span className="text-white/60 text-xs font-medium">{cluster.neighborhood}</span>
        )}
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-white/40 text-sm">+{cluster.eventCount} reports</span>
          {cluster.confidenceScore != null && cluster.confidenceScore > 0 && (
            <span className="text-white/40 text-xs">· {Math.round(cluster.confidenceScore)}% confidence</span>
          )}
        </div>
      </div>

      {latest && (
        <>
          {/* Post author row */}
          <div className="flex items-center gap-3">
            {latest.createdByAvatarUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <Image
                  src={latest.createdByAvatarUrl}
                  alt={name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-sm">{name}</span>
                {latest.isVerifiedUser && (
                  <BadgeCheck size={15} className="text-blue fill-blue" />
                )}
              </div>
              <span className="text-white/40 text-xs">{formatDate(latest.createdAt)}</span>
            </div>
          </div>

          {/* Post image */}
          {latest.imageUrl && (
            <div className="w-full h-52 rounded-xl overflow-hidden">
              <Image
                src={latest.imageUrl}
                alt="cluster post"
                width={600}
                height={208}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Post description */}
          <p className="text-white text-sm leading-relaxed line-clamp-3">
            {stripHtml(latest.description)}
          </p>

          {/* Verified info badge */}
          <div className="inline-flex">
            <span className="bg-green-light text-black text-xs font-bold px-3 py-1 rounded-full">
              Verified info
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mt-1" />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <ThumbsUp size={20} className="text-green-light" />
                <span className="text-white font-bold">{latest.yesCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle size={20} className="fill-green-light text-green-light" />
                <span className="text-white font-bold">—</span>
              </div>
            </div>
            <div
              className="px-4 py-2 rounded-[10px] text-[10px] font-bold uppercase text-white"
              style={{ backgroundColor: "#A53A3A" }}
            >
              {cluster.subType}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
