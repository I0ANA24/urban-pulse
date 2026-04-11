"use client";

import { useEffect, useState } from "react";
import { useEvent } from "@/context/EventContext";
import { useSevereWeather } from "@/context/SevereWeatherContext";

function DesktopWeatherCard() {
  const [weather, setWeather] = useState<{
    temp: number;
    description: string;
    icon: string;
  } | null>(null);
  const { isSevereWeather } = useSevereWeather();

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const fetchWeather = () => {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Iasi,RO&units=metric&appid=${apiKey}`,
      )
        .then((res) => res.json())
        .then((data) => {
          const desc = data.weather[0].description as string;
          setWeather({
            temp: Math.round(data.main.temp),
            description: desc.charAt(0).toUpperCase() + desc.slice(1),
            icon: data.weather[0].icon,
          });
        })
        .catch(console.error);
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`rounded-2xl p-8 h-30 flex items-center justify-between relative ${
        isSevereWeather ? "bg-red-emergency" : "bg-weather-nice"
      }`}
    >
      <div className="flex flex-col gap-1">
        <p className="text-white font-bold text-2xl leading-tight tracking-tight">
          {weather ? `${weather.temp}° C` : "--° C"}
        </p>
        <p className="text-white font-normal text-xl leading-tight tracking-tight">
          {weather ? weather.description : "Loading..."}
        </p>
      </div>
      <div className="w-25 h-25 absolute right-2">
        <img
          src={
            weather
              ? `https://openweathermap.org/img/w/${weather.icon}.png`
              : "/sun.svg"
          }
          width={90}
          height={90}
          alt="weather icon"
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
}

export default function RightSidebar() {
  const { event } = useEvent();

  return (
    <aside className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-4">
      <DesktopWeatherCard />

      <div className="bg-weather-nice rounded-2xl p-8 h-30 flex flex-col justify-center gap-1">
        <p className="text-white font-bold text-2xl leading-tight tracking-tight">
          Event
        </p>
        <p className="text-white font-normal text-xl leading-tight tracking-tight">
          {event ?? "No events"}
        </p>
      </div>
    </aside>
  );
}