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
    <div className="h-[8vh] w-[calc(100vw-32px)] rounded-[18px] fixed bottom-4 flex justify-center items-center overflow-hidden">
      <Image
        src="/navbar.svg"
        alt="navbar"
        fill
        priority
        className="object-cover"
      />
      <nav className="container h-full w-full flex justify-between items-center px-5 relative">
        <Link href="/dashboard">
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
        <Link href="/map">
          <Map
            size={28}
            className="text-white cursor-pointer hover:text-black focus:text-white transition-all duration-200"
          />
        </Link>
        <Link href="/chat">
          <MessageCircle
            size={28}
            className="text-white cursor-pointer hover:text-black focus:text-white transition-all duration-200"
          />
        </Link>
        <Link href="/profile">
          <User
            size={28}
            className="text-white cursor-pointer hover:text-black focus:text-white transition-all duration-200"
          />
        </Link>
      </nav>
    </div>
  );
}
