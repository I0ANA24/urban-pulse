"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, MessageCircle, User } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard/profile")) {
    return null;
  }

  return (
    <div className="h-[8vh] w-full bg-black fixed bottom-0">
      <nav className="w-full h-full flex justify-between items-center p-8">
        <Link href="/dashboard">
          <Home
            size={28}
            className="text-white cursor-pointer hover:scale-105 hover:text-green-light focus:text-green-light transition-all duration-200"
          />
        </Link>
        <Link href="/dashboard/map">
          <Map
            size={28}
            className="text-white cursor-pointer hover:scale-105 hover:text-green-light focus:text-green-light transition-all duration-200"
          />
        </Link>
        <Link href="/dashboard/chat">
          <MessageCircle
            size={28}
            className="text-white cursor-pointer hover:scale-105 hover:text-green-light focus:text-green-light transition-all duration-200"
          />
        </Link>
        <Link href="/dashboard/profile">
          <User
            size={28}
            className="text-white cursor-pointer hover:scale-105 hover:text-green-light focus:text-green-light transition-all duration-200"
          />
        </Link>
      </nav>
    </div>
  );
}