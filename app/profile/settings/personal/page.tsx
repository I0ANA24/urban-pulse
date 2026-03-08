import HorizontalCard from "@/components/ui/profile/HorizontalCard";
import ProfilePageTemplate from "@/components/ui/profile/ProfilePageTemplate";

export default function PersonalInfoPage() {
  return (
    <ProfilePageTemplate title="Personal Info">
      <div className="w-full flex flex-col gap-8">
        <HorizontalCard title="Phone Number" placeholder="+40765892376" />
        <div className="w-full flex flex-col justify-center items-center gap-4">
          <HorizontalCard title="Address" placeholder="Baskerville, Henry St, no. 9" />
          <button className="bg-green-light text-black w-55 h-10 rounded-[15px] cursor-pointer">Localize me</button>
        </div>
      </div>
    </ProfilePageTemplate>
  );
}
