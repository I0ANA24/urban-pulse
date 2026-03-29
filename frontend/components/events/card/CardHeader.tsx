import { MoreVertical, BadgeCheck, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CardHeaderProps {
  initials: string;
  name: string;
  date: string;
  isVerifiedUser?: boolean;
  isMyPost?: boolean;
  onDelete?: () => void;
  imageUrl: string | null;
}

export default function CardHeader({
  initials,
  name,
  date,
  isVerifiedUser,
  isMyPost,
  onDelete,
  imageUrl,
}: CardHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`w-full h-17.5 p-5 z-10 flex justify-between items-center bg-secondary rounded-4xl ${imageUrl ? "rounded-b-4xl" : "rounded-b-none"}`}
    >
      {/* image + name */}
      <div className="flex gap-4 justify-center items-center">
        <div className="w-10 h-10">
          <Image
            src="/profile.png"
            width={40}
            height={40}
            alt="profile_image"
            className="rounded-full"
          />
        </div>
        <div className="flex flex-col justify-center items-start">
          <div className="flex items-center">
            <p className="w-full font-bold">Niklaus</p>
            {isVerifiedUser && (
              <BadgeCheck
                size={18}
                className="text-green-light fill-green-light/20"
              />
            )}
          </div>
          <span className="text-white/40 text-xs">{date}</span>
        </div>
      </div>
      {/* menu */}
      <div className="relative flex justify-center items-center">
        {/* meniul dropdown pentru report */}
        {isMyPost ? (
          <button
            onClick={onDelete}
            className="p-1.5 bg-red-emergency/20 rounded-md transition-colors hover:bg-red-emergency/40 cursor-pointer"
          >
            <Trash2 size={18} className="text-red-emergency" />
          </button>
        ) : (
          <>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 transition-colors hover:text-white/70 cursor-pointer"
            >
              <MoreVertical size={22} className="text-white" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full bg-background border border-white/20 rounded-full overflow-hidden">
                <button
                  onClick={() => {
                    console.log("Report action triggered");
                    setShowMenu(false);
                  }}
                  className="w-full text-center px-6 py-2 text-red-emergency font-bold text-sm hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Report
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
