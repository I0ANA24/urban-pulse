const DOC_TYPE_ICONS: Record<string, string> = {
  "ID Card": "🪪",
  "Passport": "📕",
  "Driver License": "🚗",
  "Bank Card": "💳",
  "Other": "📄",
  "Unknown": "❓",
};

function parseDocumentType(aiTags: string | null): string | null {
  if (!aiTags) return null;
  try {
    const clean = aiTags.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed.documentType ?? null;
  } catch {
    return null;
  }
}

interface CardContentProps {
  description: string;
  isVerified?: boolean;
  yesCount?: number;
  type?: string;
  aiTags?: string | null;
}

export default function CardContent({ description, isVerified, yesCount, type, aiTags }: CardContentProps) {
  const showVerified = isVerified && (yesCount ?? 0) >= 3;
  const isDocument = type === "FoundDocument";
  const docType = isDocument ? parseDocumentType(aiTags ?? null) : null;
  const icon = docType ? (DOC_TYPE_ICONS[docType] ?? "📄") : null;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="text-white text-sm lg:text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {showVerified && (
        <span className="bg-green-light text-black px-3 py-1 rounded-md text-xs font-bold w-fit mt-1">
          Verified info
        </span>
      )}
    </div>
  );
}