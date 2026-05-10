"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import ThreeColumnLayoutAdmin from "@/components/layout/ThreeColumnLayoutAdmin";
import { useUser } from "@/context/UserContext";

const API = "https://urbanpulsebackend-gedpgwakd5euh2bp.switzerlandnorth-01.azurewebsites.net";

export default function AddDocumentPage() {
  const router = useRouter();
  const { isAdmin } = useUser();
  const Layout = isAdmin ? ThreeColumnLayoutAdmin : ThreeColumnLayout;
  const [photo, setPhoto] = useState<File | null>(null);
  const [isBold, setIsBold] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const [posting, setPosting] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Describe where you found it, without revealing sensitive personal details...",
      }),
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
        class: "w-full bg-transparent text-white outline-none min-h-[150px] text-base focus:outline-none",
      },
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setPhoto(e.target.files[0]);
  };

  const handlePost = async () => {
    const description = editor?.getText() ?? "";

    if (!description.trim()) {
      alert("Please write where you found the document!");
      return;
    }
    if (!photo) {
      alert("A photo of the document is required so AI can identify it!");
      return;
    }

    setPosting(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("description", editor?.getHTML() ?? description);
    formData.append("type", "6"); 
    formData.append("latitude", "0");
    formData.append("longitude", "0");
    formData.append("tags", "FoundDocument");
    formData.append("file", photo);

    try {
      const res = await fetch(`${API}/api/event`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error:", res.status, errorText);
        alert(`Something went wrong: ${res.status}`);
        return;
        }
      router.push("/documents");
    } catch {
      alert("Connection error. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Layout>
      <div className="w-full pb-[8vh] lg:pb-0 flex flex-col">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.back()}
            className="bg-red-emergency text-white font-bold w-30 h-11 rounded-xl cursor-pointer hover:bg-red-emergency/80 transition-colors duration-100"
          >
            Discard
          </button>
          <button
            onClick={handlePost}
            disabled={posting}
            className="bg-green-light text-black w-30 py-2 rounded-xl font-bold cursor-pointer hover:bg-green-light/85 transition-colors duration-200 disabled:opacity-50"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>

        <div className="w-full p-4 bg-secondary rounded-[30px] mb-8">
          <div className="bg-[#464646] w-full h-50 rounded-[20px] p-5 border border-white/5 flex flex-col overflow-scroll">
            <EditorContent editor={editor} />
          </div>
          <div className="flex items-center justify-between mt-4 px-4">
            <div className="flex gap-4 items-center text-white">
              <button
                onClick={() => document.getElementById("docFileInput")?.click()}
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
              id="docFileInput"
              type="file"
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            {photo ? (
              <div className="border border-green-light text-green-light text-sm px-3 py-1.5 rounded-[10px]">
                Photo added ✓
              </div>
            ) : (
              <div className="border border-red-emergency/40 text-red-emergency/60 text-xs px-3 py-1.5 rounded-[10px]">
                Photo required
              </div>
            )}
          </div>
        </div>

        {photo && (
          <div className="animate-fade-up mb-6">
            <h2 className="text-white font-bold text-xl mb-3 border-b border-white/20 pb-2 uppercase">
              Preview
            </h2>
            <div className="w-full rounded-2xl overflow-hidden border border-white/10">
              <img
                src={URL.createObjectURL(photo)}
                alt="Document preview"
                className="w-full object-cover max-h-64"
              />
            </div>
            <p className="text-white/30 text-xs mt-2 px-1">
              🤖 AI will analyze this image after posting
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}