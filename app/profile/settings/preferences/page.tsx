import ProfilePageTemplate from "@/components/ui/profile/ProfilePageTemplate";
import ProfileSettingsLink from "@/components/ui/profile/ProfileSettingsLink";
import ThemeSelector from "@/components/ui/profile/ThemeSelector";

export default function PreferencesPage() {
  return (
    <ProfilePageTemplate title="Preferences">
      <div className="w-full flex flex-col justify-center items-center gap-12">
        <section className="w-full">
          <h2 className="text-lg">Notifications & Alerts</h2>
          <div className="w-full h-px bg-[#383838] my-2 mb-4"></div>
          <div className="flex flex-col justify-center items-center gap-3 mt-5">
            <ProfileSettingsLink text="quiet" />
            <ProfileSettingsLink text="distance" />
          </div>
        </section>
        <section className="w-full">
          <h2 className="text-lg">App Interface</h2>
          <div className="w-full h-px bg-[#383838] my-2 mb-4"></div>
          <div className="flex flex-col justify-center items-center gap-3 mt-5">
            <ThemeSelector />
          </div>
        </section>
      </div>
    </ProfilePageTemplate>
  );
}
