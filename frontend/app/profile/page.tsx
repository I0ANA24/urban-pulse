"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { BadgeCheck, User, Camera, ArrowLeftRight } from "lucide-react";
import { useUser } from "@/context/UserContext";

const API = "http://localhost:5248";

interface UserProfile {
  id: number;
  email: string;
  fullName: string | null;
  bio: string | null;
  skills: string[];
  tools: string[];
  avatarUrl: string | null;
  isVerified: boolean;
  role: string;
  trustScore: number;
  helpfulCount: number;
  createdAt: string;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [postsCount, setPostsCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { viewAsUser, setViewAsUser } = useUser();

  useEffect(() => {
    const loadProfilePage = async () => {
      try {
        const token = localStorage.getItem("token");
        const [profileRes, postsRes] = await Promise.all([
          fetch(`${API}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/user/my-posts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPostsCount(Array.isArray(postsData) ? postsData.length : 0);
        } else {
          setPostsCount(0);
        }
      } catch (error) {
        console.error("Failed to load profile page:", error);
      }
    };

    loadProfilePage();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/user/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => prev ? { ...prev, avatarUrl: data.avatarUrl } : prev);
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleAdminMode = () => {
    setViewAsUser(false);
    router.push("/admin");
  };

  const isRealAdmin = profile?.role === "Admin";
  const displayName = profile?.fullName ?? profile?.email?.split("@")[0] ?? "User";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const profileContent = (
    <div className="w-full flex flex-col gap-12 mt-7">
      <section className="w-full flex justify-around items-center -mb-7">
        <div className="flex flex-col justify-center items-center">

          <div className="relative size-35">
            <div className="size-35 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
              {profile?.avatarUrl ? (
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

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-green-light flex items-center justify-center border-2 border-background hover:bg-green-light/80 transition-colors cursor-pointer"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              ) : (
                <Camera size={16} className="text-black" strokeWidth={2.5} />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {isRealAdmin && viewAsUser && (
            <button
              onClick={handleAdminMode}
              className="flex items-center gap-2 bg-secondary rounded-full px-5 py-2.5 transition-transform active:scale-95 cursor-pointer hover:bg-secondary/90 mt-4"
            >
              <ArrowLeftRight size={20} className="text-white" />
              <span className="text-white text-sm font-medium">Admin mode</span>
            </button>
          )}

          <div>
            {profile?.isVerified && (
              <div className="flex items-center gap-1.5 mt-5">
                <BadgeCheck size={22} className="text-green-light fill-green-light/20" />
                <span className="font-bold">Verified Neighbour</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <User size={22} className="fill-white" />
              <span className="font-bold">Member since: <span className="text-green-light font-normal">{memberSince}</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-center">
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
              Trust<br />score
            </p>
            <div className="h-6 w-1 border-r border-yellow-primary mx-2"></div>
            <p className="font-montagu text-xl text-yellow-primary font-bold text-center text-shadow-lg text-shadow-neutral-600/30 ml-3">
              {profile?.trustScore ?? 0}%
            </p>
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="w-full mb-4 border border-third"></div>
        <p className="w-full">
          <span className="font-bold">Bio: </span>
          {profile?.bio ? (
            profile.bio
          ) : (
            <span className="text-white/30 italic">✨ Tell your neighbors a bit about yourself!</span>
          )}
        </p>
        <div className="w-full mt-4 h-px bg-white"></div>
      </section>

      <div className="w-full flex flex-col justify-center items-center gap-6">
        <section className="w-full h-25 border-2 border-yellow-primary rounded-2xl flex items-center py-2 shadow-sm bg-[#1C1C1C]">
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <h3 className="text-lg font-bold">Helped</h3>
            <p className="text-yellow-primary text-3xl font-bold">{profile?.helpfulCount ?? 0}</p>
          </div>
          <div className="w-0.5 self-stretch my-3 bg-white"></div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <h3 className="text-lg font-bold">Posts</h3>
            <p className="text-yellow-primary text-3xl font-bold">{postsCount}</p>
          </div>
        </section>

        <section className="w-full min-h-25 border-2 border-yellow-primary rounded-2xl flex flex-col justify-center gap-2 items-baseline py-4 px-6 shadow-sm bg-[#1C1C1C]">
          <h2 className="text-yellow-primary text-xl font-bold font-montagu">Skills</h2>
          {profile?.skills && profile.skills.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full overflow-hidden">
              {profile.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary shrink-0"></span>
                  {skill}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm italic">✏️ Add your skills so others know how you can help!</p>
          )}
        </section>

        <section className="w-full min-h-25 border-2 border-yellow-primary rounded-2xl flex flex-col justify-center gap-2 items-baseline py-4 px-6 shadow-sm bg-[#1C1C1C]">
          <h2 className="text-yellow-primary text-xl font-bold font-montagu">Tools & Resources</h2>
          {profile?.tools && profile.tools.length > 0 ? (
            <div className="w-full flex flex-col gap-y-2 overflow-hidden">
              {profile.tools.map((tool, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
                  {tool}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm italic">🔧 Share tools or resources you can lend to neighbors!</p>
          )}
        </section>
      </div>
    </div>
  );

  return (
    <ThreeColumnLayout>
      {profileContent}
    </ThreeColumnLayout>
  );
}