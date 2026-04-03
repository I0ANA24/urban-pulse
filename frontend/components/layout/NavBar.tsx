"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Map, MessageCircle, User } from "lucide-react";
import Image from "next/image";
import BannedUsersIcon from "../icons/navbar/BannedUsersIcon";

export default function NavBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/profile")) {
    return null;
  }

  const isAdmin = false;

  return (
    <div className="h-[8vh] w-[calc(100vw-32px)] rounded-[18px] fixed bottom-4 left-4 flex justify-center items-center overflow-hidden lg:hidden">
      <Image
        src="/navbar.svg"
        alt="navbar"
        fill
        priority
        className="object-cover"
      />
      <nav className="container h-full w-full flex justify-between items-center px-5 relative">
        <Link href={`${isAdmin ? "/admin" : "/dashboard"}`}>
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
        <Link href={`${isAdmin ? "/admin/profile" : "/profile"}`}>
          <User
            size={28}
            className="text-white cursor-pointer hover:text-black focus:text-white transition-all duration-200"
          />
        </Link>
      </nav>
    </div>
  );
}