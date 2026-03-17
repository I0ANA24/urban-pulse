import {
  BarChart2,
  Bookmark,
  ChevronRight,
  Clock,
  LayoutGrid,
  Paintbrush,
  Pencil,
  Radar,
  Shield,
} from "lucide-react";
import Link from "next/link";

interface ProfileSettingsLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: "edit" | "myposts" | "personal" | "security" | "saved" | "preferences" | "quiet" | "distance";
}

export default function ProfileSettingsLink({
  text,
  ...restProps
}: ProfileSettingsLinkProps) {
  const content = {
    edit: {
      route: "./settings/edit",
      icon: Pencil,
      pageName: "Edit Profile",
    },
    myposts: {
      route: "./settings/myposts",
      icon: LayoutGrid,
      pageName: "My Posts",
    },
    personal: {
      route: "./settings/personal",
      icon: BarChart2,
      pageName: "Personal Info",
    },
    security: {
      route: "./settings/security",
      icon: Shield,
      pageName: "Security Data",
    },
    saved: {
      route: "./settings/saved",
      icon: Bookmark,
      pageName: "Saved Posts",
    },
    preferences: {
      route: "./settings/preferences",
      icon: Paintbrush,
      pageName: "Preferences",
    },
    quiet: {
      route: "./preferences/quiet",
      icon: Clock,
      pageName: "Quiet Hours",
    },
    distance: {
      route: "./preferences/distance",
      icon: Radar,
      pageName: "Distance Limit",
    }
  };

  const IconComponent = content[text].icon;

  return (
    <Link href={content[text].route} className="w-full">
      <button
        {...restProps}
        className="w-full h-14 bg-secondary rounded-full px-5 flex justify-between items-center cursor-pointer"
      >
        <div className="flex justify-center items-center gap-4">
          <IconComponent className="size-7" strokeWidth={2} />
          <span className="text-xl">{content[text].pageName}</span>
        </div>
        <ChevronRight className="size-7" />
      </button>
    </Link>
  );
}
