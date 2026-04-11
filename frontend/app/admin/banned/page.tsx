"use client";

import { useState } from "react";
import GoBackButton from "@/components/ui/GoBackButton";
import BannedUserCard from "@/components/admin/banned/BannedUserCard";
import { BannedUser } from "@/types/BannedUser";
import SearchBar from '../../../components/search/SearchBar';
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";

const mockBannedUsers: BannedUser[] = [
  { id: "1", name: "Anna Wintour", avatar: "/profile.png", bannedOn: "02/03/2026", reason: "Spamming" },
  { id: "2", name: "Elena Gilbert", avatar: "/profile.png", bannedOn: "01/12/2025", reason: "Harassment" },
  { id: "3", name: "Damon Salvatore", avatar: "/profile.png", bannedOn: "02/12/2025", reason: "Broken the rules" },
  { id: "4", name: "Liz Forbes", avatar: "/profile.png", bannedOn: "12/03/2026", reason: "Broken the rules" },
];

export default function BannedUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>(mockBannedUsers);

  const filteredUsers = bannedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleUnban = (id: string) => {
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

      {/* Search bar - Mult mai curat acum */}
      <SearchBar 
        value={searchQuery} 
        onChange={setSearchQuery} 
      />

      {/* User list */}
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
    </div>
    </ThreeColumnLayoutAdmin>
  );
}