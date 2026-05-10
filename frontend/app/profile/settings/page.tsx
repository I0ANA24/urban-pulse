"use client";

import { useEffect, useState } from "react";
import ProfileSettingsLink from "@/components/profile/ProfileSettingsLink";
import { ChevronRight, LogOut, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { API_BASE_URL as API } from "@/lib/api";

export default function Settings() {
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setDisplayName(data.fullName ?? data.email?.split("@")[0] ?? "User");
        setRole(data.role ?? "User");
        setAvatarUrl(data.avatarUrl ?? null);
      });
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/api/user`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0";
      router.push("/");
    } catch { setDeleting(false); }
  };

  const nameParts = displayName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  const isAdmin = role === "Admin";

  function getInitials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <>
      <div className="w-full h-full flex flex-col items-center gap-6 animate-fade-up">
        <div className="flex flex-col justify-center items-center gap-3">
          <div className="w-40 h-40 rounded-full overflow-hidden bg-[#2e2e2e] flex items-center justify-center">
            {avatarUrl ? (
              <Image src={avatarUrl} width={160} height={160} alt={displayName} className="object-cover w-full h-full rounded-full" />
            ) : (
              <span className="text-white text-4xl font-bold">{getInitials(displayName)}</span>
            )}
          </div>
          <h1 className="text-2xl font-montagu font-bold text-center leading-[1.15]">
            {lastName ? (<>{firstName}<br />{lastName}</>) : firstName}
          </h1>
        </div>

        <div className="w-full flex flex-col justify-center items-center gap-3">
          <ProfileSettingsLink text="edit" />
          <ProfileSettingsLink text="myposts" />
          <ProfileSettingsLink text="personal" />
          <ProfileSettingsLink text="security" />
          <ProfileSettingsLink text="saved" />
          <ProfileSettingsLink text="preferences" />
          {isAdmin && <ProfileSettingsLink text="admin" />}
        </div>

        <div className="w-full h-px bg-third my-2"></div>

        <div className="w-full flex flex-col justify-center items-center gap-3">
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full h-13 rounded-full px-5 flex justify-between items-center cursor-pointer bg-secondary">
            <div className="flex justify-center items-center gap-4">
              <LogOut className="size-6 text-red-emergency" strokeWidth={2} />
              <span className="text-lg font-semibold text-red-emergency">Log Out</span>
            </div>
            <ChevronRight className="size-6 text-red-emergency font-bold" />
          </button>

          <button onClick={() => setShowDeleteConfirm(true)} className="w-full h-13 rounded-full px-5 flex justify-between items-center cursor-pointer bg-secondary">
            <div className="flex justify-center items-center gap-4">
              <Trash2 className="size-6 text-red-emergency" strokeWidth={2} />
              <span className="text-lg font-semibold text-red-emergency">Delete Account</span>
            </div>
            <ChevronRight className="size-6 text-red-emergency font-bold" />
          </button>
        </div>
      </div>

      <ConfirmModal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onConfirm={handleLogOut} icon={<LogOut />} title="Log out" boldText="log out" />
      <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDeleteAccount} icon={<Trash2 />} title="Delete account" boldText="delete your account" loading={deleting} />
    </>
  );
}