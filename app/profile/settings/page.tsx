"use client";

import { useEffect, useState } from "react";
import ProfileSettingsLink from "@/components/ui/profile/ProfileSettingsLink";
import { ChevronRight, LogOut, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Settings() {
  const [displayName, setDisplayName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5248/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setDisplayName(data.fullName ?? data.email?.split("@")[0] ?? "User");
      });
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5248/api/user", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      router.push("/");
    } catch {
      setDeleting(false);
    }
  };

  const nameParts = displayName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <>
      <div className="w-full h-full flex flex-col items-center gap-6 animate-fade-up">
        <div className="flex flex-col justify-center items-center gap-3">
          <div className="w-full flex justify-center items-center">
            <Image
              src="/profile.png"
              width={186}
              height={175}
              alt="profile_picture"
            />
          </div>
          <h1 className="text-2xl font-montagu font-bold text-center leading-[1.15]">
            {lastName ? (
              <>
                {firstName}
                <br />
                {lastName}
              </>
            ) : (
              firstName
            )}
          </h1>
        </div>

        <div className="w-full flex flex-col justify-center items-center gap-3 mb-10">
          <ProfileSettingsLink text="edit" />
          <ProfileSettingsLink text="myposts" />
          <ProfileSettingsLink text="personal" />
          <ProfileSettingsLink text="security" />
          <ProfileSettingsLink text="saved" />
          <ProfileSettingsLink text="preferences" />
        </div>

        <div className="w-full h-px bg-[#383838] my-2 -mb-1"></div>

        <div className="w-full flex flex-col justify-center items-center gap-3 mb-10">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full h-14 bg-secondary rounded-full px-5 flex justify-between items-center cursor-pointer"
          >
            <div className="flex justify-center items-center gap-4">
              <LogOut className="size-7 text-red-emergency" strokeWidth={2} />
              <span className="text-xl font-bold text-red-emergency">
                Log Out
              </span>
            </div>
            <ChevronRight className="size-7 text-red-emergency font-bold" />
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full h-14 bg-secondary rounded-full px-5 flex justify-between items-center cursor-pointer"
          >
            <div className="flex justify-center items-center gap-4">
              <Trash2 className="size-7 text-red-emergency" strokeWidth={2} />
              <span className="text-xl font-bold text-red-emergency">
                Delete Account
              </span>
            </div>
            <ChevronRight className="size-7 text-red-emergency font-bold" />
          </button>
        </div>
      </div>

      {/* Logout confirm popup */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center px-6 z-50"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-[#1e1e1e] w-full rounded-2xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-2 py-4 border-b border-white/10">
              <LogOut className="size-5 text-[#C0392B]" strokeWidth={2} />
              <h2 className="text-base font-bold text-[#C0392B]">Log out</h2>
            </div>

            <div className="px-6 py-5 text-center">
              <p className="text-white text-sm leading-relaxed">
                Are you sure you want to{" "}
                <span className="font-bold underline">log out?</span>
              </p>
            </div>

            <div className="flex border-t border-white/10">
              <button
                onClick={handleLogOut}
                className="flex-1 py-4 font-bold text-sm text-white bg-transparent border-r border-white/10"
              >
                YES
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 font-bold text-sm text-white bg-[#8B1A1A]"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm popup */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center px-6 z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-[#1e1e1e] w-full rounded-2xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-2 py-4 border-b border-white/10">
              <Trash2 className="size-5 text-[#C0392B]" strokeWidth={2} />
              <h2 className="text-base font-bold text-[#C0392B]">Delete account</h2>
            </div>

            <div className="px-6 py-5 text-center">
              <p className="text-white text-sm leading-relaxed">
                Are you sure you want to{" "}
                <span className="font-bold underline">delete your account?</span>
              </p>
            </div>

            <div className="flex border-t border-white/10">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-4 font-bold text-sm text-white bg-transparent border-r border-white/10 disabled:opacity-50"
              >
                {deleting ? "..." : "YES"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-4 font-bold text-sm text-white bg-[#8B1A1A]"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}