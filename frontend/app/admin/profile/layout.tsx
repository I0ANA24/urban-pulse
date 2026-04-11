"use client";

import TopBar from "@/components/layout/TopBar";

export default function AdminProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Mobile TopBar only — desktop header is provided by ThreeColumnLayoutAdmin */}
      <div className="lg:hidden">
        <TopBar back={true} notifications={false} settings={false} />
      </div>
      {children}
    </>
  );
}
