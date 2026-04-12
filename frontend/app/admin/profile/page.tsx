"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import CrownIcon from "@/components/icons/profile/CrownIcon";
import { useUser } from "@/context/UserContext";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";

const API = "http://localhost:5248";

interface AdminProfile {
  displayName: string;
  avatarUrl: string | null;
  trustScore: number;
  tasksBanned: number;
  tasksPostsDeleted: number;
  tasksDuplicatesMerged: number;
  tasksDismissed: number;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const { setViewAsUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setProfile({
          displayName: data.fullName ?? data.email?.split("@")[0] ?? "User",
          avatarUrl: data.avatarUrl ?? null,
          trustScore: data.trustScore ?? 0,
          tasksBanned: data.tasksBanned ?? 0,
          tasksPostsDeleted: data.tasksPostsDeleted ?? 0,
          tasksDuplicatesMerged: data.tasksDuplicatesMerged ?? 0,
          tasksDismissed: data.tasksDismissed ?? 0,
        });
      } catch (error) {
        console.error("Failed to load admin profile:", error);
      }
    };

    loadAdminProfile();
  }, []);

  const handleUserMode = () => {
    setViewAsUser(true);
    router.push("/dashboard");
  };

  function getInitials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  const displayName = profile?.displayName ?? "";
  const nameParts = displayName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  const totalTasksDone =
    (profile?.tasksBanned ?? 0) +
    (profile?.tasksPostsDeleted ?? 0) +
    (profile?.tasksDuplicatesMerged ?? 0) +
    (profile?.tasksDismissed ?? 0);

  return (
    <ThreeColumnLayoutAdmin>
      <div className="w-full flex flex-col gap-6 animate-fade-up">
        <section className="w-full flex justify-around items-center mt-4">
          <div className="flex flex-col justify-center items-center">
            <div className="size-35 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
              {profile?.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={displayName} width={140} height={140} className="object-cover w-full h-full" />
              ) : (
                <span className="text-white text-4xl font-bold">{getInitials(displayName)}</span>
              )}
            </div>
            <button
              onClick={handleUserMode}
              className="flex items-center gap-2 bg-secondary rounded-full px-5 py-2.5 transition-transform active:scale-95 cursor-pointer hover:bg-secondary/90 mt-4"
            >
              <ArrowLeftRight size={20} className="text-white" />
              <span className="text-white text-sm font-medium">User mode</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 items-center">
            <h1 className="text-2xl font-bold font-montagu text-center leading-tight">
              {lastName ? (<>{firstName}<br />{lastName}</>) : firstName}
            </h1>
            <div className="flex justify-center items-center gap-1">
              <CrownIcon />
              <span className="text-green-light font-montagu text-lg tracking-wider">Admin</span>
            </div>
            <div className="flex justify-center items-center rounded-full px-4 py-1 bg-linear-to-b from-[#FFFADC]/50 to-[#FFF197]/50 shadow-[0px_11.3915px_22.3363px_rgba(255,227,42,0.19),inset_0px_-2px_1px_rgba(255,241,151,0.4)] backdrop-blur-[2px] border border-yellow-primary">
              <p className="font-montagu font-medium text-xs text-yellow-primary leading-3">Trust<br />score</p>
              <div className="h-6 w-1 border-r border-yellow-primary mx-2"></div>
              <p className="font-montagu text-xl text-yellow-primary font-bold text-center ml-3">{profile?.trustScore ?? 0}%</p>
            </div>
          </div>
        </section>

        <div className="w-full flex flex-col justify-center items-center gap-6">
          {/* Total tasks done */}
          <section className="w-full h-25 border-2 border-green-light rounded-2xl flex items-center py-2 shadow-sm bg-[#1C1C1C]">
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
              <h3 className="text-lg font-bold text-center">Tasks<br />done</h3>
            </div>
            <div className="w-0.5 self-stretch my-3 bg-white"></div>
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
              <p className="text-green-light text-3xl font-bold">{totalTasksDone}</p>
            </div>
          </section>

          {/* Breakdown per tip */}
          <section className="w-full border-2 border-green-light rounded-2xl flex flex-col justify-center gap-3 p-6 shadow-sm bg-[#1C1C1C]">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-emergency" />
              <span className="text-white text-base font-bold">
                Flagged users:{" "}
                <span className="text-red-emergency font-bold">{profile?.tasksBanned ?? 0}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-blue" />
              <span className="text-white text-base font-bold">
                Flagged content:{" "}
                <span className="text-blue font-bold">{profile?.tasksPostsDeleted ?? 0}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-yellow-primary" />
              <span className="text-white text-base font-bold">
                Duplicates:{" "}
                <span className="text-yellow-primary font-bold">{profile?.tasksDuplicatesMerged ?? 0}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-light" />
              <span className="text-white text-base font-bold">
                Reports dismissed:{" "}
                <span className="text-green-light font-bold">{profile?.tasksDismissed ?? 0}</span>
              </span>
            </div>
          </section>
        </div>

        <div className="flex justify-center mt-4 mb-8">
          <Image src="/admin-profile.svg" alt="Admin illustration" width={243} height={208} />
        </div>
      </div>
    </ThreeColumnLayoutAdmin>
  );
}