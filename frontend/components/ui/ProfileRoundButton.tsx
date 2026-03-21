import Link from "next/link";

interface ProfileRoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  route: string;
}

export default function ProfileRoundButton({
  children,
  route,
  ...restProps
}: ProfileRoundButtonProps) {
  return (
    <Link href={route}>
      <button
        {...restProps}
        className="flex items-center justify-center w-13.5 h-13.5 rounded-full bg-[#1F1F1F] shadow-[0_4px_4px_rgba(0,0,0,0.25),inset_0_0_5px_rgba(255,255,255,0.4)] border border-white/50 transition-transform duration-200 active:scale-95 cursor-pointer hover:scale-104"
      >
        {children}
      </button>
    </Link>
  );
}
