"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSevereWeather } from "@/context/SevereWeatherContext";
import { useCrisis } from "@/context/CrisisContext";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

export default function DashboardBanner({
  onSevereWeather,
}: {
  onSevereWeather?: (isSevere: boolean) => void;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const { isSevereWeather } = useSevereWeather();
  const { isInLocalCrisis, isInGlobalCrisis, viewRegularContent, toggleViewRegularContent } = useCrisis();
  const isInCrisis = isInLocalCrisis || isInGlobalCrisis;

  useEffect(() => {
    onSevereWeather?.(isSevereWeather);
  }, [isSevereWeather, onSevereWeather]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    const fetchWeather = () => {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Iasi,RO&units=metric&appid=${apiKey}`,
      )
        .then((res) => res.json())
        .then((data) => {
          const description = data.weather[0].description as string;
          setWeather({
            temp: Math.round(data.main.temp),
            description:
              description.charAt(0).toUpperCase() + description.slice(1),
            icon: data.weather[0].icon,
          });
        })
        .catch(console.error);
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const weatherCard = (
    <div
      className={`flex-1 z-2 rounded-2xl flex justify-center items-center p-2 px-4 min-h-20 transition-all relative ${
        isSevereWeather ? "bg-red-emergency" : "bg-weather-nice"
      }`}
    >
      <div className="flex flex-col mr-18">
        <p className="w-full font-bold text-xl">
          {weather ? `${weather.temp}° C` : "--° C"}
        </p>
        <p className="w-full font-light">
          {weather ? weather.description : "Loading..."}
        </p>
      </div>
      <div className="absolute w-15 h-15 right-[5vw] sm:right-15 sm:w-20 sm:h-20">
        <img
          src={weather ? `https://openweathermap.org/img/w/${weather.icon}.png` : "/sun.svg"}
          width={45}
          height={45}
          alt="weather icon"
          className="w-full h-full"
        />
      </div>
    </div>
  );

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
      {isInCrisis ? (
        <>
          <button
            onClick={toggleViewRegularContent}
            className="flex-1 z-2 rounded-2xl flex items-center justify-center min-h-20 bg-[#111111] text-white font-bold text-sm text-center px-3 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
          >
            {viewRegularContent ? "← Crisis feed" : "View regular\ncontent"}
          </button>
          {weatherCard}
        </>
      ) : (
        weatherCard
      )}
    </div>
  );
}
