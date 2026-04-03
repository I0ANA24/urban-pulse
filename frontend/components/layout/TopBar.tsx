"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Home } from "lucide-react";
import GoBackButton from "../ui/GoBackButton";
import ProfileRoundButton from "../ui/ProfileRoundButton";
import { Plus } from "lucide-react";

interface TopBarProps {
  back: boolean;
  notifications: boolean;
  settings: boolean;
  addPost?: boolean;
}

export default function TopBar({
  back,
  notifications,
  settings,
  addPost,
}: TopBarProps) {
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5248/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserName(data.fullName ?? data.email ?? "");
        setAvatarUrl(data.avatarUrl ?? "");
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* MOBILE TopBar */}
      <div
        className={`flex lg:hidden ${back || addPost ? "justify-between" : "justify-end"} ${
          addPost ? "mb-[calc(15vh-78px)]" : ""
        } items-center`}
      >
        {back && <GoBackButton />}
        {addPost && (
          <ProfileRoundButton route="/addPost">
            <Plus width={47} height={30} strokeWidth={3} />
          </ProfileRoundButton>
        )}

        <div className="flex justify-center items-center gap-3">
          {notifications && (
            <ProfileRoundButton route="">
              <Image
                src="/notifications.svg"
                alt="go_back"
                width={40}
                height={25}
              />
            </ProfileRoundButton>
          )}
          {settings && (
            <ProfileRoundButton route="./profile/settings">
              <Image src="/settings.svg" alt="go_back" width={47} height={30} />
            </ProfileRoundButton>
          )}
        </div>
      </div>

      {/* DESKTOP TopBar */}
      <div
        className="hidden lg:flex items-center justify-between h-23 -mx-6 -mt-6 mb-6 px-8 py-3 border-b border-white/20"
        style={{
          filter: "drop-shadow(0px 4px 8.4px rgba(0, 0, 0, 0.69))",
        }}
      >
        {/* Left — Branding */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Home size={28} className="text-white mr-8" />
          <h1 className="font-montagu text-white text-3xl">UrbanPulse</h1>
          <span className="w-3 h-3 rounded-full bg-green-light" />
        </Link>

        {/* Right — Notifications + User */}
        <div className="flex items-center gap-5">
          {/* Notification bell */}
          {notifications && (
            <ProfileRoundButton route="">
              <Image
                src="/notifications.svg"
                alt="notifications"
                width={40}
                height={25}
              />
            </ProfileRoundButton>
          )}

          {/* User info */}
          <Link
            href="/profile"
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            {/* Avatar */}
            <div className="w-13.5 h-13.5 rounded-full bg-yellow-primary overflow-hidden flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={userName}
                  width={60}
                  height={60}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <span className="text-black text-lg font-bold">
                  {userName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "UP"}
                </span>
              )}
            </div>

            {/* Name */}
            <span className="text-white text-2xl font-normal">
              {userName || "User"}
            </span>

            {/* Chevron */}
            <div className="w-13 h-13 rounded-full flex items-center justify-center -ml-6">
              <ChevronDown size={32} />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
