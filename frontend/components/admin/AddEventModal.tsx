"use client";

import { useEffect, useRef, useState } from "react";
import PortalModal from "@/components/ui/PortalModal";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventText: string) => void;
}

export default function AddEventModal({
  isOpen,
  onClose,
  onSave,
}: AddEventModalProps) {
  const [eventText, setEventText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSave = () => {
    if (eventText.trim()) {
      onSave(eventText);
      setEventText("");
      onClose();
    }
  };

  return (
    <PortalModal
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="bg-weather-nice w-full max-w-90 rounded-4xl overflow-hidden"
    >
      {/* Title */}
      <div className="flex items-center justify-center py-5">
        <h2 className="text-2xl font-bold text-white">Add event</h2>
      </div>

      {/* Input */}
      <div className="px-6 pb-4">
        <textarea
          ref={inputRef}
          value={eventText}
          onChange={(e) => setEventText(e.target.value)}
          placeholder="Write..."
          className="w-full bg-[#5C6478] text-white placeholder:text-gray-300 rounded-3xl px-5 py-4 resize-none outline-none transition-all text-base"
          rows={4}
        />
      </div>

      {/* Save button */}
      <div className="flex justify-center pb-5">
        <button
          onClick={handleSave}
          className="bg-[#1E2840] hover:bg-[#1E2840]/90 text-white font-semibold px-16 py-3 rounded-full transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-base cursor-pointer"
          disabled={!eventText.trim()}
        >
          Save
        </button>
      </div>
    </PortalModal>
  );
}