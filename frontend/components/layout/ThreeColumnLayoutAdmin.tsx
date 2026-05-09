"use client";

import { useState } from "react";
import AdminLeftSidebar from "@/components/admin/AdminLeftSidebar";
import AdminRightSidebar from "@/components/admin/AdminRightSidebar";
import AddEventModal from "@/components/admin/AddEventModal";
import TopBar from "@/components/layout/TopBar";
import { useEvent } from "@/context/EventContext";

export default function ThreeColumnLayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const { event, setEvent, clearEvent } = useEvent();

  return (
    <>
      <TopBar back={false} notifications={false} settings={false} />

      <div className="w-full pb-[8vh] lg:pb-0 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="lg:flex lg:px-6 lg:gap-8 xl:gap-14 lg:items-stretch lg:h-full lg:overflow-hidden">
          <AdminLeftSidebar
            onEventClick={() => setIsEventModalOpen(true)}
            event={event}
            onDeleteEvent={clearEvent}
          />

          <div
            className="lg:flex-2 max-w-190 lg:h-full lg:overflow-y-auto lg:min-h-0"
            style={{ scrollbarWidth: "none" }}
          >
            {children}
          </div>

          <AdminRightSidebar />
        </div>
      </div>

      <AddEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={setEvent}
      />
    </>
  );
}
