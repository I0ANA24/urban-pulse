import { EventType } from "@/types/Event";

export const EVENT_TAG_STYLES: Record<EventType, { title: string; textColor: string; bgColor: string }> = {
  General: { title: "GENERAL", textColor: "#4D3B03", bgColor: "#FFF081" },
  Emergency: { title: "EMERGENCY", textColor: "#FFFFFF", bgColor: "#A53A3A" },
  Skill: { title: "SKILL", textColor: "#04007D", bgColor: "#BEDCF5" },
  Lend: { title: "LEND", textColor: "#023612", bgColor: "#4ADE80" },
};

export const FILTER_OPTIONS = Object.values(EVENT_TAG_STYLES).map(style => style.title);