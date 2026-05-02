/**
 * MessageReactionsPopover — Telegram-style "who reacted" sheet.
 *
 * Tapping the reaction count on a chat bubble shows the count; long-pressing
 * (or right-clicking) shows this sheet with avatar + display name for every
 * user who reacted. Tabs let you filter by emoji when more than one was used.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import X from "lucide-react/dist/esm/icons/x";

interface ReactionGroup {
  emoji: string;
  users: string[]; // user_ids
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** All reaction groups for the message. */
  reactions: ReactionGroup[];
  /** Emoji to default-select; omit to default to the first/largest group. */
  initialEmoji?: string;
}

interface ProfileRow {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function MessageReactionsPopover({ open, onClose, reactions, initialEmoji }: Props) {
  const { user } = useAuth();
  const [activeEmoji, setActiveEmoji] = useState<string | null>(initialEmoji ?? null);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});

  // When the sheet opens, default to the requested emoji or the largest group.
  useEffect(() => {
    if (!open) return;
    if (initialEmoji && reactions.some((r) => r.emoji === initialEmoji)) {
      setActiveEmoji(initialEmoji);
    } else {
      setActiveEmoji(reactions[0]?.emoji ?? null);
    }
  }, [open, initialEmoji, reactions]);

  // Resolve user_ids → profile rows for every user across every emoji.
  // Done once per open so switching tabs is instant.
  useEffect(() => {
    if (!open) return;
    const allIds = Array.from(new Set(reactions.flatMap((r) => r.users)));
    if (allIds.length === 0) {
      setProfiles({});
      return;
    }
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", allIds);
      if (!alive) return;
      const map: Record<string, ProfileRow> = {};
      for (const p of (data || []) as ProfileRow[]) {
        map[p.user_id] = p;
      }
      setProfiles(map);
    })();
    return () => { alive = false; };
  }, [open, reactions]);

  const totalCount = useMemo(
    () => reactions.reduce((sum, r) => sum + r.users.length, 0),
    [reactions],
  );

  const activeUsers = useMemo(() => {
    if (activeEmoji === null) return reactions.flatMap((r) => r.users.map((u) => ({ emoji: r.emoji, userId: u })));
    const group = reactions.find((r) => r.emoji === activeEmoji);
    return (group?.users ?? []).map((u) => ({ emoji: group!.emoji, userId: u }));
  }, [activeEmoji, reactions]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
        aria-hidden="true"
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 380 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Reactions"
          className="w-full sm:w-[380px] sm:rounded-3xl sm:my-auto bg-background rounded-t-3xl border-t sm:border border-border/40 shadow-2xl max-h-[70vh] flex flex-col"
        >
          {/* Handle (mobile) */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-border/30">
            <div>
              <p className="text-[15px] font-semibold text-foreground">Reactions</p>
              <p className="text-[11px] text-muted-foreground">
                {totalCount} {totalCount === 1 ? "person" : "people"} reacted
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="min-w-[44px] min-h-[44px] -m-2 rounded-full hover:bg-muted/40 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Emoji tabs (only if more than one emoji used) */}
          {reactions.length > 1 && (
            <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide border-b border-border/20">
              <button
                onClick={() => setActiveEmoji(null)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors",
                  activeEmoji === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/60",
                )}
              >
                All {totalCount}
              </button>
              {reactions.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => setActiveEmoji(r.emoji)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors flex items-center gap-1",
                    activeEmoji === r.emoji
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/60",
                  )}
                >
                  <span className="text-sm leading-none">{r.emoji}</span>
                  <span>{r.users.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* User list */}
          <div className="flex-1 overflow-y-auto py-2 safe-area-bottom">
            {activeUsers.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No reactions yet</p>
            ) : (
              activeUsers.map(({ emoji, userId }) => {
                const profile = profiles[userId];
                const name = profile?.full_name || (userId === user?.id ? "You" : "Unknown user");
                const initials = (profile?.full_name || "?").trim().split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div
                    key={`${emoji}-${userId}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={profile?.avatar_url || undefined} alt="" />
                      <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {name}
                        {userId === user?.id && (
                          <span className="ml-1 text-[10px] text-muted-foreground">(you)</span>
                        )}
                      </p>
                    </div>
                    <span className="text-lg leading-none shrink-0" aria-hidden>{emoji}</span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
