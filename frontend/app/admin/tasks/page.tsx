"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

const API = "http://localhost:5248";

interface TaskStats {
  flaggedUsersCount: number;
  flaggedContentCount: number;
  mergeDuplicatesCount: number;
}

export default function AdminTasksPage() {
  const router = useRouter();
  const [stats, setStats] = useState<TaskStats | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const tasks = [
    {
      id: "flagged-users",
      title: "Flagged users",
      subtitle: `${stats?.flaggedUsersCount ?? "0"} users`,
      href: "/admin/tasks/flagged-users",
      bgColor: "bg-red-emergency",
      textColor: "text-white",
      subtitleColor: "text-white",
      chevronColor: "text-white",
    },
    {
      id: "flagged-content",
      title: "Flagged content",
      subtitle: `${stats?.flaggedContentCount ?? "0"} posts`,
      href: "/admin/tasks/flagged-content",
      bgColor: "bg-blue",
      textColor: "text-black",
      subtitleColor: "text-black",
      chevronColor: "text-black",
    },
    {
      id: "merge-duplicates",
      title: "Merge duplicates",
      subtitle: `${stats?.mergeDuplicatesCount ?? "0"} duplicates`,
      href: "/admin/tasks/merge-duplicates",
      bgColor: "bg-yellow-primary",
      textColor: "text-black",
      subtitleColor: "text-black",
      chevronColor: "text-black",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center relative">
        <button
          onClick={() => router.back()}
          className="cursor-pointer hover:scale-105 active:scale-95 z-10"
        >
          <Image
            src="/undo.svg"
            alt="go_back"
            width={69}
            height={49}
            className="-ml-2"
          />
        </button>

        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <h1 className="text-white font-bold text-xl">Tasks</h1>
          <span className="w-2.5 h-2.5 rounded-full bg-red-emergency" />
        </div>
      </div>

      {/* Task cards */}
      <div className="flex flex-col gap-6 mt-2">
        {tasks.map((task) => (
          <Link key={task.id} href={task.href}>
            <div
              className={`${task.bgColor} w-full rounded-[20] p-8 flex items-center justify-between transition-transform active:scale-[0.98] cursor-pointer h-34`}
            >
              <div className="flex flex-col h-full justify-between gap-1.5">
                <h2 className={`${task.textColor} font-bold text-2xl`}>
                  {task.title}
                </h2>
                <p className={`${task.subtitleColor} text-base`}>
                  {task.subtitle}
                </p>
              </div>

              <ChevronRight className={`size-12 -mr-4 ${task.chevronColor}`} strokeWidth={1.5} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}