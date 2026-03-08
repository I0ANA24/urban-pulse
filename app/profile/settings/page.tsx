import ProfileSettingsLink from "@/components/ui/profile/ProfileSettingsLink";
import Image from "next/image";

export default function Settings() {
  return (
    <>
      <div className="w-full h-full flex flex-col items-center gap-6">
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
        
        <div className="w-full flex flex-col justify-center items-center gap-3">
          <ProfileSettingsLink text="edit" />
          <ProfileSettingsLink text="personal" />
          <ProfileSettingsLink text="security" />
          <ProfileSettingsLink text="saved" />
          <ProfileSettingsLink text="preferences" />
        </div>
      </div>
    </>
  );
}
