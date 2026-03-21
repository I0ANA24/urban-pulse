"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GoBackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function GoBackButton({
  children,
  ...restProps
}: GoBackButtonProps) {
  const router = useRouter();

  return (
    <button
      {...restProps}
      onClick={() => router.back()}
      className="cursor-pointer hover:scale-105 active:scale-95 -mx-1"
    >
      {children}
    </button>
  );
}
