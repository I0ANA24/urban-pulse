"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface UserProfile {
  email: string;
  fullName: string | null;
  bio: string | null;
  skills: string[];
  tools: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5248/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, []);

  const displayName =
    profile?.fullName ?? profile?.email?.split("@")[0] ?? "User";

  return (
    <div className="w-full flex flex-col gap-12 mt-7">
      <section className="w-full flex justify-around items-center">
        <div className="size-35 rounded-full overflow-hidden">
          <Image
            src="/profile.png"
            alt={displayName}
            width={140}
            height={140}
            className="object-cover w-full h-full"
          />
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
              75%
            </p>
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="w-full mb-4 border border-[#383838]"></div>
        <p className="w-full">
          <span className="font-bold">Bio: </span>
          {profile?.bio ? (
            profile.bio
          ) : (
            <span className="text-white/30 italic">
              ✨ Tell your neighbors a bit about yourself!
            </span>
          )}
        </p>
        <div className="w-full mt-4 h-px bg-white"></div>
      </section>

      <div className="w-full flex flex-col justify-center items-center gap-6">
        <section className="w-full h-25 border-2 border-yellow-primary rounded-2xl flex items-center py-2 shadow-sm bg-[#1C1C1C]">
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <h3 className="text-lg font-bold">Helped</h3>
            <p className="text-yellow-primary text-3xl font-bold">0</p>
          </div>
          <div className="w-0.5 self-stretch my-3 bg-white"></div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <h3 className="text-lg font-bold">Posts</h3>
            <p className="text-yellow-primary text-3xl font-bold">0</p>
          </div>
        </section>

        <section className="w-full min-h-25 border-2 border-yellow-primary rounded-2xl flex flex-col justify-center gap-2 items-baseline py-4 px-6 shadow-sm bg-[#1C1C1C]">
          <h2 className="text-yellow-primary text-xl font-bold font-montagu">
            Skills
          </h2>
          {profile?.skills && profile.skills.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full overflow-hidden">
              {profile.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary flex-shrink-0"></span>
                  {skill}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm italic">
              ✏️ Add your skills so others know how you can help!
            </p>
          )}
        </section>

        <section className="w-full min-h-25 border-2 border-yellow-primary rounded-2xl flex flex-col justify-center gap-2 items-baseline py-4 px-6 shadow-sm bg-[#1C1C1C]">
          <h2 className="text-yellow-primary text-xl font-bold font-montagu">
            Tools & Resources
          </h2>
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
            <p className="text-white/30 text-sm italic">
              🔧 Share tools or resources you can lend to neighbors!
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
