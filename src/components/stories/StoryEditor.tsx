/**
 * StoryEditor — Instagram-style editor for a single story.
 *
 * Renders the media inside a 9:16 canvas with filter applied. Lets the user
 * add text/emoji/poll/slider/question/mention/hashtag/location/time overlays
 * and drag them around. Filter strip, sticker tray, and text editor live in a
 * bottom panel; tool selection lives in the right rail (IG-style).
 *
 * Drag/select gestures live here. Pinch-rotate is intentionally out of scope
 * for v1; per-overlay scale is controlled by a slider when an overlay is
 * selected.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { STORY_FILTERS, getStoryFilter, type StoryFilterPreset } from "@/lib/storyFilters";
import type {
  StoryOverlay,
  TextOverlay,
  PollOverlay,
  SliderOverlay,
  QuestionOverlay,
  StoryFont,
} from "@/types/storyOverlays";
import StoryOverlayLayer from "./StoryOverlayLayer";
import Type from "lucide-react/dist/esm/icons/type";
import Smile from "lucide-react/dist/esm/icons/smile";
import SlidersHorizontal from "lucide-react/dist/esm/icons/sliders-horizontal";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Plus from "lucide-react/dist/esm/icons/plus";
import Minus from "lucide-react/dist/esm/icons/minus";
import RotateCw from "lucide-react/dist/esm/icons/rotate-cw";
import X from "lucide-react/dist/esm/icons/x";

export interface StoryEditorState {
  overlays: StoryOverlay[];
  filterPreset: string | null;
}

interface Props {
  mediaUrl: string;
  mediaType: "image" | "video";
  state: StoryEditorState;
  onChange: (state: StoryEditorState) => void;
  className?: string;
}

type Panel = null | "filter" | "sticker" | "text";

const EMOJI_PALETTE = [
  "😍", "🔥", "✨", "💯", "❤️", "😂", "🥺", "👀", "🙌", "💕",
  "🤩", "😎", "🎉", "🌟", "💖", "😭", "🥳", "💪", "🙏", "👑",
];

const TEXT_COLORS = ["#ffffff", "#000000", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
const TEXT_FONTS: { id: StoryFont; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "typewriter", label: "Type" },
  { id: "strong", label: "Strong" },
  { id: "neon", label: "Neon" },
];

function uid(): string {
  return `o_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function nextZ(overlays: StoryOverlay[]): number {
  return overlays.reduce((m, o) => Math.max(m, o.z), 0) + 1;
}

export default function StoryEditor({ mediaUrl, mediaType, state, onChange, className }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const filter = getStoryFilter(state.filterPreset);
  const selected = state.overlays.find((o) => o.id === selectedId) ?? null;

  const update = useCallback(
    (next: Partial<StoryEditorState>) => onChange({ ...state, ...next }),
    [state, onChange],
  );

  const replaceOverlay = useCallback(
    (id: string, mutator: (o: StoryOverlay) => StoryOverlay) => {
      update({ overlays: state.overlays.map((o) => (o.id === id ? mutator(o) : o)) });
    },
    [state.overlays, update],
  );

  const removeOverlay = useCallback(
    (id: string) => {
      update({ overlays: state.overlays.filter((o) => o.id !== id) });
      if (selectedId === id) setSelectedId(null);
      if (editingTextId === id) setEditingTextId(null);
    },
    [state.overlays, update, selectedId, editingTextId],
  );

  const addOverlay = useCallback(
    (o: StoryOverlay) => {
      update({ overlays: [...state.overlays, o] });
      setSelectedId(o.id);
    },
    [state.overlays, update],
  );

  /* ---------- Drag handler (pointer-based, normalized) ---------- */

  const dragStateRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const onCanvasPointerMove = (e: React.PointerEvent) => {
    const drag = dragStateRef.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width - drag.offsetX));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height - drag.offsetY));
    replaceOverlay(drag.id, (o) => ({ ...o, x, y } as StoryOverlay));
  };

  const onCanvasPointerUp = (e: React.PointerEvent) => {
    if (dragStateRef.current) {
      (e.currentTarget as HTMLDivElement).releasePointerCapture?.(e.pointerId);
      dragStateRef.current = null;
    }
  };

  const beginDrag = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    const overlay = state.overlays.find((o) => o.id === id);
    if (!rect || !overlay) return;
    const pointerNormX = (e.clientX - rect.left) / rect.width;
    const pointerNormY = (e.clientY - rect.top) / rect.height;
    dragStateRef.current = {
      id,
      offsetX: pointerNormX - overlay.x,
      offsetY: pointerNormY - overlay.y,
    };
    (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
    setSelectedId(id);
  };

  /* ---------- Add helpers per overlay type ---------- */

  const addText = () => {
    const o: TextOverlay = {
      id: uid(),
      type: "text",
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
      z: nextZ(state.overlays),
      text: "Tap to edit",
      color: "#ffffff",
      bg: null,
      font: "strong",
      align: "center",
    };
    addOverlay(o);
    setEditingTextId(o.id);
    setPanel("text");
  };

  const addEmoji = (emoji: string) => {
    addOverlay({
      id: uid(),
      type: "emoji",
      emoji,
      x: 0.5,
      y: 0.45,
      scale: 1,
      rotation: 0,
      z: nextZ(state.overlays),
    });
  };

  const addPoll = () => {
    const o: PollOverlay = {
      id: uid(),
      type: "poll",
      question: "Ask a question…",
      options: ["Yes", "No"],
      x: 0.5,
      y: 0.7,
      scale: 1,
      rotation: 0,
      z: nextZ(state.overlays),
    };
    addOverlay(o);
  };

  const addSlider = () => {
    const o: SliderOverlay = {
      id: uid(),
      type: "slider",
      question: "How much do you like it?",
      emoji: "😍",
      x: 0.5,
      y: 0.7,
      scale: 1,
      rotation: 0,
      z: nextZ(state.overlays),
    };
    addOverlay(o);
  };

  const addQuestion = () => {
    const o: QuestionOverlay = {
      id: uid(),
      type: "question",
      prompt: "Ask me anything",
      x: 0.5,
      y: 0.7,
      scale: 1,
      rotation: 0,
      z: nextZ(state.overlays),
    };
    addOverlay(o);
  };

  const addHashtag = () => {
    addOverlay({
      id: uid(),
      type: "hashtag",
      tag: "trending",
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
      z: nextZ(state.overlays),
    });
  };

  const addTime = () => {
    addOverlay({
      id: uid(),
      type: "time",
      format: "time",
      x: 0.5,
      y: 0.15,
      scale: 1,
      rotation: 0,
      z: nextZ(state.overlays),
    });
  };

  /* ---------- Render ---------- */

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-2xl bg-black select-none", className)}
      onClick={() => {
        setSelectedId(null);
        setEditingTextId(null);
      }}
    >
      {/* Canvas: 9:16 media + overlays */}
      <div
        ref={canvasRef}
        className="relative w-full aspect-[9/16] touch-none"
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
        onPointerCancel={onCanvasPointerUp}
      >
        <FilteredMedia mediaUrl={mediaUrl} mediaType={mediaType} preset={filter} />

        {/* Overlays are rendered via the shared layer, but we wrap each in a
            pointer-handling div so drag stays here, not in the renderer. */}
        <div className="pointer-events-none absolute inset-0">
          <StoryOverlayLayer overlays={state.overlays} mode="compose" disabled />
        </div>

        {/* Invisible pointer hit areas for drag + select (one per overlay) */}
        <div className="absolute inset-0">
          {state.overlays.map((o) => (
            <button
              key={o.id}
              type="button"
              onPointerDown={(e) => beginDrag(o.id, e)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(o.id);
                if (o.type === "text") setEditingTextId(o.id);
              }}
              aria-label={`Move overlay ${o.type}`}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2",
                "h-16 w-16 rounded-full",
                selectedId === o.id ? "ring-2 ring-white/80" : "ring-0",
              )}
              style={{
                left: `${o.x * 100}%`,
                top: `${o.y * 100}%`,
                background: "transparent",
                transform: `translate(-50%, -50%) scale(${Math.max(o.scale, 1)})`,
              }}
            />
          ))}
        </div>

        {/* Top-right tool rail */}
        <div className="absolute right-2 top-2 flex flex-col gap-2">
          <ToolButton active={panel === "text"} onClick={(e) => { e.stopPropagation(); addText(); }} label="Add text">
            <Type className="h-5 w-5" />
          </ToolButton>
          <ToolButton active={panel === "sticker"} onClick={(e) => { e.stopPropagation(); setPanel("sticker"); }} label="Add sticker">
            <Smile className="h-5 w-5" />
          </ToolButton>
          <ToolButton active={panel === "filter"} onClick={(e) => { e.stopPropagation(); setPanel(panel === "filter" ? null : "filter"); }} label="Choose filter">
            <SlidersHorizontal className="h-5 w-5" />
          </ToolButton>
        </div>

        {/* Selected overlay quick actions (top-left) */}
        {selected && (
          <div
            className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <IconBtn onClick={() => replaceOverlay(selected.id, (o) => ({ ...o, scale: Math.max(0.3, o.scale - 0.1) } as StoryOverlay))} label="Smaller">
              <Minus className="h-4 w-4" />
            </IconBtn>
            <IconBtn onClick={() => replaceOverlay(selected.id, (o) => ({ ...o, scale: Math.min(4, o.scale + 0.1) } as StoryOverlay))} label="Bigger">
              <Plus className="h-4 w-4" />
            </IconBtn>
            <IconBtn onClick={() => replaceOverlay(selected.id, (o) => ({ ...o, rotation: (o.rotation + 15) % 360 } as StoryOverlay))} label="Rotate">
              <RotateCw className="h-4 w-4" />
            </IconBtn>
            <IconBtn onClick={() => removeOverlay(selected.id)} label="Delete">
              <Trash2 className="h-4 w-4" />
            </IconBtn>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      {panel && (
        <div
          className="border-t border-white/10 bg-black/85 backdrop-blur p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-white/70">
            <span>{panel === "filter" ? "Filter" : panel === "sticker" ? "Stickers" : "Text"}</span>
            <button type="button" aria-label="Close panel" onClick={() => setPanel(null)} className="rounded-full p-1 hover:bg-white/10">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
          {panel === "filter" && (
            <FilterStrip mediaUrl={mediaUrl} active={state.filterPreset} onPick={(id) => update({ filterPreset: id })} />
          )}
          {panel === "sticker" && (
            <StickerTray
              onPickEmoji={addEmoji}
              onPoll={addPoll}
              onSlider={addSlider}
              onQuestion={addQuestion}
              onHashtag={addHashtag}
              onTime={addTime}
            />
          )}
          {panel === "text" && selected?.type === "text" && (
            <TextTool
              overlay={selected as TextOverlay}
              isEditing={editingTextId === selected.id}
              onChange={(patch) =>
                replaceOverlay(selected.id, (o) => ({ ...o, ...patch } as StoryOverlay))
              }
              onFinishEdit={() => setEditingTextId(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function FilteredMedia({
  mediaUrl,
  mediaType,
  preset,
}: {
  mediaUrl: string;
  mediaType: "image" | "video";
  preset: StoryFilterPreset;
}) {
  const filterStyle = { filter: preset.filter } as React.CSSProperties;
  return (
    <div className="absolute inset-0">
      {mediaType === "video" ? (
        <video
          src={mediaUrl}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          style={filterStyle}
        />
      ) : (
        <img src={mediaUrl} alt="" className="h-full w-full object-cover" style={filterStyle} />
      )}
      {preset.blend && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: preset.blend.color,
            mixBlendMode: preset.blend.mode,
            opacity: preset.blend.opacity,
          }}
        />
      )}
    </div>
  );
}

function FilterStrip({
  mediaUrl,
  active,
  onPick,
}: {
  mediaUrl: string;
  active: string | null;
  onPick: (id: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {STORY_FILTERS.map((f) => {
        const isActive = (active ?? "none") === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onPick(f.id === "none" ? null : f.id)}
            className={cn(
              "relative shrink-0 overflow-hidden rounded-lg border-2 transition",
              isActive ? "border-white" : "border-transparent",
            )}
            style={{ width: 56, height: 80 }}
            aria-label={f.name}
          >
            <img src={mediaUrl} alt="" className="h-full w-full object-cover" style={{ filter: f.filter }} />
            {f.blend && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: f.blend.color,
                  mixBlendMode: f.blend.mode,
                  opacity: f.blend.opacity,
                }}
              />
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent py-1 text-[10px] font-bold text-white">
              {f.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function StickerTray({
  onPickEmoji,
  onPoll,
  onSlider,
  onQuestion,
  onHashtag,
  onTime,
}: {
  onPickEmoji: (emoji: string) => void;
  onPoll: () => void;
  onSlider: () => void;
  onQuestion: () => void;
  onHashtag: () => void;
  onTime: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <ActionChip onClick={onPoll}>📊 Poll</ActionChip>
        <ActionChip onClick={onSlider}>🎚️ Slider</ActionChip>
        <ActionChip onClick={onQuestion}>❓ Question</ActionChip>
        <ActionChip onClick={onHashtag}># Hashtag</ActionChip>
        <ActionChip onClick={onTime}>⏰ Time</ActionChip>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {EMOJI_PALETTE.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onPickEmoji(e)}
            className="aspect-square rounded-md text-2xl hover:bg-white/10 active:scale-95"
            aria-label={`Add emoji ${e}`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextTool({
  overlay,
  isEditing,
  onChange,
  onFinishEdit,
}: {
  overlay: TextOverlay;
  isEditing: boolean;
  onChange: (patch: Partial<TextOverlay>) => void;
  onFinishEdit: () => void;
}) {
  return (
    <div className="space-y-2">
      <input
        autoFocus={isEditing}
        value={overlay.text}
        maxLength={140}
        onChange={(e) => onChange({ text: e.target.value })}
        onBlur={onFinishEdit}
        placeholder="Type something…"
        className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-white/50">Font</span>
        {TEXT_FONTS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange({ font: f.id })}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-bold",
              overlay.font === f.id ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-white/50">Color</span>
        {TEXT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange({ color: c })}
            className={cn(
              "h-6 w-6 rounded-full border-2",
              overlay.color === c ? "border-white" : "border-white/20",
            )}
            style={{ background: c }}
            aria-label={`Color ${c}`}
          />
        ))}
        <button
          type="button"
          onClick={() => onChange({ bg: overlay.bg ? null : "#000000" })}
          className={cn(
            "ml-2 rounded-md px-2 py-1 text-[11px] font-bold",
            overlay.bg ? "bg-white text-black" : "bg-white/10 text-white",
          )}
        >
          {overlay.bg ? "Pill on" : "Pill off"}
        </button>
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  children,
  label,
}: {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition",
        active ? "bg-white text-black" : "bg-black/60 text-white hover:bg-black/70",
      )}
    >
      {children}
    </button>
  );
}

function IconBtn({ onClick, children, label }: { onClick: () => void; children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/15"
    >
      {children}
    </button>
  );
}

function ActionChip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-white/10 px-2 py-2 text-xs font-bold text-white hover:bg-white/20 active:scale-95"
    >
      {children}
    </button>
  );
}
