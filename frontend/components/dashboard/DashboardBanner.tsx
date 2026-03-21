"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  isSevere: boolean;
}

const severeConditions = [
  "thunderstorm", "storm", "tornado", "squall", "hurricane",
  "gale", "blizzard", "hail", "sleet", "freezing rain",
  "freezing drizzle", "heavy snow", "heavy rain",
  "heavy intensity rain", "very heavy rain", "extreme rain",
  "dense fog", "freezing fog", "dust", "sand", "volcanic ash",
];

export default function DashboardBanner({
  onSevereWeather,
}: {
  onSevereWeather?: (isSevere: boolean) => void;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
    const fetchWeather = () => {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Iasi,RO&units=metric&appid=${apiKey}`
      )
        .then((res) => res.json())
        .then((data) => {
          const description = data.weather[0].description as string;
          const isSevere = severeConditions.some((c) =>
            description.toLowerCase().includes(c)
          );
          setWeather({
            temp: Math.round(data.main.temp),
            description: description.charAt(0).toUpperCase() + description.slice(1),
            icon: data.weather[0].icon,
            isSevere,
          });
          onSevereWeather?.(isSevere);
        })
        .catch(console.error);
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex gap-3 items-stretch p-3 py-4 justify-center relative">
      <Image
        src="/rectangle.svg"
        width={360}
        height={200}
        alt="Design Image"
        priority
        className="absolute object-cover z-0 top-0 w-full h-full rounded-3xl"
      />
      <div className="flex-1 z-2 bg-weather-nice rounded-2xl flex flex-col justify-center p-2 px-4 min-h-[80px]">
        <p className="w-full font-bold text-lg">Event</p>
        <p className="w-full font-light">Game Night</p>
      </div>
      <div
        className={`flex-1 z-2 rounded-2xl flex justify-between items-center p-2 px-4 min-h-[80px] transition-all ${
          weather?.isSevere ? "bg-red-emergency" : "bg-weather-nice"
        }`}
      >
        <div className="flex flex-col">
          <p className="w-full font-bold text-xl">
            {weather ? `${weather.temp}° C` : "--° C"}
          </p>
          <p className="w-full font-light">
            {weather ? weather.description : "Loading..."}
          </p>
        </div>
        <img
          src={
            weather
              ? `https://openweathermap.org/img/w/${weather.icon}.png`
              : "/sun.svg"
          }
          width={45}
          height={45}
          alt="weather icon"
        />
      </div>
    </div>
  );
}