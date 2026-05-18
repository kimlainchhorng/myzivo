/**
 * Story filter presets — applied as CSS `filter` strings to <img>/<video>.
 * Names are inspired by IG presets but tuned independently. The filter pipeline
 * runs entirely in the browser; no server-side LUTs.
 *
 * Persisted as `stories.filter_preset` (id string). `null`/`"none"` = passthrough.
 */

export interface StoryFilterPreset {
  id: string;
  name: string;
  filter: string; // CSS filter value
  /**
   * Optional overlay blend layer to mimic film/LUT looks that pure CSS
   * filters can't reproduce. Rendered as an absolute-positioned div on top
   * of the media with mix-blend-mode.
   */
  blend?: {
    color: string;
    mode: "screen" | "multiply" | "overlay" | "soft-light" | "color" | "hue";
    opacity: number; // 0..1
  };
}

export const STORY_FILTERS: StoryFilterPreset[] = [
  { id: "none", name: "Normal", filter: "none" },
  {
    id: "clarendon",
    name: "Clarendon",
    filter: "contrast(1.2) saturate(1.35) brightness(1.05)",
  },
  {
    id: "gingham",
    name: "Gingham",
    filter: "brightness(1.05) hue-rotate(-10deg) sepia(0.04)",
    blend: { color: "#e6e6fa", mode: "soft-light", opacity: 0.25 },
  },
  {
    id: "moon",
    name: "Moon",
    filter: "grayscale(1) contrast(1.1) brightness(1.1)",
  },
  {
    id: "lark",
    name: "Lark",
    filter: "contrast(0.9) saturate(1.1) brightness(1.1)",
    blend: { color: "#dce6f2", mode: "soft-light", opacity: 0.2 },
  },
  {
    id: "reyes",
    name: "Reyes",
    filter: "sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)",
  },
  {
    id: "juno",
    name: "Juno",
    filter: "saturate(1.4) contrast(1.1)",
    blend: { color: "#ffd1a4", mode: "soft-light", opacity: 0.2 },
  },
  {
    id: "slumber",
    name: "Slumber",
    filter: "saturate(0.66) brightness(1.05)",
    blend: { color: "#facfa9", mode: "overlay", opacity: 0.4 },
  },
  {
    id: "crema",
    name: "Crema",
    filter: "sepia(0.3) contrast(0.95) saturate(0.85) brightness(1.05)",
  },
  {
    id: "ludwig",
    name: "Ludwig",
    filter: "saturate(0.85) contrast(1.05) sepia(0.06)",
    blend: { color: "#fff2cc", mode: "soft-light", opacity: 0.2 },
  },
  {
    id: "aden",
    name: "Aden",
    filter: "hue-rotate(-20deg) saturate(0.85) brightness(1.15)",
    blend: { color: "#420a44", mode: "screen", opacity: 0.18 },
  },
  {
    id: "perpetua",
    name: "Perpetua",
    filter: "contrast(1.05) saturate(1.1)",
    blend: { color: "#005b96", mode: "soft-light", opacity: 0.18 },
  },
  {
    id: "noir",
    name: "Noir",
    filter: "grayscale(1) contrast(1.3) brightness(0.95)",
  },
  {
    id: "vivid",
    name: "Vivid",
    filter: "saturate(1.6) contrast(1.15)",
  },
];

const FILTER_BY_ID = new Map(STORY_FILTERS.map((f) => [f.id, f] as const));

export function getStoryFilter(id: string | null | undefined): StoryFilterPreset {
  if (!id) return STORY_FILTERS[0];
  return FILTER_BY_ID.get(id) ?? STORY_FILTERS[0];
}
