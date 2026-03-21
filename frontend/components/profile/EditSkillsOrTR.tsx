"use client";
import { PlusCircleIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface EditSkillsOrTRProps {
  add: "Skills" | "TR";
  items: string[];
  onItemsChange: (items: string[]) => void;
}

export default function EditSkillsOrTR({ add, items, onItemsChange }: EditSkillsOrTRProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isPopupOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isPopupOpen]);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onItemsChange([...items, trimmed]);
    setText("");
    setIsPopupOpen(false);
  };

  const handleRemove = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full flex flex-col gap-4 mt-2">

      {items.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="w-full h-12 px-4 flex items-center justify-between bg-yellow-secondary rounded-[10px] overflow-hidden"
            >
              <span className="text-black">{item}</span>
              <button onClick={() => handleRemove(i)} className="text-red-emergency hover:text-secondary transition-colors duration-200 cursor-pointer">
                <X size={22} strokeWidth={3.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsPopupOpen(true)}
        className="w-fit px-4 h-9 bg-yellow-primary flex justify-center items-center gap-2 rounded-full shadow-md shadow-neutral-800 cursor-pointer transition-all duration-200"
      >
        <PlusCircleIcon className="fill-black stroke-yellow-primary" />
        <p className="text-black font-medium">Add a {add === "Skills" ? "skill" : "tool/resource"}</p>
      </button>

      {isPopupOpen && mounted && createPortal(
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center px-4 z-50"
          onClick={() => setIsPopupOpen(false)}
        >
          <div
            className="bg-secondary w-80 max-w-[80vw] rounded-[20px] p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="text-center text-white text-2xl font-bold">
              Add a {add === "Skills" ? "skill" : "tool or resource to lend"}
            </h5>

            <div className="w-full h-px bg-white/90" />

            <textarea
              className="w-full h-27 bg-[#191919] text-white rounded-[10px] p-4 resize-none outline-none"
              placeholder="Write something..."
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex justify-center">
              <button
                type="button"
                className="bg-yellow-primary text-black font-medium h-10 w-35 rounded-full shadow-md shadow-neutral-800 cursor-pointer hover:bg-yellow-primary/85 transition-all duration-200"
                onClick={handleAdd}
              >
                Add
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}