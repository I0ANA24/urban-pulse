import Image from "next/image";

interface OverviewCardProps {
  title: string;
  stats: { bold: string; text: string }[];
}

export default function OverviewCard({ title, stats }: OverviewCardProps) {
  return (
    <div className="w-full bg-third rounded-xl p-6">
      {/* Title row */}
      <div className="flex items-start">
        <Image src={"/overview-ellipse.png"} alt="Design Ellipse" width={60} height={60} />
        <h3 className="text-white font-bold text-xl pt-1.5 -ml-2">{title}</h3>
      </div>

      {/* Stats with left accent border */}
      <div className="border-l-2 border-white/80 ml-5 p-2 pl-4 flex flex-col gap-1.5">
        {stats.map((stat, i) => (
          <p key={i} className="text-white text-xl">
            <span className="font-bold">{stat.bold}</span> {stat.text}
          </p>
        ))}
      </div>
    </div>
  );
}