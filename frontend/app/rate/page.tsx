"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import GoBackButton from "@/components/ui/GoBackButton";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { API_BASE_URL as API } from "@/lib/api";

interface UserProfile {
  id: number;
  fullName: string | null;
  email: string;
  avatarUrl?: string | null;
  skills: string[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function RateForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [checkedSkills, setCheckedSkills] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    fetch(`${API}/api/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const toggleSkill = (skill: string) => {
    setCheckedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (helpful === null || !userId) return;
    setSubmitting(true);

    const token = localStorage.getItem("token");
    await fetch(`${API}/api/user/${userId}/rate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ helpful }),
    }).catch(() => {});

    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => router.back(), 1500);
  };

  const displayName = profile
    ? (profile.fullName ?? profile.email?.split("@")[0] ?? "User")
    : "";

  if (loading) {
    return (
      <div className="w-full flex justify-center mt-20">
        <p className="text-white/40">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full flex justify-center mt-20">
        <p className="text-white/40">User not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-fade-up pb-10">
      {/* Mobile header */}
      <div className="flex w-full items-center relative lg:hidden">
        <GoBackButton />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white font-bold text-xl font-montagu">Rating</h1>
        </div>
      </div>

      {/* Desktop title */}
      <h1 className="hidden lg:block text-white font-bold text-2xl font-montagu mt-4">
        Rating
      </h1>

      {/* Avatar */}
      <div className="size-28 rounded-full overflow-hidden bg-secondary flex items-center justify-center mt-2">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={displayName}
            width={112}
            height={112}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-white text-3xl font-bold">
            {getInitials(displayName)}
          </span>
        )}
      </div>

      {/* Name */}
      <h2 className="text-white font-bold text-2xl font-montagu text-center leading-tight -mt-2">
        {displayName.includes(" ") ? (
          <>
            {displayName.split(" ")[0]}
            <br />
            {displayName.split(" ").slice(1).join(" ")}
          </>
        ) : (
          displayName
        )}
      </h2>

      {submitted ? (
        <div className="flex flex-col items-center gap-4 text-center mt-4">
          <span className="text-4xl">✅</span>
          <p className="text-white font-semibold">Rating submitted!</p>
          <p className="text-white/40 text-sm">Thank you for your feedback.</p>
        </div>
      ) : (
        <>
          {/* How helpful divider */}
          <div className="w-full flex items-center gap-3 px-1">
            <div className="flex-1 h-px bg-white/30" />
            <span className="text-white/70 text-sm whitespace-nowrap">
              How helpful was this user?
            </span>
            <div className="flex-1 h-px bg-white/30" />
          </div>

          {/* Helpful / Not helpful buttons */}
          <div className="w-full flex gap-4 px-1">
            <button
              onClick={() => setHelpful(true)}
              className={`flex-1 py-3.5 rounded-full font-bold text-base transition-all active:scale-95 cursor-pointer
                ${helpful === true
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                  : "bg-green-500/70 text-white/80"
                }`}
            >
              Helpful
            </button>
            <button
              onClick={() => setHelpful(false)}
              className={`flex-1 py-3.5 rounded-full font-bold text-base transition-all active:scale-95 cursor-pointer
                ${helpful === false
                  ? "bg-red-emergency text-white shadow-lg shadow-red-emergency/30"
                  : "bg-red-emergency/70 text-white/80"
                }`}
            >
              Not helpful
            </button>
          </div>

          {/* Offered help with checkboxes */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="w-full flex flex-col gap-3 px-1">
              <p className="text-white font-medium">Offered help with:</p>
              {profile.skills.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleSkill(skill)}
                >
                  <div
                    className={`w-6 h-6 rounded-sm border-2 flex items-center justify-center transition-colors
                      ${checkedSkills.has(skill)
                        ? "bg-white border-white"
                        : "bg-transparent border-white/60"
                      }`}
                  >
                    {checkedSkills.has(skill) && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 7L5.5 10.5L12 3.5"
                          stroke="#0a0a0a"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-white text-base">{skill}</span>
                </label>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-white/50 text-xs w-full px-1 mt-2">
            *Your rating doesn&apos;t notify the user
          </p>

          {/* OK button */}
          <button
            onClick={handleSubmit}
            disabled={helpful === null || submitting}
            className="w-full max-w-xs py-4 rounded-full bg-yellow-secondary text-black font-bold text-lg transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-primary mt-2"
          >
            {submitting ? "Submitting..." : "OK"}
          </button>
        </>
      )}
    </div>
  );
}

export default function RatePage() {
  return (
    <ThreeColumnLayout>
      <Suspense
        fallback={
          <div className="text-white/40 text-sm text-center mt-20">
            Loading...
          </div>
        }
      >
        <RateForm />
      </Suspense>
    </ThreeColumnLayout>
  );
}
