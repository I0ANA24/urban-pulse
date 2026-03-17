"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Map, MessageCircle, User } from "lucide-react";
import Image from "next/image";

export default function NavBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/profile")) {
    return null;
  }

  return (
    <div className="h-[8vh] w-[calc(100vw-32px)] bg-white/40 border border-white/60 rounded-[18px] fixed bottom-4 flex justify-center items-center">
      <nav className="container h-full w-full flex justify-between items-center px-5">
        <Link href="/dashboard">
          <Home
            size={28}
            className="text-black cursor-pointer hover:scale-105 hover:text-white focus:text-white transition-all duration-200"
          />
        </Link>
        <Link href="/search">
          <Search
            size={28}
            className="text-black cursor-pointer hover:scale-105 hover:text-white focus:text-white transition-all duration-200"
          />
        </Link>
        <Link href="/map">
          <Map
            size={28}
            className="text-black cursor-pointer hover:scale-105 hover:text-white focus:text-white transition-all duration-200"
          />
        </Link>
        <Link href="/chat">
          <MessageCircle
            size={28}
            className="text-black cursor-pointer hover:scale-105 hover:text-white focus:text-white transition-all duration-200"
          />
        </Link>
        <Link href="/profile">
          <User
            size={28}
            className="text-black cursor-pointer hover:scale-105 hover:text-green-light focus:text-green-light transition-all duration-200"
          />
        </Link>
      </nav>
    </div>
  );
}
