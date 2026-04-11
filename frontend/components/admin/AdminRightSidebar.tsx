"use client";

import { useState, useEffect } from "react";
import OverviewCard from "@/components/admin/OverviewCard";

interface AdminStats {
  dailyNewUsers: number;
  dailyPosts: number;
  dailyFlaggedPosts: number;
  dailyFlaggedUsers: number;
  totalPosts: number;
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
}

export default function AdminRightSidebar() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5248/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <aside className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-4">
      <OverviewCard
        title="Daily App Overview"
        stats={[
          { bold: String(stats?.dailyNewUsers ?? 0), text: "new users" },
          { bold: String(stats?.dailyPosts ?? 0), text: "posts" },
          { bold: String(stats?.dailyFlaggedPosts ?? 0), text: "flagged posts" },
          { bold: String(stats?.dailyFlaggedUsers ?? 0), text: "flagged users" },
        ]}
      />
      <OverviewCard
        title="General Activities"
        stats={[
          { bold: String(stats?.totalPosts ?? 0), text: "posts" },
          { bold: String(stats?.totalUsers ?? 0), text: "users" },
          { bold: String(stats?.unverifiedUsers ?? 0), text: "unverified users" },
          { bold: String(stats?.verifiedUsers ?? 0), text: "verified users" },
        ]}
      />
    </aside>
  );
}
