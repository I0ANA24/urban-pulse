"use client";

import { Eye, EyeClosed, EyeClosedIcon, EyeIcon } from "lucide-react";
import { useState } from "react";

interface HorizontalCardProps {
  title: string;
  type: string;
  placeholder: string;
}

export default function HorizontalCard({
  title,
  type,
  placeholder,
  ...props
}: HorizontalCardProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" && showPassword ? "text" : type;
  const isDisabled =
    title === "Email" || title === "Password";

  return (
    <div className="w-full px-5 py-4 bg-secondary rounded-2xl flex items-center justify-between">
      <div className="w-full flex items-center flex-1 relative">
        <h5 className="font-bold text-sm min-w-17.5">{title}</h5>

        <div className="w-px h-5 bg-white/90 mx-3"></div>

        <div className="w-full">
          <input
            type={inputType}
            placeholder={placeholder}
            disabled={isDisabled}
            className="w-full text-sm outline-none bg-transparent flex-1 overflow-hidden"
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        </div>
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 text-xs text-white/70 hover:text-white ml-2 cursor-pointer"
          >
            {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
          </button>
        )}
      </div>
    </div>
  );
}
