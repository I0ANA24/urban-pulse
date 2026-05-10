export type EventType = "General" | "Emergency" | "Skill" | "Lend" | "LostPet" | "FoundPet" | "FoundDocument";

export interface Event {
  id: number;
  description: string;
  type: EventType;
  latitude: number;
  longitude: number;
  tags: string[];
  imageUrl: string | null;
  createdByEmail: string;
  createdByFullName?: string;
  createdByAvatarUrl?: string;
  createdByUserId: number;
  isVerifiedUser?: boolean;
  yesCount?: number;
  noCount?: number;
  createdAt: string;
  isActive: boolean;
  isCompleted?: boolean;
  aiTags?: string | null;
  emergencySubType?: string | null;
  neighborhood?: string | null;
  clusterId?: number | null;
}