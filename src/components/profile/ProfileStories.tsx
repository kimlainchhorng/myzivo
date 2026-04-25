/**
 * ProfileStories — Account-page "Your story" tile.
 * Backed by the shared `stories` pipeline; uses CreateStorySheet to compose
 * and StoryViewer to view existing stories.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateStorySheet from "@/components/profile/CreateStorySheet";
import StoryViewer, { StoryGroup } from "@/components/stories/StoryViewer";

const ProfileStories = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();

  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState<StoryGroup[] | null>(null);

  // My active stories (24h)
  const { data: myStories = [] } = useQuery({
    queryKey: ["profile-my-story", user?.id],
    enabled: !!user?.id,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data } = await supabase
        .from("stories" as any)
        .select("id, user_id, media_url, media_type, caption, created_at, expires_at, views_count")
        .eq("user_id", user!.id)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });
      return (data as any[]) || [];
    },
  });

  const hasStory = myStories.length > 0;
  const displayName = profile?.full_name || "You";

  const handleTap = () => {
    if (!user) return;
    if (hasStory) {
      const group: StoryGroup = {
        userId: user.id,
        userName: displayName,
        avatarUrl: profile?.avatar_url || undefined,
        stories: myStories.map((s: any) => ({
          id: s.id,
          mediaUrl: s.media_url,
          mediaType: s.media_type,
          caption: s.caption,
          createdAt: s.created_at,
          viewsCount: s.views_count ?? 0,
        })),
      };
      setViewing([group]);
    } else {
      setShowCreate(true);
    }
  };

  return (
    <>
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={handleTap}
          className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-card/75 px-2.5 py-2 shadow-sm backdrop-blur-xl"
        >
          <div className="relative">
            <div className={`h-11 w-11 rounded-full p-[2px] ${
              hasStory
                ? "bg-gradient-to-br from-primary via-green-400 to-emerald-500"
                : "border border-dashed border-primary/40 bg-muted/60"
            }`}>
              {profile?.avatar_url ? (
                <Avatar className="h-full w-full border-2 border-background">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                    {displayName[0]}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-background bg-primary/10">
                  <Camera className="h-4 w-4 text-primary/60" />
                </div>
              )}
            </div>
            {!hasStory && (
              <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary shadow-md">
                <Plus className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="text-left">
            <p className="text-[12px] font-bold leading-tight text-foreground">Your story</p>
            <p className="text-[10px] leading-tight text-muted-foreground">
              {hasStory ? "Tap to view" : "Tap to add"}
            </p>
          </div>
        </motion.button>
      </div>

      <CreateStorySheet open={showCreate} onClose={() => setShowCreate(false)} />

      {viewing && (
        <StoryViewer
          groups={viewing}
          startGroupIndex={0}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
};

export default ProfileStories;
