"use client";

import LeftSidebar from "@/components/layout/LeftSidebar";
import Link from "next/link";
import {
  Settings,
  Pencil,
  Bookmark,
  BarChart2,
  Shield,
  LayoutGrid,
  Paintbrush,
  Trash2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";

const settingsLinks = [
  { href: "/profile/settings/edit", icon: Pencil, label: "Edit profile" },
  { href: "/profile/settings/saved", icon: Bookmark, label: "Saved posts" },
  {
    href: "/profile/settings/personal",
    icon: BarChart2,
    label: "Personal info",
  },
  { href: "/profile/settings/security", icon: Shield, label: "Security Data" },
  { href: "/profile/settings/myposts", icon: LayoutGrid, label: "My posts" },
  {
    href: "/profile/settings/preferences",
    icon: Paintbrush,
    label: "Preferences",
  },
];

function SettingsNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("process.env.NEXT_PUBLIC_API_URL/api/user", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0";
      router.push("/");
    } catch { setDeleting(false); }
  };

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:flex-1 gap-4 items-center">
        <div className="flex items-center justify-center gap-3 mb-2 w-full">
          <Settings size={22} className="text-white" />
          <span className="text-2xl font-semibold text-white font-montagu">Settings</span>
        </div>
        <nav className="flex flex-col w-full gap-2">
          {settingsLinks.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center w-full gap-6 transition-opacity hover:bg-[#131313] py-4 pl-6 rounded-xl ${isActive ? "bg-[#131313]" : ""}`}
              >
                <Icon size={26} className="text-white shrink-0" />
                <span
                  className={`text-xl text-white ${
                    isActive ? "font-bold" : "font-normal"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="w-full h-px bg-white/10 mt-2" />
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center w-full gap-6 py-4 pl-6 rounded-xl hover:bg-[#131313] transition-colors cursor-pointer text-red-emergency"
        >
          <Trash2 size={26} className="shrink-0" />
          <span className="text-xl font-normal">Delete Account</span>
        </button>
      </aside>
      <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDeleteAccount} icon={<Trash2 />} title="Delete account" boldText="delete your account" loading={deleting} />
    </>
  );
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full pb-[8vh] lg:pb-0 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
      <div className="lg:flex lg:gap-8 xl:gap-14 lg:items-stretch lg:h-full lg:overflow-hidden">
        <LeftSidebar />
        <div
          className="lg:flex-2 max-w-190 lg:h-full lg:overflow-y-auto lg:min-h-0"
          style={{ scrollbarWidth: "none" }}
        >
          {children}
        </div>
        <SettingsNav />
      </div>
    </div>
  );
}
