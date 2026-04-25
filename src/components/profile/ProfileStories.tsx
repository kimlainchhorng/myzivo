/**
 * ProfileStories — Facebook-style horizontal ring carousel.
 * Shows "Your story" + every friend with active stories. Reuses the
 * shared `["feed-story-users"]` cache so Profile/Feed/Chat stay in sync.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import CreateStorySheet from "@/components/profile/CreateStorySheet";
import StoryViewer, { StoryGroup } from "@/components/stories/StoryViewer";

interface RawStory {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  audio_url: string | null;
  created_at: string;
  expires_at: string;
  views_count: number | null;
}

const ProfileStories = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState<{ groups: StoryGroup[]; startIndex: number } | null>(null);

  // All active stories across friends + self (drives the ring carousel)
  const { data: allStories = [], isLoading } = useQuery({
    queryKey: ["feed-story-users"],
    enabled: !!user?.id,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data } = await supabase
        .from("stories" as any)
        .select("id, user_id, media_url, media_type, caption, audio_url, created_at, expires_at, views_count")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });
      return ((data as any[]) || []) as RawStory[];
    },
  });

  // Story IDs current user has viewed → drives "fully viewed" ring color
  const { data: viewedIds = new Set<string>() } = useQuery({
    queryKey: ["my-story-views", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("story_views" as any)
        .select("story_id")
        .eq("viewer_id", user!.id);
      return new Set(((data as any[]) || []).map((v: any) => v.story_id));
    },
  });

  // Profiles for everyone with an active story
  const userIds = useMemo(
    () => [...new Set(allStories.map((s) => s.user_id))],
    [allStories]
  );
  const { data: profileMap = new Map() } = useQuery({
    queryKey: ["story-author-profiles", userIds.sort().join(",")],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);
      return new Map((data || []).map((p: any) => [p.id, p]));
    },
  });

  // Group stories by user → StoryGroup[] (current user always first)
  const groups: StoryGroup[] = useMemo(() => {
    const byUser = new Map<string, RawStory[]>();
    for (const s of allStories) {
      if (!byUser.has(s.user_id)) byUser.set(s.user_id, []);
      byUser.get(s.user_id)!.push(s);
    }
    const out: StoryGroup[] = [];
    for (const [uid, list] of byUser.entries()) {
      const p = profileMap.get(uid);
      out.push({
        userId: uid,
        userName: uid === user?.id ? (profile?.full_name || "You") : (p?.full_name || "User"),
        avatarUrl: uid === user?.id ? (profile?.avatar_url || undefined) : (p?.avatar_url || undefined),
        stories: list.map((s) => ({
          id: s.id,
          mediaUrl: s.media_url,
          mediaType: s.media_type,
          caption: s.caption || undefined,
          audioUrl: s.audio_url || undefined,
          createdAt: s.created_at,
          viewsCount: s.views_count ?? 0,
        })),
      });
    }
    // Sort: me first, then by most recent story
    out.sort((a, b) => {
      if (a.userId === user?.id) return -1;
      if (b.userId === user?.id) return 1;
      const aLast = a.stories[a.stories.length - 1].createdAt;
      const bLast = b.stories[b.stories.length - 1].createdAt;
      return bLast.localeCompare(aLast);
    });
    return out;
  }, [allStories, profileMap, user?.id, profile?.full_name, profile?.avatar_url]);

  const myGroup = groups.find((g) => g.userId === user?.id);
  const friendGroups = groups.filter((g) => g.userId !== user?.id);
  const hasMyStory = !!myGroup;

  const openViewer = (groupUserId: string) => {
    const idx = groups.findIndex((g) => g.userId === groupUserId);
    if (idx === -1) return;
    setViewing({ groups, startIndex: idx });
  };

  const handleViewerClose = () => {
    setViewing(null);
    queryClient.invalidateQueries({ queryKey: ["my-story-views"] });
    queryClient.invalidateQueries({ queryKey: ["feed-story-users"] });
  };

  const isFullyViewed = (g: StoryGroup) =>
    g.userId !== user?.id && g.stories.every((s) => viewedIds.has(s.id));

  return (
    <>
      {/* Horizontal ring carousel */}
      <div className="-mx-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-start gap-3 px-2 py-1 snap-x snap-mandatory">
          {/* Your story tile (always first) */}
          <button
            onClick={() => (hasMyStory ? openViewer(user!.id) : setShowCreate(true))}
            className="snap-start shrink-0 flex flex-col items-center gap-1 w-[68px]"
          >
            <motion.div whileTap={{ scale: 0.92 }} className="relative">
              <div
                className={cn(
                  "h-16 w-16 rounded-full p-[2.5px]",
                  hasMyStory
                    ? "bg-gradient-to-br from-primary via-emerald-400 to-emerald-600"
                    : "border-2 border-dashed border-primary/40 bg-muted/40"
                )}
              >
                {profile?.avatar_url ? (
                  <Avatar className="h-full w-full border-2 border-background">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                      {(profile?.full_name || "Y")[0]}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-background bg-primary/10">
                    <Camera className="h-5 w-5 text-primary/60" />
                  </div>
                )}
              </div>
              {/* Add badge when no story yet */}
              {!hasMyStory && (
                <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary shadow-md">
                  <Plus className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              {/* Segment count badge */}
              {hasMyStory && myGroup!.stories.length > 1 && (
                <div className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full border-2 border-background bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                  {myGroup!.stories.length}
                </div>
              )}
            </motion.div>
            <span className="text-[11px] font-semibold leading-tight text-foreground truncate max-w-[68px] text-center">
              {hasMyStory ? "Your story" : "Add story"}
            </span>
          </button>

          {/* Loading skeletons */}
          {isLoading && friendGroups.length === 0 && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 flex flex-col items-center gap-1 w-[68px]">
                  <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                  <div className="h-2.5 w-12 rounded-full bg-muted animate-pulse" />
                </div>
              ))}
            </>
          )}

          {/* Friend rings */}
          {friendGroups.map((g) => {
            const fullyViewed = isFullyViewed(g);
            return (
              <button
                key={g.userId}
                onClick={() => openViewer(g.userId)}
                className="snap-start shrink-0 flex flex-col items-center gap-1 w-[68px]"
              >
                <motion.div whileTap={{ scale: 0.92 }} className="relative">
                  <div
                    className={cn(
                      "h-16 w-16 rounded-full p-[2.5px]",
                      fullyViewed
                        ? "bg-muted-foreground/30"
                        : "bg-gradient-to-br from-primary via-emerald-400 to-emerald-600"
                    )}
                  >
                    <Avatar className="h-full w-full border-2 border-background">
                      <AvatarImage src={g.avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                        {g.userName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {g.stories.length > 1 && (
                    <div className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full border-2 border-background bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                      {g.stories.length}
                    </div>
                  )}
                </motion.div>
                <span className="text-[11px] leading-tight text-foreground truncate max-w-[68px] text-center">
                  {g.userName.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <CreateStorySheet open={showCreate} onClose={() => setShowCreate(false)} />

      {viewing && (
        <StoryViewer
          groups={viewing.groups}
          startGroupIndex={viewing.startIndex}
          onClose={handleViewerClose}
        />
      )}
    </>
  );
};

export default ProfileStories;
