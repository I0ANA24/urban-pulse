export type EventType = "General" | "Emergency" | "Skill" | "Lend";

export interface Event {
  id: number;
  description: string;
  type: EventType;
  latitude: number;
  longitude: number;
  tags: string[];
  imageUrl: string | null;
  createdByEmail: string;
  createdByUserId: number;
  createdAt: string;
  isActive: boolean;
}