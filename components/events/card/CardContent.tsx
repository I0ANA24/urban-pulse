interface CardContentProps {
  description: string;
  isVerified?: boolean;
}

export default function CardContent({ description, isVerified }: CardContentProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="text-white text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {isVerified && (
        <span className="bg-green-light text-black px-3 py-1 rounded-md text-xs font-bold w-fit mt-1">
          Verified info
        </span>
      )}
    </div>
  );
}