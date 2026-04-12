import Container from "@/components/layout/Container";
import TopBar from "@/components/layout/TopBar";
import GoBackButton from "@/components/ui/GoBackButton";
import ProfileRoundButton from "@/components/ui/ProfileRoundButton";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export default function PetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      {/* Mobile header */}
      <div className="flex lg:hidden items-center justify-between mb-6">
        <GoBackButton />
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-13.5 h-13.5 rounded-full bg-[#1F1F1F] shadow-[0_4px_4px_rgba(0,0,0,0.25),inset_0_0_5px_rgba(255,255,255,0.4)] border border-white/50">
            <Sparkles size={22} className="text-white" />
          </div>
          <ProfileRoundButton route="/notifications">
            <Image src="/notifications.svg" alt="notifications" width={40} height={25} />
          </ProfileRoundButton>
        </div>
      </div>

      {/* Desktop TopBar */}
      <div className="hidden lg:block">
        <TopBar back={false} notifications={true} settings={false} />
      </div>

      {children}
    </Container>
  );
}
