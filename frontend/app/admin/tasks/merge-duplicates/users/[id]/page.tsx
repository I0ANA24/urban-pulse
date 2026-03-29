"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BadgeCheck, Check } from "lucide-react";
import { PiSealCheck } from "react-icons/pi";
import GoBackButton from "@/components/ui/GoBackButton";

// ── Types ──
interface DuplicateUserAccount {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  trustScore: number;
}

const mockMatchCriteria = ["name", "photo", "phone"];

const mockDuplicateAccounts: DuplicateUserAccount[] = [
  {
    id: "1a",
    name: "Johnny Depp",
    avatar: "/profile.png",
    isVerified: true,
    trustScore: 74,
  },
  {
    id: "1b",
    name: "Johnny Depp",
    avatar: "/profile.png",
    isVerified: false,
    trustScore: 0,
  },
];

export default function ReviewDuplicateUsersPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleKeep = () => {
    if (!selectedId) return;
    console.log("Keep account:", selectedId);
    router.back();
  };

  const handleIgnore = () => {
    console.log("Ignore merge suggestion");
    router.back();
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-up pb-32">
      {/* Header — back button */}
      <div className="flex items-center">
        <GoBackButton />
      </div>

      {/* Matches info */}
      <div className="flex flex-col gap-1">
        <h2 className="text-yellow-primary font-bold text-xl">Matches:</h2>
        <p className="text-white font-bold text-xl">
          {mockMatchCriteria.join(", ")}
        </p>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-white/60 -mt-3 mb-1" />

      {/* Instruction */}
      <div className="flex flex-col gap-2">
        <p className="text-white text-base">
          Select which account is{" "}
          <span className="text-red-emergency font-bold">permanent</span>:
        </p>
        <p className="text-white/40 text-[13px] mt-4 -mb-2">
          *The other one/ones will be deleted
        </p>
      </div>

      {/* User account cards */}
      <div className="flex flex-col gap-6">
        {mockDuplicateAccounts.map((account) => {
          const isSelected = selectedId === account.id;

          return (
            <button
              key={account.id}
              onClick={() => setSelectedId(account.id)}
              className={`w-full h-53 bg-secondary border rounded-[20] p-5 flex flex-col gap-4 transition-all cursor-pointer text-left ${
                isSelected
                  ? "border-yellow-primary shadow-[0_0_15px_rgba(245,214,61,0.2)]"
                  : "border-yellow-primary"
              }`}
            >
              {/* Checkbox */}
              <div className="w-full flex justify-end -mb-8">
                <div
                  className={`w-7 h-7 bg-white rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? "bg-yellow-primary border-yellow-primary"
                      : "bg-transparent border-white/60"
                  }`}
                >
                  {isSelected && (
                    <Check
                      size={18}
                      className="text-[#1a1a1a]"
                      strokeWidth={3}
                    />
                  )}
                </div>
              </div>

              {/* Top: avatar + name + verified + checkbox */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-19.5 h-19.5 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={account.avatar}
                      alt={account.name}
                      width={78}
                      height={78}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name + Verified */}
                  <div className="flex flex-col gap-1">
                    <span className="text-white text-[20px]">
                      {account.name}
                    </span>
                    {account.isVerified && (
                      <div className="flex items-center gap-1.5">
                        <BadgeCheck
                          size={22}
                          className="text-green-light fill-green-light/20"
                        />{" "}
                        <span className="font-bold">Verified Neighbour</span>
                      </div>
                    )}
                  </div>
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

      {/* Bottom action buttons — fixed */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4 px-6 z-40">
        <button
          onClick={handleKeep}
          disabled={!selectedId}
          className={`w-36.5 h-11.5 rounded-full font-bold text-[20px] text-black transition-all cursor-pointer ${
            selectedId
              ? "bg-green-light hover:bg-green-light/80 active:scale-95"
              : "bg-green-light/40 text-black/50 cursor-not-allowed"
          }`}
        >
          Keep
        </button>
        <button
          onClick={handleIgnore}
          className="w-36.5 h-11.5 rounded-full font-bold text-[20px] bg-red-emergency hover:bg-emergency/80 active:scale-95 transition-all text-base cursor-pointer"
        >
          Ignore
        </button>
      </div>
    </div>
  );
}
