"use client";

import { useEffect, useState } from "react";
import GoBackButton from "@/components/ui/GoBackButton";
import BannedUserCard from "@/components/admin/banned/BannedUserCard";
import { BannedUser } from "@/types/BannedUser";
import SearchBar from "../../../components/search/SearchBar";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function BannedUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/admin/banned-users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBannedUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredUsers = bannedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleUnban = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/admin/banned-users/${id}/unban`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setBannedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <ThreeColumnLayoutAdmin>
      <div className="w-full flex flex-col gap-5 animate-fade-up">
        {/* Header */}
        <div className="flex items-center relative lg:hidden">
          <GoBackButton />
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <h1 className="text-white font-bold text-xl">Banned users</h1>
            <span className="w-2.5 h-2.5 rounded-full bg-red-emergency" />
          </div>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full bg-secondary rounded-[20] p-5 flex flex-col gap-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-full bg-white/10" />
                  <div className="h-5 w-36 bg-white/10 rounded-lg" />
                </div>
                <div className="h-4 w-48 bg-white/10 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <BannedUserCard key={user.id} user={user} onUnban={handleUnban} />
              ))
            ) : (
              <p className="text-white/40 text-center py-10">
                No banned users found.
              </p>
            )}
          </div>
        )}
      </div>
    </ThreeColumnLayoutAdmin>
  );
}