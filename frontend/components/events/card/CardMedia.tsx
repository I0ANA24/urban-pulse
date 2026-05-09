import Image from "next/image";

interface CardMediaProps {
  imageUrl: string | null;
}

export default function CardMedia({ imageUrl }: CardMediaProps) {
  if (!imageUrl) return null;

  const src = imageUrl.startsWith("http") ? imageUrl : `http://localhost:5248${imageUrl}`;

  return (
    <div className="relative w-full h-72 -mt-3 -z-10">
      <Image
        src={src}
        alt="Event Image"
        fill
        className="object-cover rounded-sm"
      />
    </div>
  );
}