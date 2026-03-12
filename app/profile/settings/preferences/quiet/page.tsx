"use client";
import { useState } from "react";
import ProfilePageTemplate from "@/components/ui/profile/ProfilePageTemplate";

export default function QuietHoursPage() {
  const [selectedCertainDays, setSelectedCertainDays] = useState<number[]>([]);
  const [selectedAllDays, setSelectedAllDays] = useState<number[]>([]);

  const days: string[] = ["M", "T", "W", "T", "F", "S", "S"];

  const toggleDay = (
    index: number,
    selectedList: number[],
    setList: React.Dispatch<React.SetStateAction<number[]>>,
  ) => {
    if (selectedList.includes(index)) {
      setList(selectedList.filter((i) => i !== index));
    } else {
      setList([...selectedList, index]);
    }
  };

  return (
    <ProfilePageTemplate title="Quiet Hours">
      <div className="w-full flex flex-col justify-center items-center gap-12">
        <section className="w-full">
          <h2 className="text-lg">Certain hours</h2>
          <div className="w-full h-px bg-[#383838] my-2 mb-4"></div>

          <div className="w-full flex justify-between items-center mb-6 gap-1">
            {days.map((day, index) => (
              <button
                key={`certain-${index}`}
                onClick={() =>
                  toggleDay(index, selectedCertainDays, setSelectedCertainDays)
                }
                className={`size-8 rounded-full  text-lg transition-colors duration-100 cursor-pointer ${
                  selectedCertainDays.includes(index)
                    ? "bg-green-light text-background"
                    : "text-white"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="flex w-full justify-between items-center mb-6 gap-2">
            <div className="w-45 max-w-[47%] flex flex-col gap-2">
              <label className="text-xs tracking-wide uppercase">Start</label>
              <input
                type="time"
                defaultValue="00:00"
                className="h-13 w-full bg-secondary border border-green-light rounded-lg text-center text-2xl text-gray-400 outline-none focus:text-white"
              />
            </div>
            <div className="w-45 max-w-[47%] flex flex-col gap-2">
              <label className="text-xs tracking-wide uppercase">End</label>
              <input
                type="time"
                defaultValue="12:00"
                className="h-13 w-full bg-secondary border border-green-light rounded-lg text-center text-2xl text-gray-400 outline-none focus:text-white"
              />
            </div>
          </div>

          <div className="w-full flex justify-center items-center">
            <button className="w-55 h-10 bg-green-light text-black font-medium rounded-2xl cursor-pointer">
              SAVE
            </button>
          </div>
        </section>

        <section className="w-full mt-4">
          <h2 className="text-lg">All Day</h2>
          <div className="w-full h-px bg-[#383838] my-2 mb-4"></div>

          <div className="w-full flex justify-between items-center mb-6 gap-1">
            {days.map((day, index) => (
              <button
                key={`all-${index}`}
                onClick={() =>
                  toggleDay(index, selectedAllDays, setSelectedAllDays)
                }
                className={`size-8 rounded-full  text-lg transition-colors duration-100 cursor-pointer ${
                  selectedAllDays.includes(index)
                    ? "bg-green-light text-background"
                    : "text-white"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="w-full flex justify-center items-center">
            <button className="w-55 h-10 bg-green-light text-black font-medium rounded-2xl cursor-pointer">
              SAVE
            </button>
          </div>
        </section>

        <p className="text-white/48 text-sm leading-relaxed">
          * Choose when to mute alerts from users in need
        </p>
      </div>
    </ProfilePageTemplate>
  );
}
