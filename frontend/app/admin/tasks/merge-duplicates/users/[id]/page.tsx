"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { BadgeCheck, Check } from "lucide-react";
import GoBackButton from "@/components/ui/GoBackButton";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";

const API = "http://localhost:5248";

interface DuplicateSuspect {
  id: number;
  user1Id: number;
  user1Name: string;
  user1AvatarUrl: string | null;
  user1IsVerified: boolean;
  user1TrustScore: number;
  user1CreatedAt: string;
  user2Id: number;
  user2Name: string;
  user2AvatarUrl: string | null;
  user2IsVerified: boolean;
  user2TrustScore: number;
  user2CreatedAt: string;
  confidence: string;
  reasons: string[];
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ReviewDuplicateUsersPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [suspect, setSuspect] = useState<DuplicateSuspect | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/admin/duplicates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: DuplicateSuspect[]) => {
        console.log("All suspects:", data);
        console.log("Looking for id:", id, "parsed:", parseInt(id));
        const found = data.find((d) => d.id === parseInt(id));
        console.log("Found:", found);
        setSuspect(found ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [id]);

  const handleKeep = async () => {
    if (!selectedUserId || !suspect) return;
    setSubmitting(true);
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/admin/duplicates/${suspect.id}/merge?keepUserId=${selectedUserId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setSubmitting(false);
    router.back();
  };

  const handleIgnore = async () => {
    if (!suspect) return;
    setSubmitting(true);
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/admin/duplicates/${suspect.id}/dismiss`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setSubmitting(false);
    router.back();
  };

  if (loading) return <ThreeColumnLayoutAdmin><p className="text-white/40 text-center mt-20">Loading...</p></ThreeColumnLayoutAdmin>;
  if (!suspect) return <ThreeColumnLayoutAdmin><p className="text-white/40 text-center mt-20">Not found.</p></ThreeColumnLayoutAdmin>;

  const accounts = [
    {
      userId: suspect.user1Id,
      name: suspect.user1Name,
      avatarUrl: suspect.user1AvatarUrl,
      isVerified: suspect.user1IsVerified,
      trustScore: suspect.user1TrustScore,
      createdAt: suspect.user1CreatedAt,
    },
    {
      userId: suspect.user2Id,
      name: suspect.user2Name,
      avatarUrl: suspect.user2AvatarUrl,
      isVerified: suspect.user2IsVerified,
      trustScore: suspect.user2TrustScore,
      createdAt: suspect.user2CreatedAt,
    },
  ];

  return (
    <ThreeColumnLayoutAdmin>
    <div className="w-full flex flex-col gap-6 animate-fade-up pb-32">
      {/* Header */}
      <div className="flex items-center lg:hidden">
        <GoBackButton />
      </div>

      {/* Matches info */}
      <div className="flex flex-col gap-1">
        <h2 className="text-yellow-primary font-bold text-xl">Matches:</h2>
        <p className="text-white font-bold text-xl">
          {suspect.reasons.join(", ")}
        </p>
      </div>

      <div className="h-0.5 bg-white/60 -mt-3 mb-1" />

      <div className="flex flex-col gap-2">
        <p className="text-white text-base">
          Select which account is{" "}
          <span className="text-red-emergency font-bold">permanent</span>:
        </p>
        <p className="text-white/40 text-[13px] mt-4 -mb-2">
          *The other one will be deleted
        </p>
      </div>

      {/* User account cards */}
      <div className="flex flex-col gap-6">
        {accounts.map((account) => {
          const isSelected = selectedUserId === account.userId;

          return (
            <button
              key={account.userId}
              onClick={() => setSelectedUserId(account.userId)}
              className={`w-full bg-secondary border rounded-[20] p-5 flex flex-col gap-4 transition-all cursor-pointer text-left ${
                isSelected
                  ? "border-yellow-primary shadow-[0_0_15px_rgba(245,214,61,0.2)]"
                  : "border-yellow-primary"
              }`}
            >
              {/* Checkbox */}
              <div className="w-full flex justify-end -mb-8">
                <div
                  className={`w-7 h-7 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? "bg-yellow-primary border-yellow-primary"
                      : "bg-transparent border-white/60"
                  }`}
                >
                  {isSelected && (
                    <Check size={18} className="text-[#1a1a1a]" strokeWidth={3} />
                  )}
                </div>
              </div>

              {/* Avatar + Name + Verified + Member since */}
              <div className="flex items-center gap-4">
                <div className="w-19.5 h-19.5 rounded-full overflow-hidden bg-third flex items-center justify-center shrink-0">
                  {account.avatarUrl ? (
                    <Image
                      src={account.avatarUrl}
                      alt={account.name}
                      width={78}
                      height={78}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {getInitials(account.name)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-white text-[20px]">{account.name}</span>
                  {account.isVerified && (
                    <div className="flex items-center gap-1.5">
                      <BadgeCheck size={22} className="text-green-light fill-green-light/20" />
                      <span className="font-bold text-sm">Verified Neighbour</span>
                    </div>
                  )}
                  <span className="text-white/40 text-xs">
                    Member since{" "}
                    <span className="text-yellow-primary">
                      {formatDate(account.createdAt)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Trust score */}
              <p className="text-yellow-primary font-bold text-[20px] mt-2">
                Trust score: {account.trustScore}%
              </p>
            </button>
          );
        })}
      </div>

      {/* Bottom action buttons */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4 px-6 z-40">
        <button
          onClick={handleKeep}
          disabled={!selectedUserId || submitting}
          className={`w-36.5 h-11.5 rounded-full font-bold text-[20px] text-black transition-all cursor-pointer ${
            selectedUserId && !submitting
              ? "bg-green-light hover:bg-green-light/80 active:scale-95"
              : "bg-green-light/40 text-black/50 cursor-not-allowed"
          }`}
        >
          {submitting ? "..." : "Keep"}
        </button>
        <button
          onClick={handleIgnore}
          disabled={submitting}
          className="w-36.5 h-11.5 rounded-full font-bold text-[20px] bg-red-emergency hover:bg-red-emergency/80 active:scale-95 transition-all cursor-pointer text-white"
        >
          Ignore
        </button>
      </div>
    </div>
    </ThreeColumnLayoutAdmin>
  );
}