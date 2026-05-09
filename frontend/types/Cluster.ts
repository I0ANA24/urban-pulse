import { Event } from "./Event";

export interface Cluster {
  id: number;
  subType: string;
  centerLatitude: number;
  centerLongitude: number;
  isResolved: boolean;
  eventCount: number;
  createdAt: string;
  latestEvent: Event | null;
  events?: Event[];
  neighborhood?: string | null;
}
