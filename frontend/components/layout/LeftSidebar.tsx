"use client";

import Link from "next/link";
import { Plus, Search, Map, MessageCircle } from "lucide-react";

function SidebarNavItem({
  href,
  icon,
  label,
  isGreen,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isGreen?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-5 h-11 transition-opacity hover:opacity-80"
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: isGreen ? "#001406" : "#1F1F1F",
          boxShadow:
            "inset 0.7px 0.7px 0.7px rgba(255,255,255,0.7), inset 1.4px 1.4px 6.4px rgba(255,255,255,0.4), inset -0.7px -0.7px 0.7px rgba(255,255,255,0.3)",
          filter: "drop-shadow(0px 4px 5.7px rgba(42,42,42,0.36))",
        }}
      >
        {icon}
      </div>

      <span
        className={`text-2xl font-normal tracking-tight ${
          isGreen ? "text-[#4ADE80]" : "text-white"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export default function LeftSidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:flex-1">
      <SidebarNavItem
        href="/addPost"
        icon={<Plus size={26} strokeWidth={2.5} className="text-white" />}
        label="Add Post"
        isGreen
      />

      <div className="h-14" />

      <div className="flex flex-col gap-5">
        <SidebarNavItem
          href="/search"
          icon={<Search size={24} className="text-white" />}
          label="Search"
        />
        <SidebarNavItem
          href="/map"
          icon={<Map size={24} className="text-white" />}
          label="Map"
        />
        <SidebarNavItem
          href="/chat"
          icon={<MessageCircle size={24} className="text-white" />}
          label="Chat"
        />
      </div>
    </aside>
  );
}