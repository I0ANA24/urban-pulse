"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface GoBackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function GoBackButton({ ...restProps }: GoBackButtonProps) {
  const router = useRouter();

  return (
    <button
      {...restProps}
      onClick={() => router.back()}
      className="cursor-pointer hover:scale-105 active:scale-95 -mx-1 z-100"
    >
      <Image
        src="/undo.svg"
        alt="go_back"
        width={69}
        height={49}
        className="-ml-2"
      />
    </button>
  );
}
