"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import GoBackButton from "@/components/ui/GoBackButton";

const API = "http://localhost:5248";

interface FlaggedUser {
  userId: number;
  userName: string;
  avatarUrl: string | null;
  reportsCount: number;
  trustScore: number;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function FlaggedUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<FlaggedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/admin/flagged-users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-up pb-20">
      {/* Header */}
      <div className="flex items-center relative">
        <GoBackButton />
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <h1 className="text-white font-bold text-xl">Flagged users</h1>
          <span className="w-2.5 h-2.5 rounded-full bg-red-emergency" />
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-3 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full bg-secondary border border-red-emergency/20 rounded-2xl px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-white/10 shrink-0" />
              <div className="h-5 w-40 bg-white/10 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <p className="text-white/40 text-center mt-10">No flagged users.</p>
      )}

      {/* User list */}
      {!loading && (
        <div className="flex flex-col gap-3 mt-2">
          {users.map((user) => (
            <button
              key={user.userId}
              onClick={() => router.push(`/admin/tasks/flagged-users/${user.userId}`)}
              className="w-full bg-secondary border border-red-emergency rounded-2xl px-5 py-4 flex items-center justify-between transition-transform active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full overflow-hidden bg-third flex items-center justify-center shrink-0">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.userName}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {getInitials(user.userName)}
                    </span>
                  )}
                </div>

                {/* Name + reports count */}
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-white text-xl">{user.userName}</span>
                  <span className="text-red-emergency text-xs font-medium">
                    {user.reportsCount} {user.reportsCount === 1 ? "report" : "reports"}
                  </span>
                </div>
              </div>

              <ChevronRight className="size-9" strokeWidth={1.5} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}