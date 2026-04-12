"use client";

import { useEffect, useState, useRef } from "react";
import BSTCard from "@/components/profile/BSTCard";
import EditSkillsOrTR from "@/components/profile/EditSkillsOrTR";
import HorizontalCard from "@/components/profile/HorizontalCard";
import Image from "next/image";

export default function EditProfile() {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5248/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setFullName(data.fullName ?? "");
        setBio(data.bio ?? "");
        setSkills(data.skills ?? []);
        setTools(data.tools ?? []);
        setAvatarUrl(data.avatarUrl ?? null);
      } catch (error) {
        console.error("Failed to load edit profile data:", error);
      }
    };

    loadProfile();
  }, []);

  const autoSave = (
    updatedFullName: string,
    updatedBio: string,
    updatedSkills: string[],
    updatedTools: string[]
  ) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5248/api/user/profile", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: updatedFullName,
            bio: updatedBio,
            skills: updatedSkills,
            tools: updatedTools,
          }),
        });
        if (!res.ok) return;
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (error) {
        console.error("Failed to autosave profile:", error);
      }
    }, 1000);
  };

  return (
    <div className="w-full h-full flex flex-col items-center gap-5 animate-fade-up">
      <div className="w-full flex justify-center items-center">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary flex items-center justify-center border-2 border-white/10">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              width={96}
              height={96}
              alt="profile_picture"
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-white font-bold text-2xl">
              {fullName ? fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "UP"}
            </span>
          )}
        </div>
      </div>

      <div className="w-full flex items-center justify-between px-1">
        <h1 className="w-full text-center text-2xl font-montagu font-bold leading-[1.15]">
          Edit profile
        </h1>
        {saved && (
          <p className="text-green-light text-sm animate-fade-up">✓ Saved</p>
        )}
      </div>

      <HorizontalCard
        title="Name"
        type="text"
        placeholder="Your name..."
        value={fullName}
        onChange={(e) => {
          setFullName(e.target.value);
          autoSave(e.target.value, bio, skills, tools);
        }}
      />

      <BSTCard title="Bio">
        <textarea
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
            autoSave(fullName, e.target.value, skills, tools);
          }}
          placeholder="Tell us something about you..."
          className="outline-none resize-none h-30 bg-transparent text-sm w-full"
        />
      </BSTCard>

      <BSTCard title="Skills">
        <EditSkillsOrTR
          add="Skills"
          items={skills}
          onItemsChange={(newSkills) => {
            setSkills(newSkills);
            autoSave(fullName, bio, newSkills, tools);
          }}
        />
      </BSTCard>

      <BSTCard title="Tools & Resources">
        <EditSkillsOrTR
          add="TR"
          items={tools}
          onItemsChange={(newTools) => {
            setTools(newTools);
            autoSave(fullName, bio, skills, newTools);
          }}
        />
      </BSTCard>
    </div>
  );
}