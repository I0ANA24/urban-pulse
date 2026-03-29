"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import DonutChart from "@/components/admin/DonutChart";
import StatBar from "@/components/admin/StatBar";
import OverviewCard from "@/components/admin/OverviewCard";
import AddEventModal from "@/components/admin/AddEventModal";
import UrbanTitle from "@/components/ui/UrbanTitle";

const mockStats = {
  flaggedUsers: 10,
  flaggedContent: 3,
  mergeDuplicates: 4,
  totalTasks: 26,
  flaggedUsersPercent: 35,
  flaggedContentPercent: 45,
  resolvedPercent: 20,
};

const dailyOverview = {
  newUsers: 32,
  posts: 100,
  flaggedPosts: 3,
  flaggedUsers: 1,
};

const generalActivities = {
  posts: 1009,
  users: 78,
  unverifiedUsers: 34,
  verifiedUsers: 44,
};

export default function AdminDashboard() {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const donutSegments = [
    { value: mockStats.flaggedUsersPercent, color: "#FFF081" },
    { value: mockStats.flaggedContentPercent, color: "#A53A3A" },
    { value: mockStats.resolvedPercent, color: "#4ADE80" },
  ];

  const handleSaveEvent = (eventText: string) => {
    console.log("Event saved:", eventText);
  };

  return (
    <div className="w-full pb-[8vh]">
      <div className="w-full py-2 flex flex-col items-center gap-4 mb-4">
        <div className="h-[calc(15vh-24px)]" />

        <UrbanTitle />

        {/* Event button — wide, bluish */}
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
            centerText={`${mockStats.totalTasks} Tasks`}
            size={220}
            strokeWidth={32}
          />
        </div>

        {/* Percentage stats row */}
        <div className="w-full flex justify-between px-4">
          <StatBar
            label={"Flagged\nusers"}
            value={`${mockStats.flaggedUsersPercent}%`}
            color="#A53A3A"
            progress={mockStats.flaggedUsersPercent}
          />
          <StatBar
            label={"Flagged\ncontent"}
            value={`${mockStats.flaggedContentPercent}%`}
            color="#FFF081"
            progress={mockStats.flaggedContentPercent}
          />
          <StatBar
            label={"Resolved\ntasks"}
            value={`${mockStats.resolvedPercent}%`}
            color="#4ADE80"
            progress={mockStats.resolvedPercent}
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
            { bold: String(dailyOverview.newUsers), text: "new users" },
            { bold: String(dailyOverview.posts), text: "posts" },
            { bold: String(dailyOverview.flaggedPosts), text: "flagged posts" },
            { bold: String(dailyOverview.flaggedUsers), text: "flagged user" },
          ]}
        />

        {/* General Activities */}
        <OverviewCard
          title="General Activities"
          stats={[
            { bold: String(generalActivities.posts), text: "posts" },
            { bold: String(generalActivities.users), text: "users" },
            {
              bold: String(generalActivities.unverifiedUsers),
              text: "unverified users",
            },
            {
              bold: String(generalActivities.verifiedUsers),
              text: "verified users",
            },
          ]}
        />

        {/* Bottom spacing */}
        <div className="h-4" />

        {/* Add Event Modal */}
        <AddEventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSave={handleSaveEvent}
        />
      </div>
    </div>
  );
}
