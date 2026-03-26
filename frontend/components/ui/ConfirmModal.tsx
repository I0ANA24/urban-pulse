import { ReactNode } from "react";
import PortalModal from "@/components/ui/PortalModal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  icon: ReactNode;
  title: string;
  boldText: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  children?: ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  icon,
  title,
  boldText,
  confirmLabel = "YES",
  cancelLabel = "NO",
  loading = false,
  children,
}: ConfirmModalProps) {
  return (
    <PortalModal isOpen={isOpen} onClose={onClose}>
      {/* Header — icon + title */}
      <div className="flex items-center justify-center gap-2 py-5">
        <span className="text-red-emergency [&>svg]:size-6 [&>svg]:stroke-2">
          {icon}
        </span>
        <h2 className="text-xl font-bold text-red-emergency">{title}</h2>
      </div>

      {/* Separator */}
      <div className="h-0.5 bg-white/10 mx-6" />

      {/* Body */}
      <div className="px-6 py-6 flex flex-col gap-6">
        {children}

        {/* Question */}
        <p className="text-white text-lg px-4 text-center">
          Are you sure you want to{" "}
          <span className="font-bold underline">{boldText}</span>
        </p>

        {/* YES / NO */}
        <div className="flex items-center justify-center mb-4 w-[80%] rounded-xl overflow-hidden h-10 mx-auto">
          <button
            onClick={() => onConfirm()}
            disabled={loading}
            className="flex-1 h-full font-bold text-white bg-third cursor-pointer hover:bg-third/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-full font-bold text-white bg-red-emergency cursor-pointer hover:bg-red-emergency/80 transition-colors duration-200"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </PortalModal>
  );
}
