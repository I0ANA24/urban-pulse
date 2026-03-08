import BSTCard from "@/components/ui/profile/BSTCard";
import EditSkillsOrTR from "@/components/ui/profile/EditSkillsOrTR";
import HorizontalCard from "@/components/ui/profile/HorizontalCard";
import Image from "next/image";

export default function EditProfile() {
  return (
    <>
      <div className="w-full h-full flex flex-col items-center gap-5">
        <div className="w-full flex justify-center items-center">
          <Image
            src="/profile.png"
            width={93}
            height={91}
            alt="profile_picture"
          />
        </div>

        <h1 className="text-2xl font-montagu font-bold text-center leading-[1.15]">
          Edit profile
        </h1>

        <HorizontalCard title="Name" placeholder="Enter your name..." />
        <BSTCard title="Bio">
          <textarea
            placeholder="Tell us something about you..."
            className="outline-none resize-none h-30"
          />
        </BSTCard>
        <BSTCard title="Skills">
          <EditSkillsOrTR add="Skills" />
        </BSTCard>
        <BSTCard title="Tools & Resources">
          <EditSkillsOrTR add="TR" />
        </BSTCard>
      </div>
    </>
  );
}
