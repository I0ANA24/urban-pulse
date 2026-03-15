import HorizontalCard from "@/components/profile/HorizontalCard";
import ProfilePageTemplate from "@/components/profile/ProfilePageTemplate";

export default function PersonalInfoPage() {
  return (
    <ProfilePageTemplate title="Personal Info">
      <div className="w-full flex flex-col gap-8">
        <HorizontalCard title="Phone Number" type="tel" placeholder="+40765892376" />
        <div className="w-full flex flex-col justify-center items-center gap-4">
          <HorizontalCard title="Address" type="text" placeholder="Baskerville, Henry St, no. 9" />
          <button className="bg-green-light text-black font-medium
           w-55 h-10 rounded-[15px] cursor-pointer">Localize me</button>
        </div>
      </div>
    </ProfilePageTemplate>
  );
}
