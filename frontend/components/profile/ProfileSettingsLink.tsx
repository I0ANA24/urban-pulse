import {
  BarChart2,
  Bookmark,
  ChevronRight,
  Clock,
  LayoutGrid,
  LogOut,
  LucideIcon,
  Paintbrush,
  Pencil,
  Radar,
  Shield,
  Trash2,
  UserCog,
} from "lucide-react";
import Link from "next/link";

interface ProfileSettingsLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text:
    | "edit"
    | "myposts"
    | "personal"
    | "security"
    | "saved"
    | "preferences"
    | "quiet"
    | "distance"
    | "admin"
    | "logout"
    | "delete";
}

interface ContentConfig {
  route: string;
  icon: LucideIcon;
  pageName: string;
  bgColor?: string;
}

export default function ProfileSettingsLink({
  text,
  ...restProps
}: ProfileSettingsLinkProps) {
  const content: Record<ProfileSettingsLinkProps["text"], ContentConfig> = {
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
    },
    admin: {
      route: "../admin",
      icon: UserCog,
      pageName: "Admin Panel",
      bgColor: "bg-red-emergency",
    },
    logout: {
      route: "#",
      icon: LogOut,
      pageName: "Log Out",
    },
    delete: {
      route: "#",
      icon: Trash2,
      pageName: "Delete Account",
    },
  };

  const IconComponent = content[text].icon;

  return (
    <Link href={content[text].route} className="w-full">
      <button
        {...restProps}
        className={`w-full h-13 rounded-full px-5 flex justify-between items-center cursor-pointer ${content[text].bgColor ?? "bg-secondary"}`}
      >
        <div className="flex justify-center items-center gap-4">
          <IconComponent className="size-6" strokeWidth={2} />
          <span className="text-lg">{content[text].pageName}</span>
        </div>
        <ChevronRight className="size-6" />
      </button>
    </Link>
  );
}
