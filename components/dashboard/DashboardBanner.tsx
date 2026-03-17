import Image from "next/image";

export default function DashboardBanner() {
  return (
    <div className="w-full flex gap-3 items-center p-3 py-4 justify-center relative">
      <Image
        src="/rectangle.svg"
        width={360}
        height={200}
        alt="Design Image"
        priority
        className="absolute object-cover z-0 top-0 w-full h-full rounded-3xl"
      />
      <div className="flex-1 z-2 bg-weather-nice rounded-2xl flex flex-col justify-center p-2 px-4">
        <p className="w-full font-bold text-lg">Event</p>
        <p className="w-full font-light">Game Night</p>
      </div>
      <div className="flex-1 h-full z-2 bg-weather-nice rounded-2xl flex justify-between items-center p-2 px-4">
        <div className="flex flex-col">
          <p className="w-full font-bold text-xl">21° C</p>
          <p className="w-full font-light">Sunny</p>
        </div>
        <Image src="/sun.svg" width={45} height={45} alt="sun icon" />
      </div>
    </div>
  );
}
