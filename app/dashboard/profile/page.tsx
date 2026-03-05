"use client";

import { Pencil, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Profile() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans flex justify-center py-6 px-5">
      <div className="w-full max-w-95 animate-fade-up">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="cursor-pointer hover:scale-105 active:scale-95"
          >
            <Image
              src="/undo.svg"
              alt="go_back"
              width={69}
              height={49}
              className="-ml-2"
            />
          </button>
          <button className="flex items-center justify-center w-13.5 h-13.5 rounded-full bg-[#1F1F1F] shadow-[0_4px_4px_rgba(0,0,0,0.25),inset_0_0_5px_rgba(255,255,255,0.4)] border border-white/50 transition-transform duration-200 active:scale-95 cursor-pointer hover:scale-104">
            <Image src="/settings.svg" alt="go_back" width={47} height={30} />
          </button>
        </div>

        <div className="flex flex-col items-center mb-7">
          <div className="w-46 h-46 rounded-full mb-4">
            <Image
              src="/profile.png"
              width={184}
              height={184}
              alt="profile_picture"
            />
          </div>

          <h1 className="text-2xl font-extrabold text-center leading-[1.15] mb-4">
            Greta
            <br />
            Bennett
          </h1>

          <button className="flex items-center justify-center gap-2 bg-green-light text-black px-5 py-2 rounded-full text-[14px] font-semibold hover:bg-[#d4d4d4] transition-colors mb-6">
            <Pencil className="w-[15px] h-[15px]" strokeWidth={2.5} />
            Edit profile
          </button>

          <div className="text-[13px] text-foreground/80 leading-[1.6] flex gap-2 w-full">
            <span className="text-foreground whitespace-nowrap">Bio:</span>
            <p>
              🌿 Plant lover | Yard Designer | Creator
              <br />I like to connect with people and give a lot of help!
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-foreground/20 mb-8" />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="bg-[#fcf5c7] text-black rounded-[20px] p-5 flex flex-col items-center justify-center h-[150px]">
              <span className="font-bold text-[14px] mb-2">Connections</span>
              <span className="text-[44px] font-medium leading-none tracking-tight">
                45+
              </span>
            </div>

            <div className="bg-[#eafa4b] text-black rounded-[20px] p-5 flex flex-col items-center justify-center h-[140px]">
              <span className="font-bold text-[14px] mb-2">Best at</span>
              <span className="text-[18px] font-medium">Gardening</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-[#eafa4b] text-black rounded-[20px] p-5 flex flex-col items-center justify-center h-[110px]">
              <span className="font-bold text-[14px] mb-2">Trust score</span>
              <div className="flex gap-1">
                <Star className="w-[18px] h-[18px] fill-black stroke-black" />
                <Star className="w-[18px] h-[18px] fill-black stroke-black" />
                <Star className="w-[18px] h-[18px] fill-black stroke-black" />
                <Star
                  className="w-[18px] h-[18px] stroke-black"
                  strokeWidth={1.5}
                />
                <Star
                  className="w-[18px] h-[18px] stroke-black"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <div className="bg-[#fcf5c7] text-black rounded-[20px] p-5 flex flex-col items-center text-center h-[180px]">
              <span className="font-bold text-[14px] mb-3 mt-1">Skills</span>
              <div className="text-[15px] leading-snug flex flex-col gap-1">
                <span>Gardening</span>
                <span>Cooking</span>
                <span>DIY</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#fcf5c7] text-black rounded-[20px] py-5 px-4 flex items-center justify-evenly w-full">
          <div className="flex flex-col items-center w-full">
            <span className="text-[14px] mb-1">Helped</span>
            <span className="text-[32px] font-medium leading-none">23</span>
          </div>

          <div className="w-[1px] h-[40px] bg-black/15" />

          <div className="flex flex-col items-center w-full">
            <span className="text-[14px] mb-1">Posts</span>
            <span className="text-[32px] font-medium leading-none">12</span>
          </div>
        </div>
      </div>
    </div>
  );
}
