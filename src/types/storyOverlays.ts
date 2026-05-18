/**
 * Story overlay layers — text, stickers, polls, slider, question, etc.
 * Persisted as JSONB in `stories.overlays`. Discriminated union by `type`.
 *
 * Coordinates are normalized 0..1 relative to the story canvas (9:16),
 * so a single payload renders identically on any device size.
 */

export type StoryFont =
  | "classic"   // sans, regular
  | "modern"    // serif italic
  | "typewriter"
  | "strong"    // bold sans
  | "neon";     // glow

export type StoryTextAlign = "left" | "center" | "right";

interface OverlayBase {
  id: string;            // local uuid, used for React keys + response targeting
  x: number;             // 0..1 center X on the canvas
  y: number;             // 0..1 center Y on the canvas
  scale: number;         // 1 = default size
  rotation: number;      // degrees
  z: number;             // stacking order; higher = on top
}

export interface TextOverlay extends OverlayBase {
  type: "text";
  text: string;
  color: string;         // hex
  bg: string | null;     // hex pill background or null
  font: StoryFont;
  align: StoryTextAlign;
}

export interface EmojiOverlay extends OverlayBase {
  type: "emoji";
  emoji: string;
}

export interface MentionOverlay extends OverlayBase {
  type: "mention";
  userId: string;
  username: string;
}

export interface HashtagOverlay extends OverlayBase {
  type: "hashtag";
  tag: string;           // without the #
}

export interface LocationOverlay extends OverlayBase {
  type: "location";
  name: string;
  storeId?: string | null;
}

export interface PollOverlay extends OverlayBase {
  type: "poll";
  question: string;
  options: [string, string]; // exactly 2 options, IG-style
}

export interface SliderOverlay extends OverlayBase {
  type: "slider";
  question: string;
  emoji: string;         // anchor emoji that rides the slider
}

export interface QuestionOverlay extends OverlayBase {
  type: "question";
  prompt: string;        // e.g. "Ask me anything"
}

export interface TimeOverlay extends OverlayBase {
  type: "time";
  format: "time" | "date" | "countdown";
  targetIso?: string | null; // ISO string for countdown target
}

export type StoryOverlay =
  | TextOverlay
  | EmojiOverlay
  | MentionOverlay
  | HashtagOverlay
  | LocationOverlay
  | PollOverlay
  | SliderOverlay
  | QuestionOverlay
  | TimeOverlay;

export type StoryOverlayType = StoryOverlay["type"];

export type PollResponse = { option: 0 | 1 };
export type SliderResponse = { value: number }; // 0..1
export type QuestionResponse = { text: string };
export type OverlayResponseValue = PollResponse | SliderResponse | QuestionResponse;

export interface StoryOverlayResponse {
  id: string;
  storyId: string;
  overlayId: string;
  userId: string;
  responseType: "poll_vote" | "slider" | "question_reply";
  responseValue: OverlayResponseValue;
  createdAt: string;
}

/**
 * Validates and normalizes overlay data loaded from the DB.
 * Drops anything that doesn't match the schema rather than throwing —
 * a malformed overlay should never break the viewer.
 */
export function parseOverlays(raw: unknown): StoryOverlay[] {
  if (!Array.isArray(raw)) return [];
  const out: StoryOverlay[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.type !== "string") continue;
    const base = {
      id: o.id,
      x: clamp01(num(o.x, 0.5)),
      y: clamp01(num(o.y, 0.5)),
      scale: Math.max(0.1, Math.min(10, num(o.scale, 1))),
      rotation: num(o.rotation, 0),
      z: Math.floor(num(o.z, 0)),
    };
    switch (o.type) {
      case "text":
        out.push({
          ...base,
          type: "text",
          text: str(o.text, ""),
          color: str(o.color, "#ffffff"),
          bg: typeof o.bg === "string" ? o.bg : null,
          font: (["classic", "modern", "typewriter", "strong", "neon"] as const).includes(o.font as StoryFont)
            ? (o.font as StoryFont)
            : "classic",
          align: (["left", "center", "right"] as const).includes(o.align as StoryTextAlign)
            ? (o.align as StoryTextAlign)
            : "center",
        });
        break;
      case "emoji":
        out.push({ ...base, type: "emoji", emoji: str(o.emoji, "✨") });
        break;
      case "mention":
        out.push({
          ...base,
          type: "mention",
          userId: str(o.userId, ""),
          username: str(o.username, ""),
        });
        break;
      case "hashtag":
        out.push({ ...base, type: "hashtag", tag: str(o.tag, "").replace(/^#/, "") });
        break;
      case "location":
        out.push({
          ...base,
          type: "location",
          name: str(o.name, ""),
          storeId: typeof o.storeId === "string" ? o.storeId : null,
        });
        break;
      case "poll": {
        const opts = Array.isArray(o.options) ? o.options : [];
        out.push({
          ...base,
          type: "poll",
          question: str(o.question, ""),
          options: [str(opts[0], "Yes"), str(opts[1], "No")],
        });
        break;
      }
      case "slider":
        out.push({
          ...base,
          type: "slider",
          question: str(o.question, ""),
          emoji: str(o.emoji, "😍"),
        });
        break;
      case "question":
        out.push({ ...base, type: "question", prompt: str(o.prompt, "Ask me anything") });
        break;
      case "time":
        out.push({
          ...base,
          type: "time",
          format: (["time", "date", "countdown"] as const).includes(o.format as TimeOverlay["format"])
            ? (o.format as TimeOverlay["format"])
            : "time",
          targetIso: typeof o.targetIso === "string" ? o.targetIso : null,
        });
        break;
    }
  }
  return out.sort((a, b) => a.z - b.z);
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
