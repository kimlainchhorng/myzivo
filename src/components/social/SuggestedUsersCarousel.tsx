/**
 * SuggestedUsersCarousel — Discover people you might want to follow
 * Instagram/Facebook "new account" style discover cards
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { optimizeAvatar } from "@/utils/optimizeAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Shield, Users } from "lucide-react";
import { useState, memo, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SuggestedUsersCarouselProps {
  /** Compact inline version for between-post injection */
  variant?: "default" | "inline";
}

const SuggestedUsersCarousel = memo(forwardRef<HTMLDivElement, SuggestedUsersCarouselProps>(function SuggestedUsersCarousel({ variant = "default" }, ref) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const { data: suggestions = [] } = useQuery({
    queryKey: ["suggested-users", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, avatar_url, bio, is_verified")
        .neq("id", user?.id || "")
        .limit(20);
      if (error) throw error;
      return (data || []).sort(() => Math.random() - 0.5).slice(0, 12);
    },
    enabled: !!user,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

  const handleFollow = async (profileId: string) => {
    if (!user) return;
    try {
      const { error } = await (supabase as any).from("user_followers").insert({
        follower_id: user.id,
        following_id: profileId,
      });
      if (error && !error.message?.includes("duplicate")) throw error;
      setFollowing((prev) => new Set([...prev, profileId]));
      toast.success("Following!");
      try {
        const { data: sp } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", user.id).single();
        await supabase.functions.invoke("send-push-notification", {
          body: { user_id: profileId, notification_type: "new_follower", title: "New Follower 🔔", body: `${sp?.full_name || "Someone"} started following you`, data: { type: "new_follower", follower_id: user.id, avatar_url: sp?.avatar_url, action_url: `/user/${user.id}` } },
        });
      } catch {}
    } catch {
      toast.error("Failed to follow");
    }
  };

  const visible = suggestions.filter((s: any) => !dismissed.has(s.id));

  if (!user || visible.length === 0) return null;

  // Inline variant — compact row for between-post injection
  if (variant === "inline") {
    const inlineVisible = visible.slice(0, 5);
    return (
      <div className="py-4 px-4 bg-card/50 border-y border-border/20">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">People you may know</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          <AnimatePresence>
            {inlineVisible.map((profile: any) => (
              <motion.div
                key={profile.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex-shrink-0 flex items-center gap-2.5 bg-background rounded-xl border border-border/30 px-3 py-2.5 min-w-[180px]"
              >
                <div onClick={() => navigate(`/user/${profile.id}`)} className="cursor-pointer">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={optimizeAvatar(profile.avatar_url, 40)} loading="lazy" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {profile.full_name?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0" onClick={() => navigate(`/user/${profile.id}`)}>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {profile.full_name || "User"}
                    </p>
                    {profile.is_verified && <Shield className="h-3 w-3 text-primary shrink-0" />}
                  </div>
                </div>
                <button
                  onClick={() => handleFollow(profile.id)}
                  disabled={following.has(profile.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                    following.has(profile.id)
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {following.has(profile.id) ? "✓" : "Follow"}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Default — full "Suggested for you" section
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between px-3 mb-2">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-xs font-bold text-foreground">Suggested for you</h3>
        </div>
        <button className="text-[10px] text-primary font-medium">See all</button>
      </div>

      <div className="flex gap-2 px-3 overflow-x-auto scrollbar-none pb-1">
        <AnimatePresence>
          {visible.map((profile: any) => (
            <motion.div
              key={profile.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-shrink-0 w-[120px] bg-card rounded-xl border border-border/30 p-2.5 text-center relative group"
            >
              {/* Dismiss */}
              <button
                onClick={() => setDismissed((prev) => new Set([...prev, profile.id]))}
                className="absolute top-1.5 right-1.5 p-0.5 rounded-full hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-2.5 w-2.5 text-muted-foreground" />
              </button>

              {/* Avatar */}
              <div
                onClick={() => navigate(`/user/${profile.id}`)}
                className="cursor-pointer"
              >
                <Avatar className="h-12 w-12 mx-auto mb-1.5 ring-2 ring-primary/10">
                  <AvatarImage src={optimizeAvatar(profile.avatar_url, 48)} loading="lazy" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {profile.full_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex items-center justify-center gap-0.5 mb-0.5">
                  <p className="text-[10px] font-semibold text-foreground truncate max-w-[90px]">
                    {profile.full_name || "User"}
                  </p>
                  {profile.is_verified && <Shield className="h-2.5 w-2.5 text-primary shrink-0" />}
                </div>

                {profile.bio && (
                  <p className="text-[9px] text-muted-foreground line-clamp-2 mb-1.5 leading-tight">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Follow button */}
              <button
                onClick={() => handleFollow(profile.id)}
                disabled={following.has(profile.id)}
                className={`w-full py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  following.has(profile.id)
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {following.has(profile.id) ? "Following" : "Follow"}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}));

export default SuggestedUsersCarousel;
