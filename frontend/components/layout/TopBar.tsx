"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import GoBackButton from "../ui/GoBackButton";
import ProfileRoundButton from "../ui/ProfileRoundButton";
import { Plus } from "lucide-react";
import { useSignalR } from "@/context/SignalRContext";
// import HomeIcon from "../icons/navbar/HomeIcon"; // uncomment after merge with main

interface TopBarProps {
  back: boolean;
  notifications: boolean;
  settings: boolean;
  addPost?: boolean;
}

export default function TopBar({ back, notifications, settings, addPost }: TopBarProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const { notificationConnection } = useSignalR();

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

  useEffect(() => {
    if (!notifications) return;
    const fetchCount = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5248/api/notification/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [notifications]);

  useEffect(() => {
    if (!notificationConnection) return;
    const handler = () => setUnreadCount((prev) => prev + 1);
    notificationConnection.on("NewNotification", handler);
    return () => notificationConnection.off("NewNotification", handler);
  }, [notificationConnection]);

  const NotificationButton = () => (
    <ProfileRoundButton route="/notifications">
      <div className="relative">
        <Image src="/notifications.svg" alt="notifications" width={40} height={25} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
    </ProfileRoundButton>
  );

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
          {notifications && <NotificationButton />}
          {settings && (
            <ProfileRoundButton route="./profile/settings">
              <Image src="/settings.svg" alt="settings" width={47} height={30} />
            </ProfileRoundButton>
          )}
        </div>
      </div>

      {/* DESKTOP TopBar */}
      <div className="hidden lg:flex items-center justify-between h-23 -mx-6 px-8 py-3 mb-6 border-b border-white/20">
        {/* Left — Branding */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={() => {
            const feed = document.getElementById("feed-scroll");
            if (feed) feed.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {/* <HomeIcon className="w-20 h-20" /> */}
          <h1 className="font-montagu text-white text-3xl">UrbanPulse</h1>
          <span className="w-3 h-3 rounded-full bg-green-light" />
        </Link>

        {/* Right — Notifications + User */}
        <div className="flex items-center gap-5">
          {notifications && <NotificationButton />}

          <Link href="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="w-13.5 h-13.5 rounded-full bg-yellow-primary overflow-hidden flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={userName} width={60} height={60} className="rounded-full object-cover w-full h-full" />
              ) : (
                <span className="text-black text-lg font-bold">
                  {userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "UP"}
                </span>
              )}
            </div>
            <span className="text-white text-2xl font-normal">{userName || "User"}</span>
            <div className="w-13 h-13 rounded-full flex items-center justify-center -ml-6">
              <ChevronDown size={32} />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}