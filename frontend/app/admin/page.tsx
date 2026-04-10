"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import DonutChart from "@/components/admin/DonutChart";
import StatBar from "@/components/admin/StatBar";
import OverviewCard from "@/components/admin/OverviewCard";
import AddEventModal from "@/components/admin/AddEventModal";
import UrbanTitle from "@/components/ui/UrbanTitle";

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

export default function AdminDashboard() {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);

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

  const handleSaveEvent = (eventText: string) => {
    console.log("Event saved:", eventText);
  };

  return (
    <div className="w-full pb-[8vh]">
      <div className="w-full py-2 flex flex-col items-center gap-4 mb-4">
        <div className="h-[calc(15vh-24px)]" />

        <UrbanTitle />

        {/* Event button */}
        <div className="w-full h-27.5 flex p-4 justify-center items-center relative">
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
              onClick={() => setIsEventModalOpen(true)}
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

        {/* Daily App Overview */}
        <OverviewCard
          title="Daily App Overview"
          stats={[
            { bold: String(stats?.dailyNewUsers ?? 0), text: "new users" },
            { bold: String(stats?.dailyPosts ?? 0), text: "posts" },
            { bold: String(stats?.dailyFlaggedPosts ?? 0), text: "flagged posts" },
            { bold: String(stats?.dailyFlaggedUsers ?? 0), text: "flagged users" },
          ]}
        />

        {/* General Activities */}
        <OverviewCard
          title="General Activities"
          stats={[
            { bold: String(stats?.totalPosts ?? 0), text: "posts" },
            { bold: String(stats?.totalUsers ?? 0), text: "users" },
            { bold: String(stats?.unverifiedUsers ?? 0), text: "unverified users" },
            { bold: String(stats?.verifiedUsers ?? 0), text: "verified users" },
          ]}
        />

        <div className="h-4" />

        <AddEventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSave={handleSaveEvent}
        />
      </div>
    </div>
  );
}