interface BSTCardProps {
  children: React.ReactNode;
  title: string;
}

export default function BSTCard({ children, title }: BSTCardProps) {
  return (
    <div className="w-full px-5 py-4 bg-secondary rounded-2xl flex flex-col">
      <h5 className="font-bold text-xl">{title}</h5>

      <div className="w-full h-px bg-white/90 my-2"></div>

      {children}
    </div>
  );
}
