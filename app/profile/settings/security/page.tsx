import HorizontalCard from "@/components/profile/HorizontalCard";
import ProfilePageTemplate from "@/components/profile/ProfilePageTemplate";

export default function SecurityPage() {
  return (
    <ProfilePageTemplate title="Security Data">
      <div className="w-full flex flex-col gap-4">
        <HorizontalCard title="Email" type="email" placeholder="frantioana507@gmail.com" />
        <HorizontalCard
          title="Password"
          type="password"
          placeholder=""
        />
      </div>
    </ProfilePageTemplate>
  );
}
