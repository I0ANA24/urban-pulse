"use client";

import { createPortal } from "react-dom";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Props {
  onClose: () => void;
  onStatusSet: (status: number) => void;
}

const STATUS_OPTIONS = [
  { label: "I'm safe", value: 1, color: "#22c55e" },
  { label: "I'm injured", value: 2, color: "#f97316" },
  { label: "I need help", value: 3, color: "#ef4444" },
  { label: "I'm available to help", value: 4, color: "#3b82f6" },
];

export default function SafetyCheckInModal({ onClose, onStatusSet }: Props) {
  const handleSelect = async (status: number) => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/user/safety-status`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onStatusSet(status);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#111111] rounded-t-3xl px-6 py-8 flex flex-col gap-4 border border-white/10 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-1 mb-2">
          <h2 className="text-white font-bold text-xl">Are you safe?</h2>
          <p className="text-white/40 text-sm">Update or set your status</p>
        </div>

        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95 cursor-pointer"
            style={{
              border: `2px solid ${opt.color}`,
              color: opt.color,
              background: `${opt.color}15`,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
