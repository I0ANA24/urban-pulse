import Link from "next/link";
import { Home, Map, MessageCircle, User } from "lucide-react";

export default function NavBar() {
  return (
    <div className="h-[8vh] w-full bg-black absolute bottom-0">
      <nav className="w-full h-full flex justify-around items-center p-4">
        <Link href="/dashboard">
          <Home
            size={28}
            className="text-white cursor-pointer hover:scale-105 hover:text-green-400 transition-all duration-300"
          />
        </Link>
        <Link href="/dashboard/map">
          <Map
            size={28}
            className="text-white cursor-pointer hover:scale-105 hover:text-green-400 transition-all duration-300"
          />
        </Link>
        <Link href="/dashboard/chat">
          <MessageCircle
            size={28}
            className="text-white cursor-pointer hover:scale-105 hover:text-green-400 transition-all duration-300"
          />
        </Link>
        <Link href="/dashboard/profile">
          <User
            size={28}
            className="text-white cursor-pointer hover:scale-105 hover:text-green-400 transition-all duration-300"
          />
        </Link>
      </nav>
    </div>
  );
}