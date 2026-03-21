"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ProfileSettingsLink from "@/components/profile/ProfileSettingsLink";
import { ChevronRight, LogOut, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Settings() {
  const [displayName, setDisplayName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false); // Adăugat pentru Portal
  const router = useRouter();

  // Previne erorile de SSR la folosirea document.body
  useEffect(() => {
    setMounted(true);
  }, []);

  // Blochează scroll-ul când oricare popup este deschis
  useEffect(() => {
    const isAnyPopupOpen = showLogoutConfirm || showDeleteConfirm;
    document.body.style.overflow = isAnyPopupOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showLogoutConfirm, showDeleteConfirm]);

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
      <div className="w-full h-full flex flex-col items-center gap-6 animate-fade-up mt-2">
        <div className="flex flex-col justify-center items-center gap-3">
          <div className="w-full flex justify-center items-center">
            <Image
              src="/profile.png"
              width={130}
              height={130}
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
            className="w-full h-13 bg-secondary rounded-full px-5 flex justify-between items-center cursor-pointer"
          >
            <div className="flex justify-center items-center gap-4">
              <LogOut className="size-5 text-red-emergency" strokeWidth={2} />
              <span className="text-lg font-bold text-red-emergency">
                Log Out
              </span>
            </div>
            <ChevronRight className="size-6 text-red-emergency" />
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full h-13 bg-secondary rounded-full px-5 flex justify-between items-center cursor-pointer"
          >
            <div className="flex justify-center items-center gap-4">
              <Trash2 className="size-5 text-red-emergency" strokeWidth={2} />
              <span className="text-lg font-bold text-red-emergency">
                Delete Account
              </span>
            </div>
            <ChevronRight className="size-6 text-red-emergency font-bold" />
          </button>
        </div>
      </div>

      {/* Logout confirm popup via Portal */}
      {showLogoutConfirm &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/70 flex justify-center items-center px-6 z-50"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <div
              className="bg-secondary w-full rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center gap-2 py-4">
                <LogOut className="size-5 text-red-emergency" strokeWidth={2} />
                <h2 className="text-base font-bold text-red-emergency">
                  Log out
                </h2>
              </div>

              <div className="border-b border-white/10 w-[80%] mx-auto"></div>

              <div className="px-6 py-5 text-center">
                <p className="text-white leading-relaxed">
                  Are you sure you want to{" "}
                  <span className="font-bold underline">log out</span>?
                </p>
              </div>

              <div className="flex items-center justify-center mb-8 w-[80%] rounded-xl overflow-hidden h-10 mx-auto">
                <button
                  onClick={handleLogOut}
                  className="flex-1 h-full font-bold text-white bg-[#383838] cursor-pointer hover:bg-[#383838]/80 transition-colors duration-200"
                >
                  YES
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 h-full font-bold text-white bg-red-emergency cursor-pointer hover:bg-red-emergency/80 transition-colors duration-200"
                >
                  NO
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete confirm popup via Portal */}
      {showDeleteConfirm &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/70 flex justify-center items-center px-6 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="bg-secondary w-full rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center gap-2 py-4">
                <Trash2 className="size-5 text-red-emergency" strokeWidth={2} />
                <h2 className="text-base font-bold text-red-emergency">
                  Delete account
                </h2>
              </div>

              <div className="border-b border-white/10 w-[80%] mx-auto"></div>

              <div className="px-6 py-5 text-center">
                <p className="text-white leading-relaxed">
                  Are you sure you want to{" "}
                  <span className="font-bold underline">
                    delete your account
                  </span>
                  ?
                </p>
              </div>

              <div className="flex items-center justify-center mb-8 w-[80%] rounded-xl overflow-hidden h-10 mx-auto">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 h-full font-bold text-white bg-[#383838] cursor-pointer hover:bg-[#383838]/80 transition-colors duration-200"
                >
                  {deleting ? "..." : "YES"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-full font-bold text-white bg-red-emergency cursor-pointer hover:bg-red-emergency/80 transition-colors duration-200"
                >
                  NO
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
