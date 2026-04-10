"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, UserCircle, Settings } from "lucide-react";
import GoBackButton from "../ui/GoBackButton";
import ProfileRoundButton from "../ui/ProfileRoundButton";
import { Plus } from "lucide-react";
import { useSignalR } from "@/context/SignalRContext";
import HomeIcon from "../icons/navbar/HomeIcon";
import NotificationsPanel from "../notifications/NotificationsPanel";

interface TopBarProps {
  back: boolean;
  notifications: boolean;
  settings: boolean;
  addPost?: boolean;
}

export default function TopBar({ back, notifications, settings, addPost }: TopBarProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notificationConnection } = useSignalR();

  const handlePanelClose = useCallback(() => setPanelOpen(false), []);
  const handleUnreadChange = useCallback((count: number) => setUnreadCount(count), []);

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
        setIsAdmin(data.isAdmin ?? (data.role === "Admin"));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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
          <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1">
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
      <div className="hidden lg:flex items-center justify-between h-23 -mx-6 px-8 py-3 mb-8 border-b border-white/20">
        {/* Left — Branding */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={() => {
            const feed = document.getElementById("feed-scroll");
            if (feed) feed.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <HomeIcon className="w-20 h-20" />
          <h1 className="font-montagu text-white text-3xl">UrbanPulse</h1>
          <span className="w-3 h-3 rounded-full bg-green-light" />
        </Link>

        {/* Right — Notifications + User */}
        <div className="flex items-center gap-5">

          {/* Bell button (desktop only) */}
            <button
              onClick={() => setPanelOpen((prev) => !prev)}
              className="relative flex items-center justify-center w-13.5 h-13.5 rounded-full bg-[#1F1F1F] shadow-[0_4px_4px_rgba(0,0,0,0.25),inset_0_0_5px_rgba(255,255,255,0.4)] border border-white/50 transition-transform duration-200 active:scale-95 cursor-pointer hover:scale-104"
            >
              <Image src="/notifications.svg" alt="notifications" width={40} height={25} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
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
              <ChevronDown
                size={32}
                className={`-ml-2 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full px-2 mt-3 w-65 bg-[#0F0F0F] border border-secondary rounded-2xl py-2 shadow-xl z-50">
                <button
                  onClick={() => { setDropdownOpen(false); router.push("/profile"); }}
                  className="flex items-center rounded-xl gap-3 w-full px-5 py-3 text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <UserCircle size={22} className="text-white" />
                  <span className="text-base">View profile</span>
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); router.push("/profile/settings/edit"); }}
                  className="flex items-center rounded-xl gap-3 w-full px-5 py-3 text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Settings size={22} className="text-white" />
                  <span className="text-base">Settings</span>
                </button>
                {isAdmin && (
                  <div className="px-4 pt-2 pb-2">
                    <button
                      onClick={() => { setDropdownOpen(false); router.push("/admin"); }}
                      className="w-full bg-red-emergency hover:bg-red-emergency/80 text-white text-lg py-1.5 rounded-full transition-colors cursor-pointer duration-100"
                    >
                      Admin dashboard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications slide-in panel (desktop only) */}      
      <NotificationsPanel
        open={panelOpen}
        onClose={handlePanelClose}
        onUnreadChange={handleUnreadChange}
      />
    </>
  );
}