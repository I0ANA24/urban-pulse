"use client";

import { useEffect, useState, useRef } from "react";
import BSTCard from "@/components/ui/profile/BSTCard";
import EditSkillsOrTR from "@/components/ui/profile/EditSkillsOrTR";
import HorizontalCard from "@/components/ui/profile/HorizontalCard";
import Image from "next/image";

export default function EditProfile() {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5248/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFullName(data.fullName ?? "");
        setBio(data.bio ?? "");
        setSkills(data.skills ?? []);
        setTools(data.tools ?? []);
      });
  }, []);

  const autoSave = (
    updatedFullName: string,
    updatedBio: string,
    updatedSkills: string[],
    updatedTools: string[]
  ) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5248/api/user/profile", {
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  return (
    <div className="w-full h-full flex flex-col items-center gap-5 animate-fade-up">
      <div className="w-full flex justify-center items-center">
        <Image
          src="/profile.png"
          width={93}
          height={91}
          alt="profile_picture"
        />
      </div>

      <div className="w-full flex items-center justify-between px-1">
        <h1 className="text-2xl font-montagu font-bold text-center leading-[1.15]">
          Edit profile
        </h1>
        {saved && (
          <p className="text-green-400 text-sm animate-fade-up">✓ Saved</p>
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