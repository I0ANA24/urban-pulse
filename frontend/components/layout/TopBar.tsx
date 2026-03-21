import Image from "next/image";
import GoBackButton from "../ui/GoBackButton";
import ProfileRoundButton from "../ui/ProfileRoundButton";
import { Plus } from "lucide-react";

interface TopBarProps {
  back: boolean;
  notifications: boolean;
  settings: boolean;
  addPost?: boolean;
}

export default function TopBar({
  back,
  notifications,
  settings,
  addPost,
}: TopBarProps) {
  return (
    <div
      className={`flex ${back || addPost ? "justify-between" : "justify-end"} ${addPost ? "mb-[calc(15vh-78px)]" : ""} items-center`}
    >
      {back && (
        <GoBackButton>
          <Image
            src="/undo.svg"
            alt="go_back"
            width={69}
            height={49}
            className="-ml-2"
          />
        </GoBackButton>
      )}
      {addPost && (
        <ProfileRoundButton route="/addPost">
          <Plus width={47} height={30} strokeWidth={3} />
        </ProfileRoundButton>
      )}

      <div className="flex justify-center items-center gap-3">
        {notifications && (
          <ProfileRoundButton route="">
            <Image
              src="/notifications.svg"
              alt="go_back"
              width={40}
              height={25}
            />
          </ProfileRoundButton>
        )}
        {settings && (
          <ProfileRoundButton route="./profile/settings">
            <Image src="/settings.svg" alt="go_back" width={47} height={30} />
          </ProfileRoundButton>
        )}
      </div>
    </div>
  );
}
