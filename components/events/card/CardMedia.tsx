import Image from "next/image";

interface CardMediaProps {
  imageUrl: string | null;
}

export default function CardMedia({ imageUrl }: CardMediaProps) {
  if (!imageUrl) return null;

  return (
    <div className="relative w-full -mt-3 -z-10">
      <Image
        src={`http://localhost:5248${imageUrl}`}
        alt="Event Image"
        width={350}
        height={220}
        className="w-full h-auto object-cover rounded-sm"
      />
    </div>
  );
}