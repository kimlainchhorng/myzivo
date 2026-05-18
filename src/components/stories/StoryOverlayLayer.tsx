/**
 * StoryOverlayLayer — renders all overlay layers on top of a story's media.
 *
 * Used by both the composer (mode='compose') and the viewer (mode='view').
 * The composer drives drag/rotate/scale gestures externally; this component
 * only renders + handles overlay-internal interactions (poll vote, slider drag,
 * question reply tap).
 *
 * Coordinates in the overlay model are normalized 0..1 to the canvas, so a
 * single payload renders identically regardless of device width.
 */

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type {
  StoryOverlay,
  TextOverlay,
  EmojiOverlay,
  MentionOverlay,
  HashtagOverlay,
  LocationOverlay,
  PollOverlay,
  SliderOverlay,
  QuestionOverlay,
  TimeOverlay,
  StoryFont,
  OverlayResponseValue,
  PollResponse,
  SliderResponse,
} from "@/types/storyOverlays";
import { cn } from "@/lib/utils";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import AtSign from "lucide-react/dist/esm/icons/at-sign";
import Hash from "lucide-react/dist/esm/icons/hash";

export type StoryOverlayMode = "view" | "compose";

export interface OverlayAggregate {
  /** Poll: counts per option. */
  pollCounts?: [number, number];
  /** Slider: mean of all responses 0..1, plus count. */
  sliderMean?: number;
  sliderCount?: number;
}

interface Props {
  overlays: StoryOverlay[];
  mode: StoryOverlayMode;
  /** Aggregates for this viewer's display (poll %, slider avg). Keyed by overlay.id. */
  aggregates?: Record<string, OverlayAggregate>;
  /** This viewer's own past response per overlay. Keyed by overlay.id. */
  myResponses?: Record<string, OverlayResponseValue>;
  /** Called when the viewer interacts with an interactive overlay. */
  onRespond?: (overlayId: string, value: OverlayResponseValue) => void;
  /** Compose mode: called when the user taps an overlay (to select for editing). */
  onSelectOverlay?: (overlayId: string) => void;
  /** Compose mode: highlight a selected overlay. */
  selectedOverlayId?: string | null;
  /** Disable interactions (e.g. while uploading). */
  disabled?: boolean;
  className?: string;
}

const FONT_STYLES: Record<StoryFont, string> = {
  classic: "font-sans font-medium",
  modern: "font-serif italic",
  typewriter: "font-mono",
  strong: "font-sans font-black uppercase tracking-wide",
  neon: "font-sans font-bold",
};

export default function StoryOverlayLayer({
  overlays,
  mode,
  aggregates,
  myResponses,
  onRespond,
  onSelectOverlay,
  selectedOverlayId,
  disabled,
  className,
}: Props) {
  // Sort by z so DOM order matches stacking; we don't rely on z-index because
  // the absolutely-positioned children can stack with later draws on top.
  const sorted = useMemo(() => [...overlays].sort((a, b) => a.z - b.z), [overlays]);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden={mode === "view" ? undefined : true}
    >
      {sorted.map((o) => (
        <OverlayItem
          key={o.id}
          overlay={o}
          mode={mode}
          aggregate={aggregates?.[o.id]}
          myResponse={myResponses?.[o.id]}
          onRespond={onRespond}
          onSelectOverlay={onSelectOverlay}
          isSelected={selectedOverlayId === o.id}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function OverlayItem({
  overlay,
  mode,
  aggregate,
  myResponse,
  onRespond,
  onSelectOverlay,
  isSelected,
  disabled,
}: {
  overlay: StoryOverlay;
  mode: StoryOverlayMode;
  aggregate?: OverlayAggregate;
  myResponse?: OverlayResponseValue;
  onRespond?: (overlayId: string, value: OverlayResponseValue) => void;
  onSelectOverlay?: (overlayId: string) => void;
  isSelected?: boolean;
  disabled?: boolean;
}) {
  const transform = `translate(-50%, -50%) rotate(${overlay.rotation}deg) scale(${overlay.scale})`;
  const positionStyle: React.CSSProperties = {
    position: "absolute",
    left: `${overlay.x * 100}%`,
    top: `${overlay.y * 100}%`,
    transform,
    transformOrigin: "center center",
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode === "compose") {
      e.stopPropagation();
      onSelectOverlay?.(overlay.id);
    }
  };

  const interactive = mode === "view" && !disabled && !!onRespond;
  const wrapperCls = cn(
    "max-w-[80%]",
    mode === "compose" && "pointer-events-auto cursor-move",
    isSelected && "ring-2 ring-white/80 ring-offset-2 ring-offset-transparent rounded-md",
  );

  let body: React.ReactNode = null;
  switch (overlay.type) {
    case "text":
      body = <TextBody o={overlay} />;
      break;
    case "emoji":
      body = <EmojiBody o={overlay} />;
      break;
    case "mention":
      body = <MentionBody o={overlay} />;
      break;
    case "hashtag":
      body = <HashtagBody o={overlay} />;
      break;
    case "location":
      body = <LocationBody o={overlay} />;
      break;
    case "poll":
      body = (
        <PollBody
          o={overlay}
          interactive={interactive}
          aggregate={aggregate}
          myResponse={myResponse as PollResponse | undefined}
          onRespond={onRespond}
        />
      );
      break;
    case "slider":
      body = (
        <SliderBody
          o={overlay}
          interactive={interactive}
          aggregate={aggregate}
          myResponse={myResponse as SliderResponse | undefined}
          onRespond={onRespond}
        />
      );
      break;
    case "question":
      body = (
        <QuestionBody o={overlay} interactive={interactive} onRespond={onRespond} />
      );
      break;
    case "time":
      body = <TimeBody o={overlay} />;
      break;
  }

  return (
    <div style={positionStyle} className={wrapperCls} onClick={handleTap} onTouchStart={handleTap}>
      <div className={mode === "view" ? "pointer-events-auto" : ""}>{body}</div>
    </div>
  );
}

/* ---------- Visual bodies ---------- */

function TextBody({ o }: { o: TextOverlay }) {
  const style: React.CSSProperties = {
    color: o.color,
    textAlign: o.align,
    background: o.bg ?? undefined,
    textShadow: o.bg ? undefined : "0 2px 12px rgba(0,0,0,0.4)",
  };
  if (o.font === "neon") {
    style.textShadow = `0 0 6px ${o.color}, 0 0 18px ${o.color}, 0 2px 12px rgba(0,0,0,0.4)`;
  }
  return (
    <span
      className={cn(
        "inline-block whitespace-pre-wrap px-3 py-1 text-2xl leading-tight",
        FONT_STYLES[o.font],
        o.bg && "rounded-lg",
      )}
      style={style}
    >
      {o.text || " "}
    </span>
  );
}

function EmojiBody({ o }: { o: EmojiOverlay }) {
  return <span className="text-6xl leading-none drop-shadow-lg select-none">{o.emoji}</span>;
}

function MentionBody({ o }: { o: MentionOverlay }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-black shadow">
      <AtSign className="size-3.5" />
      {o.username}
    </span>
  );
}

function HashtagBody({ o }: { o: HashtagOverlay }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-sm font-bold text-white">
      <Hash className="size-3.5" />
      {o.tag}
    </span>
  );
}

function LocationBody({ o }: { o: LocationOverlay }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-black shadow">
      <MapPin className="size-3.5" />
      {o.name}
    </span>
  );
}

function PollBody({
  o,
  interactive,
  aggregate,
  myResponse,
  onRespond,
}: {
  o: PollOverlay;
  interactive: boolean;
  aggregate?: OverlayAggregate;
  myResponse?: PollResponse;
  onRespond?: (overlayId: string, value: OverlayResponseValue) => void;
}) {
  const counts = aggregate?.pollCounts ?? [0, 0];
  const total = counts[0] + counts[1];
  const showResults = !!myResponse;
  const pct = (i: 0 | 1) => (total === 0 ? 0 : Math.round((counts[i] / total) * 100));

  return (
    <div className="rounded-2xl bg-white/95 px-3 py-2 shadow-lg min-w-[220px]">
      {o.question && <div className="mb-2 text-center text-sm font-semibold text-black">{o.question}</div>}
      <div className="grid grid-cols-2 gap-1">
        {(["0", "1"] as const).map((k) => {
          const idx = Number(k) as 0 | 1;
          const picked = myResponse?.option === idx;
          return (
            <button
              key={k}
              type="button"
              disabled={!interactive || showResults}
              onClick={() => onRespond?.(o.id, { option: idx } satisfies PollResponse)}
              className={cn(
                "relative overflow-hidden rounded-xl px-2 py-2 text-sm font-bold",
                "bg-zinc-100 text-black",
                picked && "ring-2 ring-emerald-500",
                interactive && !showResults && "hover:bg-zinc-200 active:scale-[0.98]",
              )}
            >
              {showResults && (
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-100"
                  style={{ width: `${pct(idx)}%` }}
                  aria-hidden
                />
              )}
              <span className="relative flex items-center justify-between gap-2">
                <span className="truncate">{idx === 0 ? o.options[0] : o.options[1]}</span>
                {showResults && <span className="text-xs tabular-nums">{pct(idx)}%</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SliderBody({
  o,
  interactive,
  aggregate,
  myResponse,
  onRespond,
}: {
  o: SliderOverlay;
  interactive: boolean;
  aggregate?: OverlayAggregate;
  myResponse?: SliderResponse;
  onRespond?: (overlayId: string, value: OverlayResponseValue) => void;
}) {
  const [draft, setDraft] = useState<number>(myResponse?.value ?? 0.5);
  const trackRef = useRef<HTMLDivElement>(null);
  const committedRef = useRef(false);

  useEffect(() => {
    if (myResponse) setDraft(myResponse.value);
  }, [myResponse]);

  const commit = useCallback(
    (v: number) => {
      if (!interactive || committedRef.current) return;
      const clamped = Math.max(0, Math.min(1, v));
      setDraft(clamped);
      onRespond?.(o.id, { value: clamped } satisfies SliderResponse);
      committedRef.current = true;
    },
    [interactive, o.id, onRespond],
  );

  const pointerToValue = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return draft;
    return (clientX - rect.left) / rect.width;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraft(Math.max(0, Math.min(1, pointerToValue(e.clientX))));
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || e.buttons === 0) return;
    setDraft(Math.max(0, Math.min(1, pointerToValue(e.clientX))));
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    commit(pointerToValue(e.clientX));
  };

  const avg = aggregate?.sliderMean;

  return (
    <div className="rounded-2xl bg-white/95 px-3 py-3 shadow-lg min-w-[240px]">
      {o.question && <div className="mb-2 text-center text-sm font-semibold text-black">{o.question}</div>}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={cn(
          "relative h-7 select-none rounded-full bg-zinc-200",
          interactive && "cursor-pointer",
        )}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-300 to-rose-400"
          style={{ width: `${draft * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl"
          style={{ left: `${draft * 100}%` }}
          aria-hidden
        >
          {o.emoji}
        </div>
        {typeof avg === "number" && (
          <div
            className="absolute top-full mt-1 -translate-x-1/2 text-[10px] font-semibold text-zinc-700"
            style={{ left: `${avg * 100}%` }}
          >
            avg
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionBody({
  o,
  interactive,
  onRespond,
}: {
  o: QuestionOverlay;
  interactive: boolean;
  onRespond?: (overlayId: string, value: OverlayResponseValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return (
    <div className="rounded-2xl bg-white/95 px-3 py-2 shadow-lg min-w-[220px]">
      <div className="mb-2 text-center text-sm font-semibold text-black">{o.prompt}</div>
      {!open ? (
        <button
          type="button"
          disabled={!interactive}
          onClick={() => setOpen(true)}
          className="w-full rounded-full bg-zinc-100 px-3 py-2 text-left text-sm text-zinc-500 disabled:opacity-60"
        >
          Type something...
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 240))}
            className="min-w-0 flex-1 rounded-full bg-zinc-100 px-3 py-2 text-sm text-black outline-none"
            placeholder="Your reply"
          />
          <button
            type="button"
            disabled={!text.trim()}
            onClick={() => {
              onRespond?.(o.id, { text: text.trim() });
              setOpen(false);
              setText("");
            }}
            className="rounded-full bg-black px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

function TimeBody({ o }: { o: TimeOverlay }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  let text: string;
  if (o.format === "time") {
    text = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } else if (o.format === "date") {
    text = now.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } else {
    const target = o.targetIso ? new Date(o.targetIso).getTime() : now.getTime();
    const delta = Math.max(0, target - now.getTime());
    const d = Math.floor(delta / 86_400_000);
    const h = Math.floor((delta % 86_400_000) / 3_600_000);
    const m = Math.floor((delta % 3_600_000) / 60_000);
    text = d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  return (
    <span className="inline-block rounded-lg bg-black/60 px-3 py-1 text-sm font-bold text-white">
      {text}
    </span>
  );
}
