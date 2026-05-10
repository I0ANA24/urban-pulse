"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GoBackButton from "@/components/ui/GoBackButton";
import { HiUsers } from "react-icons/hi";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";
import { API_BASE_URL as API } from "@/lib/api";

interface DuplicateSuspect {
  id: number;
  user1Id: number;
  user1Name: string;
  user1AvatarUrl: string | null;
  user1IsVerified: boolean;
  user1TrustScore: number;
  user2Id: number;
  user2Name: string;
  user2AvatarUrl: string | null;
  user2IsVerified: boolean;
  user2TrustScore: number;
  confidence: string;
  reasons: string[];
  detectedAt: string;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function confidenceColor(confidence: string) {
  if (confidence === "Critical") return "text-red-emergency";
  if (confidence === "High") return "text-yellow-primary";
  return "text-blue-400";
}

export default function MergeDuplicatesPage() {
  const router = useRouter();
  const [duplicates, setDuplicates] = useState<DuplicateSuspect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/admin/duplicates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setDuplicates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleReview = (suspect: DuplicateSuspect) => {
    router.push(`/admin/tasks/merge-duplicates/users/${suspect.id}`);
  };

  return (
    <ThreeColumnLayoutAdmin>
    <div className="w-full flex flex-col gap-4 animate-fade-up pb-20">
      {/* Mobile Header */}
      <div className="flex items-center relative mb-4 lg:hidden">
        <GoBackButton />
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <h1 className="text-white font-bold text-xl">Merge duplicates</h1>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-primary" />
        </div>
      </div>
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-white/60" />
        <h1 className="text-white font-bold text-xl">Merge duplicates</h1>
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-primary" />
        <div className="flex-1 h-px bg-white/60" />
      </div>

      {loading && (
      <div className="flex flex-col gap-5 mt-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-secondary border border-yellow-primary/20 rounded-[20] p-5 flex flex-col gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-full bg-white/10" />
              <div className="h-5 w-32 bg-white/10 rounded-lg" />
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-full bg-white/10" />
              <div className="h-5 w-32 bg-white/10 rounded-lg" />
            </div>
            <div className="h-4 w-24 bg-white/10 rounded-lg" />
            <div className="h-8 w-36 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
    )}

      {!loading && duplicates.length === 0 && (
        <p className="text-white/40 text-center mt-10">
          No duplicate users found.
        </p>
      )}

      {/* Duplicate cards */}
      <div className="flex flex-col gap-5 mt-1">
        {duplicates.map((suspect) => (
          <div
            key={suspect.id}
            className="bg-secondary border border-yellow-primary rounded-[20] p-5 flex flex-col gap-3"
          >
            {/* User 1 */}
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-full overflow-hidden bg-third flex items-center justify-center shrink-0">
                {suspect.user1AvatarUrl ? (
                  <Image
                    src={suspect.user1AvatarUrl}
                    alt={suspect.user1Name}
                    width={52}
                    height={52}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {getInitials(suspect.user1Name)}
                  </span>
                )}
              </div>
              <span className="text-white text-lg">{suspect.user1Name}</span>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-between">
              <div className="h-px flex-1 bg-white/10" />
              <HiUsers size={28} fill="#FFF081" className="mx-3" />
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* User 2 */}
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-full overflow-hidden bg-third flex items-center justify-center shrink-0">
                {suspect.user2AvatarUrl ? (
                  <Image
                    src={suspect.user2AvatarUrl}
                    alt={suspect.user2Name}
                    width={52}
                    height={52}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {getInitials(suspect.user2Name)}
                  </span>
                )}
              </div>
              <span className="text-white text-lg">{suspect.user2Name}</span>
            </div>

            {/* Confidence + Reasons */}
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className={`font-bold text-sm ${confidenceColor(suspect.confidence)}`}>
                {suspect.confidence}
              </span>
              <span className="text-white/30 text-sm">·</span>
              <span className="text-white/50 text-sm">
                {suspect.reasons.join(", ")}
              </span>
            </div>

            {/* Review button */}
            <button
              onClick={() => handleReview(suspect)}
              className="w-36 h-8.5 self-start bg-green-light hover:bg-green-light/80 active:scale-95 transition-all text-black font-bold rounded-full cursor-pointer"
            >
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
    </ThreeColumnLayoutAdmin>
  );
}