"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const severeConditions = [
  "thunderstorm",
  "storm",
  "tornado",
  "squall",
  "hurricane",
  "gale",
  "blizzard",
  "hail",
  "sleet",
  "freezing rain",
  "freezing drizzle",
  "heavy snow",
  "heavy rain",
  "heavy intensity rain",
  "very heavy rain",
  "extreme rain",
  "dense fog",
  "freezing fog",
  "dust",
  "sand",
  "volcanic ash",
];

interface SevereWeatherContextType {
  isSevereWeather: boolean;
}

const SevereWeatherContext = createContext<SevereWeatherContextType>({
  isSevereWeather: false,
});

export const SevereWeatherProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSevereWeather, setIsSevereWeather] = useState(false);

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
          setIsSevereWeather(isSevere);
        })
        .catch(console.error);
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SevereWeatherContext.Provider value={{ isSevereWeather }}>
      {children}
    </SevereWeatherContext.Provider>
  );
};

export const useSevereWeather = () => useContext(SevereWeatherContext);
