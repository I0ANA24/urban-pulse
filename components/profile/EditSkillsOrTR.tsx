"use client";
import { PlusCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface EditSkillsOrTRProps {
  add: "Skills" | "TR";
}

export default function EditSkillsOrTR({ add }: EditSkillsOrTRProps) {
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPopupOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isPopupOpen]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-baseline">
      <button
        type="button"
        onClick={() => setIsPopupOpen(true)}
        className="w-fit px-4 h-9 bg-yellow-primary flex justify-center items-center gap-2 rounded-full shadow-md shadow-neutral-800 hover:shadow-neutral-700 cursor-pointer transition-all duration-200"
      >
        <PlusCircleIcon className="fill-black stroke-yellow-primary" />
        <p className="text-black font-medium">Add a {add === "Skills" ? "skill" : "tool/resource"}</p>
      </button>

      {isPopupOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/70 flex justify-center items-center px-4"
            onClick={() => setIsPopupOpen(false)}
          >
            <div
              className="bg-secondary w-80 max-w-[80vw] rounded-[20px] p-6 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h5 className="text-center text-white text-2xl font-bold">Add a {add === "Skills" ? "skill" : "tool or resource to lend"}</h5>

              <div className="w-full h-px bg-white/90 " />

              <textarea
                className="w-full h-27 bg-[#191919] text-white rounded-[10px] p-4 resize-none outline-none focus:none"
                placeholder="Write something..."
                autoFocus
              />

              <div className="flex justify-center">
                <button
                  type="button"
                  className="bg-yellow-primary text-black font-medium h-10 w-35 rounded-full shadow-md shadow-neutral-800 hover:shadow-neutral-700 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setIsPopupOpen(false);
                  }}
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
