"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Map, MessageCircle, User } from "lucide-react";
import Image from "next/image";
import BannedUsersIcon from "../icons/navbar/BannedUsersIcon";
import { useUser } from "@/context/UserContext";

export default function NavBar() {
  const pathname = usePathname();
  const { isAdmin } = useUser();

  if (pathname.startsWith("/profile") || pathname.startsWith("/global-chat") || pathname.startsWith("/chat-conversation")) {
  return null;
}

  return (
    <div
      className="container fixed bottom-4 left-1/2 -translate-x-1/2 h-15 w-[calc(100vw-32px)] rounded-3xl flex justify-center items-center overflow-hidden lg:hidden bg-zinc-950/20 backdrop-blur border border-white/20 z-50"
    >
      <Image
        src="/navbar.svg"
        alt="navbar"
        fill
        priority
        className="object-cover opacity-100"
      />
      <nav className="container h-full w-full flex justify-between items-center px-8 relative z-10">
        <Link href={isAdmin ? "/admin" : "/dashboard"}>
          <Home
            size={28}
            className="text-white cursor-pointer hover:text-black focus:text-white transition-all duration-200"
          />
        </Link>
        <Link href="/search">
          <Search
            size={28}
            className="text-white cursor-pointer hover:text-black focus:text-white transition-all duration-200"
          />
        </Link>
        {!isAdmin && (
          <Link href="/map">
            <Map
              size={28}
              className="text-white cursor-pointer hover:text-black focus:text-white transition-all duration-200"
            />
          </Link>
        )}
        {!isAdmin && (
          <Link href="/chat">
            <MessageCircle
              size={28}
              className="text-white cursor-pointer hover:text-black focus:text-white transition-all duration-200"
            />
          </Link>
        )}
        {isAdmin && (
          <Link href="/admin/banned">
            <BannedUsersIcon
              width={47}
              className="transition-all duration-200 hover:brightness-0 cursor-pointer"
            />
          </Link>
        )}
        <Link href={isAdmin ? "/admin/profile" : "/profile"}>
          <User
            size={28}
            className="text-white cursor-pointer hover:text-black focus:text-white transition-all duration-200"
          />
        </Link>
      </nav>
    </div>
  );
}
