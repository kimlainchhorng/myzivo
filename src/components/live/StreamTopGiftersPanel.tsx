/**
 * StreamTopGiftersPanel — slide-in side panel showing top supporters
 * of the current stream session, ranked by coins gifted.
 * Updates in realtime through `useStreamTopGifters`.
 */
import { motion } from "framer-motion";
import X from "lucide-react/dist/esm/icons/x";
import Crown from "lucide-react/dist/esm/icons/crown";
import Gift from "lucide-react/dist/esm/icons/gift";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import type { StreamTopGifter } from "@/hooks/useStreamTopGifters";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  gifters: StreamTopGifter[];
  loading: boolean;
}

function formatCoins(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const RANK_COLORS = ["text-amber-400", "text-zinc-300", "text-orange-500"];

export default function StreamTopGiftersPanel({ open, onClose, gifters, loading }: Props) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ x: 280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 280, opacity: 0 }}
      transition={{ type: "spring", damping: 22 }}
      className="absolute right-2 z-40 w-64 bg-black/85 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 80px)", maxHeight: "60vh" }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
        <div className="flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-white">Top Supporters</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/80 transition-colors"
          aria-label="Close top supporters"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-2 space-y-1 max-h-[50vh] overflow-y-auto">
        {loading && gifters.length === 0 ? (
          <p className="text-[10px] text-white/40 text-center py-3">Loading…</p>
        ) : gifters.length === 0 ? (
          <p className="text-[10px] text-white/40 text-center py-3">
            Be the first to send a gift!
          </p>
        ) : (
          gifters.map((g) => (
            <div
              key={g.userId}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <span
                className={cn(
                  "w-5 text-center font-black text-[12px] shrink-0",
                  RANK_COLORS[g.rank - 1] ?? "text-white/40"
                )}
              >
                {g.rank}
              </span>
              <Avatar className="h-7 w-7 ring-1 ring-white/15">
                <AvatarImage src={g.avatar ?? undefined} />
                <AvatarFallback className="bg-zinc-800 text-white text-[10px] font-bold">
                  {g.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white truncate inline-flex items-center gap-1">
                  <span className="truncate">{g.name}</span>
                  {g.verified && <VerifiedBadge size={10} interactive={false} />}
                </p>
                <p className="text-[9px] text-white/50 leading-tight">
                  {g.giftsCount} gift{g.giftsCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Gift className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-300 tabular-nums">
                  {formatCoins(g.coinsTotal)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
