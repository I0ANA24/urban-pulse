"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import DonutChart from "@/components/admin/DonutChart";
import StatBar from "@/components/admin/StatBar";
import OverviewCard from "@/components/admin/OverviewCard";
import AddEventModal from "@/components/admin/AddEventModal";
import UrbanTitle from "@/components/ui/UrbanTitle";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";
import { useSevereWeather } from "@/context/SevereWeatherContext";

const API = "http://localhost:5248";

interface AdminStats {
  resolvedTasks: number;
  dailyNewUsers: number;
  dailyPosts: number;
  dailyFlaggedPosts: number;
  dailyFlaggedUsers: number;
  totalPosts: number;
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  flaggedUsersCount: number;
  flaggedContentCount: number;
  mergeDuplicatesCount: number;
}

function MobileSafetyPortal({ onClick }: { onClick: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed left-0 right-0 z-200 px-4 pb-2 bg-background transition-[top] duration-300 ease-out lg:hidden"
      style={{ top: scrolled ? 0 : "12vh" }}
    >
      <div className="relative w-full mt-4">
        <div className="absolute inset-0 bg-red-emergency rounded-2xl opacity-30" />
        <div
          onClick={onClick}
          className="relative w-full bg-red-emergency rounded-2xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📌</span>
            <div>
              <p className="text-white font-bold text-sm">Safety Check-in</p>
              <p className="text-white/60 text-xs">Tap to let neighbors know you&apos;re safe</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AdminDashboard() {
  const [isMobileEventModalOpen, setIsMobileEventModalOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const { isSevereWeather } = useSevereWeather();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const flaggedUsers = stats?.flaggedUsersCount ?? 0;
  const flaggedContent = stats?.flaggedContentCount ?? 0;
  const mergeDuplicates = stats?.mergeDuplicatesCount ?? 0;
  const total = flaggedUsers + flaggedContent + mergeDuplicates;

  const flaggedUsersPercent = total > 0 ? Math.round((flaggedUsers / total) * 100) : 0;
  const flaggedContentPercent = total > 0 ? Math.round((flaggedContent / total) * 100) : 0;
  const mergeDuplicatesPercent = total > 0 ? 100 - flaggedUsersPercent - flaggedContentPercent : 0;

  const donutSegments = [
    { value: flaggedUsersPercent, color: "#A53A3A" },
    { value: flaggedContentPercent, color: "#5B8DEF" },
    { value: mergeDuplicatesPercent, color: "#FFF081" },
  ];

  const dailyOverviewStats = [
    { bold: String(stats?.dailyNewUsers ?? 0), text: "new users" },
    { bold: String(stats?.dailyPosts ?? 0), text: "posts" },
    { bold: String(stats?.dailyFlaggedPosts ?? 0), text: "flagged posts" },
    { bold: String(stats?.dailyFlaggedUsers ?? 0), text: "flagged users" },
  ];

  const generalActivityStats = [
    { bold: String(stats?.totalPosts ?? 0), text: "posts" },
    { bold: String(stats?.totalUsers ?? 0), text: "users" },
    { bold: String(stats?.unverifiedUsers ?? 0), text: "unverified users" },
    { bold: String(stats?.verifiedUsers ?? 0), text: "verified users" },
  ];

  return (
    <ThreeColumnLayoutAdmin>
      {/* Mobile: portal în document.body — fixed cu top dinamic bazat pe scroll */}
      {isSevereWeather && (
        <MobileSafetyPortal onClick={() => router.push("/severe-chat")} />
      )}
      {/* Spacer care împinge conținutul sub poziția inițială a bannerului */}
      {isSevereWeather && <div className="lg:hidden h-[calc(5vh)]" />}

      {/* Desktop: sticky în feed-scroll, deasupra conținutului */}
      {isSevereWeather && (
        <div className="hidden lg:block sticky top-0 z-50 w-full pt-2 pb-1 bg-background">
          <div className="relative w-full">
            <div className="absolute inset-0 bg-red-emergency rounded-2xl opacity-30" />
            <div
              onClick={() => router.push("/severe-chat")}
              className="relative w-full bg-red-emergency rounded-2xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📌</span>
                <div>
                  <p className="text-white font-bold text-sm">Safety Check-in</p>
                  <p className="text-white/60 text-xs">Tap to let neighbors know you&apos;re safe</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full py-2 flex flex-col items-center gap-4 mb-4 mt-4">

        {/* Mobile only: spacer + title */}
        <div className="lg:hidden h-[calc(15vh-24px)]" />
        <div className="lg:hidden">
          <UrbanTitle />
        </div>

        {/* Mobile only: Event button */}
        <div className="lg:hidden w-full h-27.5 flex p-4 justify-center items-center relative">
          <Image
            src="/rectangle.svg"
            width={360}
            height={120}
            alt="Design Image"
            priority
            className="absolute object-cover z-0 top-0 w-full h-full rounded-3xl"
          />
          <div className="w-full h-18 flex justify-center relative z-10">
            <button
              onClick={() => setIsMobileEventModalOpen(true)}
              className="w-full bg-weather-nice rounded-2xl px-6 py-3.5 flex items-center justify-between transition-transform active:scale-[0.97] cursor-pointer"
            >
              <span className="text-white font-bold text-xl">Event</span>
              <Plus size={30} strokeWidth={3} className="text-white" />
            </button>
          </div>
        </div>

        {/* Donut chart */}
        <div className="flex justify-center py-2">
          <DonutChart
            segments={donutSegments}
            centerText={`${total} Tasks`}
            size={220}
            strokeWidth={32}
          />
        </div>

        {/* Percentage stats row */}
        <div className="w-full flex justify-between px-4">
          <StatBar
            label={"Flagged\nusers"}
            value={`${flaggedUsersPercent}%`}
            color="#A53A3A"
            progress={flaggedUsersPercent}
          />
          <StatBar
            label={"Flagged\ncontent"}
            value={`${flaggedContentPercent}%`}
            color="#5B8DEF"
            progress={flaggedContentPercent}
          />
          <StatBar
            label={"Merge\nduplicates"}
            value={`${mergeDuplicatesPercent}%`}
            color="#FFF081"
            progress={mergeDuplicatesPercent}
          />
        </div>

        {/* Resolve button */}
        <div className="flex justify-center py-6">
          <Link href="/admin/tasks">
            <button className="bg-red-emergency hover:bg-red-emergency/90 text-white font-bold text-xl px-10 py-3 rounded-[20] transition-all active:scale-95 cursor-pointer shadow-md shadow-neutral-700">
              Resolve
            </button>
          </Link>
        </div>

        {/* OverviewCards — mobile only (desktop shows them in AdminRightSidebar) */}
        <div className="lg:hidden w-full flex flex-col gap-4">
          <OverviewCard title="Daily App Overview" stats={dailyOverviewStats} />
          <OverviewCard title="General Activities" stats={generalActivityStats} />
        </div>

        <div className="h-4" />
      </div>

      {/* Mobile event modal */}
      <AddEventModal
        isOpen={isMobileEventModalOpen}
        onClose={() => setIsMobileEventModalOpen(false)}
        onSave={(text) => console.log("Event saved:", text)}
      />
    </ThreeColumnLayoutAdmin>
  );
}
