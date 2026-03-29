"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  defaultReason?: string;
}

export default function BanUserModal({
  isOpen,
  onClose,
  onConfirm,
  defaultReason = "",
}: BanUserModalProps) {
  const [reason, setReason] = useState(defaultReason);

  const handleConfirm = () => {
    onConfirm(reason);
    setReason(defaultReason);
  };

  const handleClose = () => {
    onClose();
    setReason(defaultReason);
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      icon={<Ban />}
      title="Ban user"
      boldText="ban this user?"
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white">Reason</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason..."
          className="w-full py-3 px-4 bg-background border border-red-emergency/40 rounded-xl text-white text-sm outline-none transition-colors duration-200 placeholder:text-white/30 focus:border-red-emergency/70"
        />
      </div>
    </ConfirmModal>
  );
}