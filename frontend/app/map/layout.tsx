import NavBar from "@/components/layout/NavBar";
import TopBar from "@/components/layout/TopBar";
import LeftSidebar from "@/components/layout/LeftSidebar";

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NavBar />

      {/* Desktop: TopBar + LeftSidebar overlaid on the full-screen map.
          Matches exactly the Container (px-6) + ThreeColumnLayout (px-6 gap-8) structure. */}
      <div
        className="hidden lg:flex lg:flex-col fixed inset-0 pointer-events-none"
        style={{ zIndex: 200 }}
      >
        {/* TopBar — h-23 + overflow-hidden clips the internal mb-8 so height stays exactly 5.75rem */}
        <div className="pointer-events-auto bg-background px-6 h-23 overflow-hidden shrink-0">
          <TopBar back={false} notifications={true} settings={false} />
        </div>

        {/* Sidebar row — px-6 + gap-8/gap-14 matches ThreeColumnLayout */}
        <div className="flex flex-1 min-h-0 px-6 gap-8 xl:gap-14">
          {/* Fixed width sidebar: w-56 on lg, w-64 on xl — matches the CSS offset on the map container */}
          <div className="pointer-events-auto bg-background flex flex-col w-56 xl:w-64 shrink-0 py-6">
            <LeftSidebar />
          </div>
          {/* Transparent area — map is visible and interactive here */}
        </div>
      </div>
    </>
  );
}
