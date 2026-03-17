interface CardContentProps {
  description: string;
  isVerified?: boolean;
}

export default function CardContent({ description, isVerified }: CardContentProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-white">
        {description}
      </p>
      {isVerified && (
        <span className="bg-green-light text-black px-3 py-1 rounded-md text-xs font-bold w-fit mt-1">
          Verified info
        </span>
      )}
    </div>
  );
}