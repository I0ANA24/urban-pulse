"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { BadgeCheck, User } from "lucide-react";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

const API = "http://localhost:5248";

interface UserProfile {
  id: number;
  email: string;
  fullName: string | null;
  bio: string | null;
  skills: string[];
  tools: string[];
  trustScore: number;
  isVerified: boolean;
  createdAt: string;
  helpedCount: number;
  postsCount: number;
  avatarUrl?: string | null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleMessage = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/chat/conversations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otherUserId: parseInt(id) }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/chat-conversation/${data.conversationId}`);
    }
  };

  const formatMemberSince = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

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

  const displayName =
    profile.fullName ?? profile.email?.split("@")[0] ?? "User";

  return (
    <ThreeColumnLayout>
      <div className="w-full flex flex-col gap-8 mt-7 pb-10">
        {/* Avatar + Name + Trust score */}
        <section className="w-full flex justify-around items-center">
          <div className="size-35 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={displayName}
                width={140}
                height={140}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-white text-4xl font-bold">
                {getInitials(displayName)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold font-montagu text-center leading-tight">
              {displayName.includes(" ") ? (
                <>
                  {displayName.split(" ")[0]}
                  <br />
                  {displayName.split(" ").slice(1).join(" ")}
                </>
              ) : (
                displayName
              )}
            </h1>

            <div className="flex justify-center items-center rounded-full px-4 py-1 bg-linear-to-b from-[#FFFADC]/50 to-[#FFF197]/50 shadow-[0px_11.3915px_22.3363px_rgba(255,227,42,0.19),inset_0px_-2px_1px_rgba(255,241,151,0.4)] backdrop-blur-[2px] border border-yellow-primary">
              <p className="font-montagu font-medium text-xs text-yellow-primary leading-3 text-shadow-lg text-shadow-neutral-600/50">
                Trust
                <br />
                score
              </p>
              <div className="h-6 w-1 border-r border-yellow-primary mx-2"></div>
              <p className="font-montagu text-xl text-yellow-primary font-bold text-center text-shadow-lg text-shadow-neutral-600/30 ml-3">
                {profile.trustScore ?? 0}%
              </p>
            </div>
          </div>
        </section>

        {/* Verified + Member since */}
        <div className="w-full flex justify-around">
          <div className="w-contain flex-col gap-2 px-1">
            {profile.isVerified && (
              <div className="flex items-center gap-2">
                <BadgeCheck
                  size={22}
                  className="text-green-light fill-green-light/20"
                />
                <span className="font-semibold text-sm">Verified Neighbour</span>
              </div>
            )}
            {profile.createdAt && (
              <div className="flex items-center gap-2 pt-2">
                <User size={22} fill="white" />
                <span className="text-sm">
                  <span className="font-bold">Member since: </span>
                  <span className="text-yellow-primary">
                    {formatMemberSince(profile.createdAt)}
                  </span>
                </span>
              </div>
            )}
          </div>
          <div className="w-36 h-5"></div>
        </div>

        {/* Message + Report buttons */}
        <section className="w-full flex justify-center items-center gap-4">
          <button
            onClick={handleMessage}
            className="w-50 py-3 rounded-2xl bg-blue text-[#0A0A0A] hover:bg-blue/90 font-bold text-base transition-colors cursor-pointer"
          >
            Message
          </button>
          <button
            onClick={() => router.push(`/report-user?userId=${id}`)}
            className="w-50 py-3 rounded-2xl bg-red-emergency text-white font-bold text-base hover:bg-red-emergency/90 transition-colors cursor-pointer"
          >
            Report
          </button>
        </section>

        {/* Bio */}
        <section className="w-full">
          <div className="w-full mb-4 border border-white/40"></div>
          <p className="w-full">
            <span className="font-bold">Bio: </span>
            {profile.bio ? (
              profile.bio
            ) : (
              <span className="text-white/30 italic">No bio yet.</span>
            )}
          </p>
          <div className="w-full mt-4 h-px bg-white/40"></div>
        </section>

        {/* Stats */}
        <div className="w-full flex flex-col justify-center items-center gap-6">
          <section className="w-full h-25 border-2 border-yellow-primary rounded-2xl flex items-center py-2 shadow-sm bg-[#1C1C1C]">
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
              <h3 className="text-lg font-bold">Helped</h3>
              <p className="text-yellow-primary text-3xl font-bold">
                {profile.helpedCount ?? 0}
              </p>
            </div>
            <div className="w-0.5 self-stretch my-3 bg-white"></div>
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
              <h3 className="text-lg font-bold">Posts</h3>
              <p className="text-yellow-primary text-3xl font-bold">
                {profile.postsCount ?? 0}
              </p>
            </div>
          </section>

          {/* Skills */}
          <section className="w-full min-h-25 border-2 border-yellow-primary rounded-2xl flex flex-col justify-center gap-2 items-baseline py-4 px-6 shadow-sm bg-[#1C1C1C]">
            <h2 className="text-yellow-primary text-xl font-bold font-montagu">
              Skills
            </h2>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full overflow-hidden">
                {profile.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary shrink-0"></span>
                    {skill}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm italic">No skills listed.</p>
            )}
          </section>

          {/* Tools & Resources */}
          <section className="w-full min-h-25 border-2 border-yellow-primary rounded-2xl flex flex-col justify-center gap-2 items-baseline py-4 px-6 shadow-sm bg-[#1C1C1C]">
            <h2 className="text-yellow-primary text-xl font-bold font-montagu">
              Tools & Resources
            </h2>
            {profile.tools && profile.tools.length > 0 ? (
              <div className="w-full flex flex-col gap-y-2 overflow-hidden">
                {profile.tools.map((tool, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
                    {tool}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm italic">No tools listed.</p>
            )}
          </section>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}
