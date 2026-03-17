"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus } from "lucide-react";
import { EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

export default function AddPostPage() {
  const router = useRouter();

  const [isVerified, setIsVerified] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const [selectedTag, setSelectedTag] = useState<EventType | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  const [requestedItem, setRequestedItem] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const [isBold, setIsBold] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
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
    const description = editor?.getText() ?? "";

    if (!description || !selectedTag) {
      alert("Please write something and select a tag!");
      return;
    }

    if ((selectedTag === "Skill" || selectedTag === "Lend") && !requestedItem) {
      alert("Please specify the item/skill you need!");
      return;
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
    formData.append("latitude", "0");
    formData.append("longitude", "0");

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
    <div className="w-full min-h-screen bg-[#0E0E0E] px-6 py-8 flex flex-col font-inter">
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

      {/* editor & image upload */}
      <div className="bg-[#383838] rounded-3xl p-5 border border-white/5 flex flex-col mb-8">

        <EditorContent editor={editor} />

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-4 items-center text-white">
            <button
              onClick={() => document.getElementById("fileInput")?.click()}
              className="relative"
            >
              <ImagePlus size={24} />
              {photo && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border border-[#383838]"></div>
              )}
            </button>

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                editor?.chain().focus().toggleBold().run();
                setIsBold(!isBold);
              }}
              className={`font-bold transition-all ${
                isBold ? "text-white text-2xl" : "text-white/60 text-lg"
              }`}
            >
              B
            </button>

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                editor?.chain().focus().toggleUnderline().run();
                setIsUnderlineActive(!isUnderlineActive);
              }}
              className={`underline font-bold transition-all ${
                isUnderlineActive ? "text-white text-2xl" : "text-white/60 text-lg"
              }`}
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
          const isDisabled = (type === "Skill" || type === "Lend") && !isVerified;

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
                  ? `0 0 20px ${style.bgColor}80, inset 0 0 5px white`
                  : "none",
              }}
            >
              {style.title}
            </button>
          );
        })}
      </div>

      {/* SKILL / LEND Input Section */}
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