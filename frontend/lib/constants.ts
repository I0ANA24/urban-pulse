import { EventType } from "@/types/Event";

export const EVENT_TAG_STYLES: Record<EventType, { title: string; textColor: string; bgColor: string }> = {
  General: { title: "GENERAL", textColor: "#4D3B03", bgColor: "#FFF081" },
  Emergency: { title: "EMERGENCY", textColor: "#FFFFFF", bgColor: "#A53A3A" },
  Skill: { title: "SKILL", textColor: "#04007D", bgColor: "#BEDCF5" },
  Lend: { title: "LEND", textColor: "#023612", bgColor: "#4ADE80" },
  LostPet: { title: "LOST PETS", textColor: "#4D3B03", bgColor: "#FFF081" },
  FoundPet: { title: "FOUND PETS", textColor: "#04007D", bgColor: "#BEDCF5" },
};

export const FILTER_OPTIONS = Object.values(EVENT_TAG_STYLES).map(style => style.title);

export const DEFAULT_INCIDENT_TYPES: { key: string; label: string; icon: string }[] = [
  { key: "POWER_OUTAGE", label: "Blackout", icon: "⚡" },
  { key: "FIRE", label: "Fire", icon: "🔥" },
  { key: "FLOOD", label: "Flood", icon: "🌊" },
  { key: "EARTHQUAKE", label: "Earthquake", icon: "🌍" },
  { key: "SEVERE_STORM", label: "Severe Storm", icon: "⛈️" },
  { key: "ROAD_BLOCKAGE", label: "Road Blockage", icon: "🚧" },
  { key: "INFRASTRUCTURE_DAMAGE", label: "Infrastructure Damage", icon: "🏗️" },
  { key: "OTHER", label: "Other", icon: "⚠️" },
];