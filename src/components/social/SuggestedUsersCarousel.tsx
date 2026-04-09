/**
 * SuggestedUsersCarousel — Discover people you might want to follow
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { optimizeAvatar } from "@/utils/optimizeAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, X, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SuggestedUsersCarousel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const { data: suggestions = [] } = useQuery({
    queryKey: ["suggested-users", user?.id],
    queryFn: async () => {
      // Get profiles the user doesn't follow yet
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, avatar_url, bio, is_verified")
        .neq("id", user?.id || "")
        .limit(15);
      if (error) throw error;
      return (data || []).sort(() => Math.random() - 0.5).slice(0, 8);
    },
    enabled: !!user,
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
    } catch {
      toast.error("Failed to follow");
    }
  };

  const visible = suggestions.filter((s: any) => !dismissed.has(s.id));

  if (!user || visible.length === 0) return null;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="text-sm font-bold text-foreground">Suggested for you</h3>
        <button className="text-xs text-primary font-medium">See all</button>
      </div>

      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-1">
        <AnimatePresence>
          {visible.map((profile: any) => (
            <motion.div
              key={profile.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-shrink-0 w-[140px] bg-card rounded-2xl border border-border/30 p-3 text-center relative"
            >
              {/* Dismiss */}
              <button
                onClick={() => setDismissed((prev) => new Set([...prev, profile.id]))}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>

              {/* Avatar */}
              <div
                onClick={() => navigate(`/user/${profile.id}`)}
                className="cursor-pointer"
              >
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarImage src={optimizeAvatar(profile.avatar_url, 64)} loading="lazy" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {profile.full_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <p className="text-xs font-semibold text-foreground truncate max-w-[100px]">
                    {profile.full_name || "User"}
                  </p>
                  {profile.is_verified && <Shield className="h-3 w-3 text-primary shrink-0" />}
                </div>

                {profile.bio && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2 leading-tight">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Follow button */}
              <button
                onClick={() => handleFollow(profile.id)}
                disabled={following.has(profile.id)}
                className={`w-full py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
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
}
