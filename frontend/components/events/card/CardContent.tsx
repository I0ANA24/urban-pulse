interface CardContentProps {
  description: string;
  isVerified?: boolean;
  yesCount?: number;
}

export default function CardContent({ description, isVerified, yesCount }: CardContentProps) {
  const showVerified = isVerified && (yesCount ?? 0) >= 3;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="text-white text-sm lg:text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {showVerified && (
        <span className="bg-green-light text-black px-3 py-1 rounded-md text-xs font-bold w-fit mt-1">
          Verified info
        </span>
      )}
    </div>
  );
}