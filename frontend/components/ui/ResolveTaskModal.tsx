import PortalModal from "./PortalModal";

interface ResolveTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleDismiss: () => void;
  handleOpenDeleteConfirm: () => void;
  greenButtonText: string;
  redButtonText: string;
}

export default function ResolveTaskModal({
  isOpen,
  onClose,
  handleDismiss,
  handleOpenDeleteConfirm,
  greenButtonText,
  redButtonText,
}: ResolveTaskModalProps) {
  return (
    <PortalModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-bold font-montagu text-white">Resolve task</h2>
        <div className="h-px w-full bg-white mt-2"></div>
      </div>
      <div className="flex flex-col px-6 pb-8 gap-3">
        <button
          onClick={handleDismiss}
          className="w-full h-13 rounded-[15] bg-green-light hover:bg-green-light/80 active:scale-98 transition-all font-semibold text-black text-xl cursor-pointer"
        >
          {greenButtonText}
        </button>
        <button
          onClick={handleOpenDeleteConfirm}
          className="w-full h-13 rounded-[15] bg-red-emergency hover:bg-red-emergency/80 active:scale-98 transition-all font-semibold text-white text-xl cursor-pointer"
        >
          {redButtonText}
        </button>
      </div>
    </PortalModal>
  );
}
