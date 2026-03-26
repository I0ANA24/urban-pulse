import { ClipboardCheck } from "lucide-react";

interface CheckButtonProps {
  onClick: () => void;
}

export default function CheckButton({ onClick }: CheckButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-full transition-all bg-green-light hover:bg-green-light/90 active:scale-95 cursor-pointer z-100"
            }`}
    >
      <ClipboardCheck size={26} className="text-black" strokeWidth={1.8} />
    </button>
  );
}
