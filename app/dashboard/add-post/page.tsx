"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ImagePlus, Bold, Underline } from "lucide-react";
import { EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";

export default function AddPostPage() {
  const router = useRouter();

  // state pentru user
  const [isVerified, setIsVerified] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  // state pentru formular
  const [description, setDescription] = useState("");
  const [selectedTag, setSelectedTag] = useState<EventType | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  // state specific pentru SKILL / LEND
  const [requestedItem, setRequestedItem] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // fetch pentru a vedea daca e verified
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5248/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nu s-a putut aduce profilul");
        return res.json();
      })
      .then((data) => {
        setIsVerified(data.isVerified ?? true);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingUser(false));
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handlePost = async () => {
    if (!description || !selectedTag) {
      alert("Please write something and select a tag!");
      return;
    }

    if ((selectedTag === "Skill" || selectedTag === "Lend") && !requestedItem) {
      alert("Please specify the item/skill you need!");
      return;
    }

    console.log("Description:", description);
    console.log("Tag:", selectedTag);
    console.log("Requested Item/Skill:", requestedItem);
    console.log("Photo File:", photo);

    /* to do pentru backend dev:
      const formData = new FormData();
      formData.append("description", description);
      formData.append("type", selectedTag);
      formData.append("requestedItem", requestedItem);
      if (photo) formData.append("image", photo);

      await fetch("http://localhost:5248/api/event", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // Nu pune Content-Type cand folosesti FormData!
        body: formData
      });
    */

    router.push("/dashboard");
  };

  if (loadingUser)
    return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="w-full h-screen bg-[#0E0E0E] px-6 py-8 flex flex-col font-inter">
      {/* header buttons */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="border border-white/20 text-red-emergency px-6 py-2 rounded-2xl font-medium"
        >
          Discard
        </button>
        <button
          onClick={handlePost}
          className="bg-[#4ADE80] text-black px-8 py-2 rounded-2xl font-bold"
        >
          Post
        </button>
      </div>

      {/* text area & image upload */}
      <div className="bg-[#383838] rounded-3xl p-5 border border-white/5 flex flex-col mb-8">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write something..."
          className="w-full bg-transparent text-white placeholder-white/40 outline-none resize-none min-h-37.5 text-sm"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-4 items-center text-white">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative"
            >
              <ImagePlus size={24} />
              {photo && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border border-[#383838]"></div>
              )}
            </button>
            <button>
              <Bold size={20} />
            </button>
            <button>
              <Underline size={20} />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />

          {photo && (
            <div className="border border-green-400 text-green-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
              Photo added
            </div>
          )}
        </div>
      </div>

      {/* tags section */}
      <h2 className="text-white font-bold text-xl mb-4 border-b border-white/20 pb-2">
        TAGS
      </h2>
      <div className="flex flex-wrap gap-3 mb-8">
        {(Object.keys(EVENT_TAG_STYLES) as EventType[]).map((type) => {
          const style = EVENT_TAG_STYLES[type];
          const isSelected = selectedTag === type;

          // daca e Skill sau Lend si nu e verificat, nu il lasam sa apese
          const isDisabled =
            (type === "Skill" || type === "Lend") && !isVerified;

          return (
            <button
              key={type}
              onClick={() => !isDisabled && setSelectedTag(type)}
              disabled={isDisabled}
              className={`px-4 py-2.5 rounded-[10px] text-[10px] font-bold uppercase transition-all
                ${isDisabled ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer"}
                ${isSelected ? "shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105" : ""}
              `}
              style={{
                backgroundColor: style.bgColor,
                color: style.textColor,
                // Umbra specifica daca e selectat
                boxShadow: isSelected
                  ? `0 0 20px ${style.bgColor}80, inset 0 0 5px white`
                  : "none",
              }}
            >
              {style.title}
            </button>
          );
        })}
      </div>

      {/* SKILL / LEND Input Section (apare doar cand sunt selectate) */}
      {(selectedTag === "Skill" || selectedTag === "Lend") && (
        <div className="animate-fade-up">
          <h2 className="text-white font-bold text-xl mb-2 border-b border-white/20 pb-2 uppercase">
            {selectedTag}
          </h2>
          <p className="text-white/40 text-xs mb-4">
            *The list items are not visible in your post
          </p>

          <div className="bg-[#2B2B2B] rounded-3xl p-5">
            {!isAddingItem && !requestedItem ? (
              <button
                onClick={() => setIsAddingItem(true)}
                className="bg-yellow-primary text-[#4D3B03] font-bold text-sm px-4 py-2 rounded-full flex items-center gap-2 w-fit"
              >
                <span className="bg-black text-yellow-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  +
                </span>
                Request help
              </button>
            ) : (
              <div className="bg-yellow-primary text-[#4D3B03] px-4 py-3 rounded-xl flex items-center justify-between">
                <input
                  type="text"
                  autoFocus
                  placeholder={`Ex: ${selectedTag === "Skill" ? "Electrician" : "Hammer"}`}
                  value={requestedItem}
                  onChange={(e) => setRequestedItem(e.target.value)}
                  className="bg-transparent outline-none font-medium placeholder-[#4D3B03]/50 w-full"
                  onBlur={() => {
                    if (!requestedItem) setIsAddingItem(false);
                  }}
                />
                <button
                  onClick={() => {
                    setRequestedItem("");
                    setIsAddingItem(false);
                  }}
                >
                  <X size={20} className="text-red-emergency" strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
