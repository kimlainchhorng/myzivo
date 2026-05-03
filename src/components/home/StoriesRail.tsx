/**
 * StoriesRail — Instagram-style horizontal stories carousel for Home.
 *
 * Renders the user's "Your story" entry first (with a `+` add affordance)
 * followed by recently-active people. Unwatched stories show the IG
 * gradient ring; watched ones fall back to a hairline gray ring.
 *
 * Mock data only for now — wire to real recent-friend activity later.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Plus from "lucide-react/dist/esm/icons/plus";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  name: string;
  avatarUrl?: string;
  watched: boolean;
}

// Placeholder — swap for a real `useRecentFriends()` hook when ready.
const MOCK_STORIES: Story[] = [
  { id: "s1", name: "kim_l", avatarUrl: "https://i.pravatar.cc/100?img=12", watched: false },
  { id: "s2", name: "alex.t", avatarUrl: "https://i.pravatar.cc/100?img=32", watched: false },
  { id: "s3", name: "mira", avatarUrl: "https://i.pravatar.cc/100?img=48", watched: false },
  { id: "s4", name: "jonas", avatarUrl: "https://i.pravatar.cc/100?img=15", watched: false },
  { id: "s5", name: "sara_w", avatarUrl: "https://i.pravatar.cc/100?img=21", watched: true },
  { id: "s6", name: "dani", avatarUrl: "https://i.pravatar.cc/100?img=33", watched: true },
  { id: "s7", name: "rey", avatarUrl: "https://i.pravatar.cc/100?img=55", watched: true },
];

export default function StoriesRail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const [watched, setWatched] = useState<Set<string>>(
    () => new Set(MOCK_STORIES.filter((s) => s.watched).map((s) => s.id)),
  );

  const stories = MOCK_STORIES;
  const yourInitial = (profile?.full_name?.[0] || user?.email?.[0] || "Z").toUpperCase();
  const yourName = profile?.full_name?.split(" ")[0] || "Your story";

  return (
    <div className="border-b border-border">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-3">
        {/* "Your story" — always first, never has a story-ring */}
        <button
          type="button"
          onClick={() => navigate("/feed/new")}
          className="shrink-0 flex flex-col items-center gap-1 touch-manipulation active:opacity-70 transition-opacity"
        >
          <div className="relative">
            <Avatar className="h-[62px] w-[62px] border border-border">
              <AvatarImage src={profile?.avatar_url || undefined} alt={yourName} />
              <AvatarFallback className="bg-muted text-foreground text-base font-semibold">
                {yourInitial}
              </AvatarFallback>
            </Avatar>
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-2 ring-background"
            >
              <Plus className="w-3 h-3" strokeWidth={3} />
            </span>
          </div>
          <span className="text-[11px] text-foreground leading-none max-w-[64px] truncate">
            Your story
          </span>
        </button>

        {stories.map((s) => {
          const seen = watched.has(s.id);
          return (
            <motion.button
              key={s.id}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() =>
                setWatched((w) => {
                  if (w.has(s.id)) return w;
                  const next = new Set(w);
                  next.add(s.id);
                  return next;
                })
              }
              className="shrink-0 flex flex-col items-center gap-1 touch-manipulation"
              aria-label={`Open ${s.name}'s story`}
            >
              {/* IG gradient ring on unwatched, hairline gray on watched */}
              <span
                className={cn(
                  "rounded-full p-[2px]",
                  seen ? "bg-border" : "bg-ig-gradient",
                )}
              >
                <span className="block rounded-full p-[2px] bg-background">
                  <Avatar className="h-[58px] w-[58px]">
                    <AvatarImage src={s.avatarUrl} alt={s.name} />
                    <AvatarFallback className="bg-muted text-foreground text-sm font-semibold">
                      {s.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </span>
              </span>
              <span
                className={cn(
                  "text-[11px] leading-none max-w-[64px] truncate",
                  seen ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {s.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
