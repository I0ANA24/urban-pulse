import LeftSidebar from "./LeftSidebar";
import ChatRightSidebar from "./ChatRightSidebar";

export default function ThreeColumnLayoutChat({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full pb-[8vh] lg:pb-0 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
      <div className="lg:flex lg:px-6 lg:gap-8 xl:gap-14 lg:items-stretch lg:h-full lg:overflow-hidden">
        <LeftSidebar />

        <div
          className="lg:flex-2 max-w-190 lg:h-full lg:min-h-0 lg:overflow-hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {children}
        </div>

        <ChatRightSidebar />
      </div>
    </div>
  );
}
