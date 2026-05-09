"use client";

import Link from "next/link";
import { Search, UserX, ClipboardList, AlertTriangle } from "lucide-react";
import { usePathname } from "next/navigation";

function AdminNavItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-5 pl-6 py-4 rounded-xl transition-colors hover:bg-[#131313] ${isActive ? "bg-[#131313]" : ""}`}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "#1F1F1F",
          boxShadow:
            "inset 0.7px 0.7px 0.7px rgba(255,255,255,0.7), inset 1.4px 1.4px 6.4px rgba(255,255,255,0.4), inset -0.7px -0.7px 0.7px rgba(255,255,255,0.3)",
          filter: "drop-shadow(0px 4px 5.7px rgba(42,42,42,0.36))",
        }}
      >
        {icon}
      </div>
      <span
        className={`text-2xl tracking-tight text-white ${isActive ? "font-bold" : "font-normal"}`}
      >
        {label}
      </span>
    </Link>
  );
}

export default function AdminLeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:flex-1">
      <div className="flex flex-col gap-2">
        <AdminNavItem
          href="/search"
          icon={<Search size={24} className="text-white" />}
          label="Search"
          isActive={pathname === "/search" || pathname.startsWith("/search/")}
        />
        <AdminNavItem
          href="/admin/banned"
          icon={<UserX size={24} className="text-white" />}
          label="Banned users"
          isActive={
            pathname === "/admin/banned" ||
            pathname.startsWith("/admin/banned/")
          }
        />
        <AdminNavItem
          href="/admin/tasks"
          icon={<ClipboardList size={24} className="text-white" />}
          label="Tasks"
          isActive={
            pathname === "/admin/tasks" || pathname.startsWith("/admin/tasks/")
          }
        />
      </div>

      <div className="h-14" />

      <div className="px-2">
        <Link
          href="/admin/crisis"
          className="w-full bg-red-emergency/15 border border-red-emergency/30 rounded-2xl px-8 h-30 flex justify-between items-center gap-1 cursor-pointer hover:bg-red-emergency/25 transition-colors"
        >
          <span className="text-red-emergency font-bold text-3xl">Crisis</span>
          <AlertTriangle size={40} strokeWidth={2} className="text-red-emergency" />
        </Link>
      </div>
    </aside>
  );
}
