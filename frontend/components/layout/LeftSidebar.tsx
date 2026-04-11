"use client";

import Link from "next/link";
import { Plus, Search, Map, MessageCircle, PawPrint } from "lucide-react";
import { usePathname } from "next/navigation";

function SidebarNavItem({
  href,
  icon,
  label,
  isGreen,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isGreen?: boolean;
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
          background: isGreen ? "#001406" : "#1F1F1F",
          boxShadow:
            "inset 0.7px 0.7px 0.7px rgba(255,255,255,0.7), inset 1.4px 1.4px 6.4px rgba(255,255,255,0.4), inset -0.7px -0.7px 0.7px rgba(255,255,255,0.3)",
          filter: "drop-shadow(0px 4px 5.7px rgba(42,42,42,0.36))",
        }}
      >
        {icon}
      </div>

      <span
        className={`text-2xl tracking-tight ${
          isGreen ? "text-green-light" : "text-white"
        } ${isActive ? "font-bold" : "font-normal"}`}
      >
        {label}
      </span>
    </Link>
  );
}

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:flex-1">
      <SidebarNavItem
        href="/addPost"
        icon={<Plus size={26} strokeWidth={2.5} className="text-white" />}
        label="Add Post"
        isGreen
        isActive={pathname === "/addPost" || pathname.startsWith("/addPost/")}
      />

      <div className="h-14" />

      <div className="flex flex-col gap-2">
        <SidebarNavItem
          href="/search"
          icon={<Search size={24} className="text-white" />}
          label="Search"
          isActive={pathname === "/search" || pathname.startsWith("/search/")}
        />
        <SidebarNavItem
          href="/map"
          icon={<Map size={24} className="text-white" />}
          label="Map"
          isActive={pathname === "/map" || pathname.startsWith("/map/")}
        />
        <SidebarNavItem
          href="/chat"
          icon={<MessageCircle size={24} className="text-white" />}
          label="Chat"
          isActive={pathname === "/chat" || pathname.startsWith("/chat/")}
        />
      </div>

      <div className="h-14" />

      <Link
        href={"/pets"}
        className={`flex items-center gap-5 pl-6 py-4 rounded-xl transition-colors hover:bg-[#131313] ${pathname === "/pets" || pathname.startsWith("/pets/") ? "bg-[#131313]" : ""}`}
      >
        <div className="size-11 rounded-full bg-green-light text-black flex justify-center items-center font-bold">
          <PawPrint size={24} strokeWidth={2} />
        </div>
        <span
          className={`text-2xl tracking-tight ${
            pathname === "/pets" || pathname.startsWith("/pets/") ? "font-bold" : "font-normal"
          }`}
        >
          Pets
        </span>
      </Link>
    </aside>
  );
}
