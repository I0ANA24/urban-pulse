import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

export default function DocumentsPage() {
  return (
    <ThreeColumnLayout>
      <div className="flex flex-col py-2 gap-6">

        <Link
          href="/documents/posts"
          className="w-[90%] mx-auto bg-blue text-white font-semibold text-lg rounded-full px-6 py-4 flex items-center justify-between transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          <span>See found documents</span>
          <ChevronRight size={22} strokeWidth={2.5} />
        </Link>

        <div className="flex items-center justify-center py-4">
          <span className="text-8xl">📄</span>
        </div>

        <div className="w-[90%] mx-auto bg-secondary rounded-3xl px-6 py-6 flex flex-col items-center gap-5">
          <span className="text-white/40 text-xs font-medium tracking-widest uppercase">
            Urban Pulse
          </span>
          <p className="text-white font-bold text-center text-xl leading-snug">
            Found a document on the street?<br />
            Help it find its way back.
          </p>
          <Link
            href="/documents/add"
            className="bg-blue text-white font-bold text-base px-12 py-3 rounded-full hover:opacity-90 transition-opacity active:scale-95"
          >
            Report found
          </Link>
        </div>

      </div>
    </ThreeColumnLayout>
  );
}