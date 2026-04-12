import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

export default function PetsPage() {
  return (
    <ThreeColumnLayout>
      <div className="flex flex-col py-2">

        {/* See posts button */}
        <Link
          href="/pets/posts"
          className="w-[90%] mx-auto bg-yellow-primary text-black font-semibold text-lg rounded-full px-6 py-4 flex items-center justify-between transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          <span>See posts</span>
          <ChevronRight size={22} strokeWidth={2.5} />
        </Link>

        {/* Cat illustration */}
        <div className="flex items-center justify-center py-4">
          <Image
            src="/pets.svg"
            alt="Pets illustration"
            width={200}
            height={200}
            className="object-contain"
          />
        </div>

        {/* Bottom card */}
        <div className="w-[90%] mx-auto bg-secondary rounded-3xl px-6 py-6 flex flex-col items-center gap-5 -mt-6">
          <span className="text-white/40 text-xs font-medium tracking-widest uppercase">
            Urban Pulse
          </span>
          <p className="text-white font-bold text-center text-xl leading-snug">
            Lost a pet or found a stray?<br />
            Let&apos;s bring them home together.
          </p>
          <Link
            href="/pets/addPost"
            className="bg-green-light text-black font-bold text-base px-12 py-3 rounded-full hover:opacity-90 transition-opacity active:scale-95"
          >
            Add post
          </Link>
        </div>

      </div>
    </ThreeColumnLayout>
  );
}
