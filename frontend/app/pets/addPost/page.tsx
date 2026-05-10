"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EventType } from "@/types/Event";
import { EVENT_TAG_STYLES } from "@/lib/constants";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import PostEditor, { PostEditorRef } from "@/components/post/PostEditor";
import PostFormActions from "@/components/post/PostFormActions";
import { API_BASE_URL as API } from "@/lib/api";

const PET_TAGS: EventType[] = ["LostPet", "FoundPet"];

export default function AddPetPostPage() {
  const router = useRouter();
  const editorRef = useRef<PostEditorRef>(null);
  const [selectedTag, setSelectedTag] = useState<EventType | null>(null);

  const handlePost = async () => {
    const description = editorRef.current?.getText() ?? "";

    if (!description.trim()) {
      alert("Please write something!");
      return;
    }
    if (!selectedTag) {
      alert("Please select a tag!");
      return;
    }

    const token = localStorage.getItem("token");
    const typeMap: Record<string, number> = {
      LostPet: 4,
      FoundPet: 5,
    };

    const formData = new FormData();
    formData.append("description", editorRef.current?.getHTML() ?? description);
    formData.append("type", typeMap[selectedTag].toString());
    formData.append("latitude", "0");
    formData.append("longitude", "0");
    formData.append("tags", selectedTag);

    const photo = editorRef.current?.getPhoto();
    if (photo) formData.append("file", photo);

    try {
      const res = await fetch(`${API}/api/event`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        alert("Something went wrong. Please try again.");
        return;
      }
      router.push("/pets/posts");
    } catch {
      alert("Connection error. Please try again.");
    }
  };

  return (
    <ThreeColumnLayout>
      <div className="w-full pb-[8vh] lg:pb-0 flex flex-col">

        <PostFormActions
          onDiscard={() => router.back()}
          onPost={handlePost}
        />

        <PostEditor
          ref={editorRef}
          placeholder="Describe the pet — name, appearance, location..."
        />

        <h2 className="text-white font-bold text-2xl mt-8 mb-4 border-b-2 border-white/20 pb-2">
          TAGS
        </h2>

        <div className="flex gap-3 px-1 py-1">
          {PET_TAGS.map((type) => {
            const style = EVENT_TAG_STYLES[type];
            const isSelected = selectedTag === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedTag(type)}
                className="px-5 py-2.5 rounded-[10px] text-[10px] font-bold uppercase transition-all cursor-pointer"
                style={{
                  backgroundColor: style.bgColor,
                  color: style.textColor,
                  boxShadow: isSelected
                    ? `0 0 10px ${style.bgColor}80, inset 0 0 3px white`
                    : "none",
                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                }}
              >
                {style.title}
              </button>
            );
          })}
        </div>

      </div>
    </ThreeColumnLayout>
  );
}
