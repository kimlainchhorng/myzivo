/**
 * TrendingHashtags — horizontal chip row of the most-used hashtags in the
 * current feed. Tapping a chip filters the feed to posts containing it.
 *
 * Computed client-side from the loaded feed posts so we don't need a separate
 * DB round trip. The chip row is hidden when the user is filtering and the
 * filter button itself shows the active tag.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import Hash from "lucide-react/dist/esm/icons/hash";
import X from "lucide-react/dist/esm/icons/x";

interface FeedPostLike {
  caption?: string | null;
}

interface Props {
  posts: FeedPostLike[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
  /** Show at most this many tags. */
  limit?: number;
  /** "overlay" = absolute, dark background (Reels). "inline" = inline, theme-aware (Feed). */
  variant?: "overlay" | "inline";
}

const TAG_RE = /#([\p{L}\p{N}_]{2,30})/gu;

function extractHashtags(posts: FeedPostLike[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of posts) {
    if (!p.caption) continue;
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    TAG_RE.lastIndex = 0;
    while ((m = TAG_RE.exec(p.caption)) !== null) {
      const tag = m[1].toLowerCase();
      if (seen.has(tag)) continue;
      seen.add(tag);
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export default function TrendingHashtags({ posts, selected, onSelect, limit = 12, variant = "overlay" }: Props) {
  const tags = useMemo(() => extractHashtags(posts).slice(0, limit), [posts, limit]);

  if (tags.length === 0 && !selected) return null;

  // ── Inline variant (theme-aware, e.g. ReelsFeedPage list) ─────────────────
  if (variant === "inline") {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {selected && (
          <button
            onClick={() => onSelect(null)}
            className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-2 sm:px-3 sm:py-1.5 text-[13px] sm:text-xs font-semibold text-primary-foreground shadow-sm"
          >
            #{selected}
            <X className="h-3 w-3" />
          </button>
        )}
        {!selected &&
          tags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => onSelect(tag)}
              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-muted/40 px-3.5 py-2 sm:px-3 sm:py-1.5 text-[13px] sm:text-xs font-medium text-foreground hover:bg-muted active:scale-95"
            >
              <Hash className="h-3 w-3 text-primary" />
              {tag}
              <span className="text-muted-foreground text-[10px]">{count}</span>
            </button>
          ))}
      </div>
    );
  }

  // ── Overlay variant (default, e.g. /reels TikTok-style page) ──────────────
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute left-0 right-0 top-14 z-40 px-3"
      style={{ paddingTop: "var(--zivo-safe-top-overlay)" }}
    >
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {selected && (
          <button
            onClick={() => onSelect(null)}
            className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3.5 py-2 sm:px-3 sm:py-1.5 text-[13px] sm:text-xs font-semibold text-white shadow-md"
          >
            #{selected}
            <X className="h-3 w-3" />
          </button>
        )}
        {!selected &&
          tags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => onSelect(tag)}
              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-3.5 py-2 sm:px-3 sm:py-1.5 text-[13px] sm:text-xs font-medium text-white border border-white/10 hover:bg-black/60 active:scale-95"
            >
              <Hash className="h-3 w-3 text-emerald-400" />
              {tag}
              <span className="text-white/50 text-[10px]">{count}</span>
            </button>
          ))}
      </div>
    </motion.div>
  );
}

/**
 * Predicate: does a post's caption contain the given hashtag (case-insensitive)?
 */
export function postHasHashtag(caption: string | null | undefined, tag: string): boolean {
  if (!caption) return false;
  const re = new RegExp(`#${tag.replace(/[^\p{L}\p{N}_]/gu, "\\$&")}\\b`, "iu");
  return re.test(caption);
}
