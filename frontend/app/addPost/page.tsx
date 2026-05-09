"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, ImagePlus } from "lucide-react";
import { EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import dynamic from "next/dynamic";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

const MapPicker = dynamic(() => import("@/components/profile/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-70 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
      <p className="text-white/30 text-sm">Loading map...</p>
    </div>
  ),
});

function LocationModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="bg-[#1C1C1C] rounded-3xl p-6 w-full max-w-sm border border-white/10 flex flex-col gap-5 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-white font-bold text-lg font-montagu">
            Location Required
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            To post a Skill or Lend request, you need to set your location in
            your profile first.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/profile/settings/personal")}
            className="w-full bg-green-light text-black font-bold py-3 rounded-xl hover:bg-green-light/85 transition-colors"
          >
            Go to Settings
          </button>
          <button
            onClick={onClose}
            className="w-full border border-white/20 text-white/60 font-medium py-3 rounded-xl hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function AddPostPage() {
  const router = useRouter();

  const [isVerified, setIsVerified] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  const [selectedTag, setSelectedTag] = useState<EventType | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  const [requestedItem, setRequestedItem] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const [isBold, setIsBold] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);

  const [emergencyLat, setEmergencyLat] = useState<number | null>(null);
  const [emergencyLng, setEmergencyLng] = useState<number | null>(null);
  const [emergencyAddress, setEmergencyAddress] = useState<string>("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Write something..." }),
    ],
    content: "",
    onSelectionUpdate: ({ editor }) => {
      setIsBold(editor.isActive("bold"));
      setIsUnderlineActive(editor.isActive("underline"));
    },
    onUpdate: ({ editor }) => {
      setIsBold(editor.isActive("bold"));
      setIsUnderlineActive(editor.isActive("underline"));
    },
    editorProps: {
      attributes: {
        class:
          "w-full bg-transparent text-white outline-none min-h-[150px] text-base focus:outline-none",
      },
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5248/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setIsVerified(data.isVerified ?? false);
        setUserLat(data.latitude ?? null);
        setUserLng(data.longitude ?? null);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingUser(false));
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setPhoto(e.target.files[0]);
  };

  const handlePost = async () => {
    const description = editor?.getText() ?? "";

    if (!description || !selectedTag) {
      alert("Please write something and select a tag!");
      return;
    }

    if ((selectedTag === "Skill" || selectedTag === "Lend") && !requestedItem) {
      alert("Please specify the item/skill you need!");
      return;
    }

    if (selectedTag === "Emergency" && (!emergencyLat || !emergencyLng)) {
      alert("Please select the emergency location on the map!");
      return;
    }

    let lat = 0;
    let lng = 0;

    if (selectedTag === "Emergency") {
      lat = emergencyLat!;
      lng = emergencyLng!;
    } else if (selectedTag === "Skill" || selectedTag === "Lend") {
      lat = userLat ?? 0;
      lng = userLng ?? 0;
    }

    const token = localStorage.getItem("token");
    const typeMap: Record<string, number> = {
      General: 0,
      Emergency: 1,
      Skill: 2,
      Lend: 3,
    };

    const formData = new FormData();
    formData.append("description", editor?.getHTML() ?? description);
    formData.append("type", typeMap[selectedTag].toString());
    formData.append("latitude", lat.toString());
    formData.append("longitude", lng.toString());

    const tags = requestedItem ? [requestedItem] : [selectedTag];
    tags.forEach((tag) => formData.append("tags", tag));

    if (photo) formData.append("file", photo);

    try {
      const res = await fetch("http://localhost:5248/api/event", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        alert("Something went wrong. Please try again.");
        return;
      }
      router.push("/dashboard");
    } catch {
      alert("Connection error. Please try again.");
    }
  };

  if (loadingUser)
    return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <ThreeColumnLayout>
      <div className="w-full pb-[8vh] lg:pb-0 flex flex-col">
        {/* header buttons */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.back()}
            className="bg-red-emergency text-white font-bold w-30 h-11 rounded-xl cursor-pointer hover:bg-red-emergency/80 transition-colors duration-100"
          >
            Discard
          </button>
          <button
            onClick={handlePost}
            className="bg-green-light text-black w-30 py-2 rounded-xl font-bold cursor-pointer hover:bg-green-light/85 transition-colors duration-200"
          >
            Post
          </button>
        </div>

        <div className="w-full p-4 bg-secondary rounded-[30px] mb-8">
          <div className="bg-[#464646] w-full h-50 rounded-[20px] p-5 border border-white/5 flex flex-col overflow-scroll">
            <EditorContent editor={editor} />
          </div>
          <div className="flex items-center justify-between mt-4 px-4">
            <div className="flex gap-4 items-center text-white">
              <button
                onClick={() => document.getElementById("fileInput")?.click()}
                className="relative cursor-pointer"
              >
                <ImagePlus size={30} />
                {photo && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-light rounded-full border border-secondary" />
                )}
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor?.chain().focus().toggleBold().run();
                  setIsBold(!isBold);
                }}
                className={`text-2xl transition-all cursor-pointer font-montagu ${isBold ? "font-bold" : "font-normal"}`}
              >
                B
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor?.chain().focus().toggleUnderline().run();
                  setIsUnderlineActive(!isUnderlineActive);
                }}
                className={`underline transition-all cursor-pointer text-2xl font-montagu ${isUnderlineActive ? "font-bold" : "font-normal"}`}
              >
                U
              </button>
            </div>
            <input
              id="fileInput"
              type="file"
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            {photo && (
              <div className="border border-green-light text-green-light text-sm px-3 py-1.5 rounded-[10px] flex items-center gap-1">
                Photo added
              </div>
            )}
          </div>
        </div>

        <h2 className="text-white font-bold text-2xl mb-4 border-b-2 border-white/20 pb-2">
          TAGS
        </h2>
        <div className="flex flex-wrap gap-3 mb-8 px-1 py-1">
          {(Object.keys(EVENT_TAG_STYLES) as EventType[]).filter((type) => type !== "LostPet" && type !== "FoundPet").map((type) => {
            const style = EVENT_TAG_STYLES[type];
            const isSelected = selectedTag === type;
            const isDisabled =
              (type === "Skill" || type === "Lend") && !isVerified;

            return (
              <button
                key={type}
                onClick={() => !isDisabled && setSelectedTag(type)}
                disabled={isDisabled}
                className={`px-4 py-2.5 rounded-[10px] text-[10px] font-bold uppercase transition-all
                ${isDisabled ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer"}
                ${isSelected ? "scale-105" : ""}
              `}
                style={{
                  backgroundColor: style.bgColor,
                  color: style.textColor,
                  boxShadow: isSelected
                    ? `0 0 10px ${style.bgColor}80, inset 0 0 3px white`
                    : "none",
                }}
              >
                {style.title}
              </button>
            );
          })}
        </div>

        {selectedTag === "Emergency" && (
          <div className="animate-fade-up mb-8">
            <h2 className="text-white font-bold text-xl mb-2 border-b border-white/20 pb-2 uppercase">
              Emergency Location
            </h2>
            <p className="text-white/40 text-xs mb-4">
              📍 Move the map to mark the exact emergency location
            </p>
            {emergencyAddress && (
              <p className="text-white/60 text-xs mb-3 px-1 truncate">
                📌 {emergencyAddress}
              </p>
            )}
            <MapPicker
              onSelect={(addr, lat, lng) => {
                setEmergencyAddress(addr);
                setEmergencyLat(lat);
                setEmergencyLng(lng);
              }}
            />
          </div>
        )}

        {(selectedTag === "Skill" || selectedTag === "Lend") && (
          <div className="animate-fade-up mb-4">
            {userLat && userLng ? (
              <p className="text-white/40 text-xs px-1">
                📍 Your profile location will be used for this post
              </p>
            ) : (
              <LocationModal onClose={() => setSelectedTag(null)} />
            )}
          </div>
        )}

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
                    <X
                      size={20}
                      className="text-red-emergency"
                      strokeWidth={3}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ThreeColumnLayout>
  );
}
