import ProfileSettingsLink from "@/components/ui/profile/ProfileSettingsLink";
import { ChevronRight, LogOut, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Settings() {
  return (
    <>
      <div className="w-full h-full flex flex-col items-center gap-6 animate-fade-up">
        <div className="flex flex-col justify-center items-center gap-3">
          <div className="w-full flex justify-center items-center">
            <Image
              src="/profile.png"
              width={186}
              height={175}
              alt="profile_picture"
            />
          </div>
          <h1 className="text-2xl font-montagu font-bold text-center leading-[1.15]">
            Greta
            <br />
            Bennett
          </h1>
        </div>

        <div className="w-full flex flex-col justify-center items-center gap-3 mb-10">
          <ProfileSettingsLink text="edit" />
          <ProfileSettingsLink text="myposts" />
          <ProfileSettingsLink text="personal" />
          <ProfileSettingsLink text="security" />
          <ProfileSettingsLink text="saved" />
          <ProfileSettingsLink text="preferences" />
        </div>

        <div className="w-full h-px bg-[#383838] my-2 -mb-1"></div>

        <div className="w-full flex flex-col justify-center items-center gap-3 mb-10">
          <Link href="/" className="w-full">
            <button className="w-full h-14 bg-secondary rounded-full px-5 flex justify-between items-center cursor-pointer">
              <div className="flex justify-center items-center gap-4">
                <LogOut className="size-7 text-red-emergency" strokeWidth={2} />
                <span className="text-xl font-bold text-red-emergency">
                  Log Out
                </span>
              </div>
              <ChevronRight className="size-7 text-red-emergency font-bold" />
            </button>
          </Link>

          <Link href="/" className="w-full">
            <button className="w-full h-14 bg-secondary rounded-full px-5 flex justify-between items-center cursor-pointer">
              <div className="flex justify-center items-center gap-4">
                <Trash2 className="size-7 text-red-emergency" strokeWidth={2} />
                <span className="text-xl font-bold text-red-emergency">
                  Delete Account
                </span>
              </div>
              <ChevronRight className="size-7 text-red-emergency font-bold" />
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
