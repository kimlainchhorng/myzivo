/**
 * FeedStoryRing — Horizontal scrollable story rings for the feed page.
 * Tapping a ring opens the shared StoryViewer via a deep-linked URL
 * (`?story=<story_id>`), so the same link can be shared and reopened anywhere.
 *
 * The "Add story" affordance opens the shared `CreateStorySheet` (the same
 * premium bottom sheet used on Profile) instead of launching the raw native
 * iOS/Android file chooser, which on Safari renders as a floating top-left
 * popover detached from any trigger.
 */
import { lazy, Suspense, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { optimizeAvatar } from "@/utils/optimizeAvatar";
import StoryViewer, { StoryGroup } from "@/components/stories/StoryViewer";
import { useStoryDeepLink, useStoryViewerLocation } from "@/hooks/useStoryDeepLink";
import { invalidateAllStoryCaches } from "@/lib/storiesCache";
import { useMyStoryViews } from "@/hooks/useMyStoryViews";

const CreateStorySheet = lazy(() => import("@/components/profile/CreateStorySheet"));

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

export default function FeedStoryRing() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const { activeStoryId, openStory, closeStory, updateStory } = useStoryDeepLink({ source: "feed" });

  const { data: rawStories = [] } = useQuery({
    queryKey: ["feed-story-users"],
    enabled: !!user,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("stories")
        .select("id, user_id, media_url, media_type, caption, audio_url, created_at, expires_at, views_count")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });
      return ((data as any[]) || []) as RawStory[];
    },
  });

  const { viewedIds } = useMyStoryViews();

  const userIds = useMemo(() => [...new Set(rawStories.map((s) => s.user_id))], [rawStories]);
  const profileKey = useMemo(() => [...userIds].sort().join(","), [userIds]);

  const { data: profileMap = new Map() } = useQuery({
    queryKey: ["feed-story-profiles", profileKey],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, avatar_url")
        .or(`id.in.(${userIds.join(",")}),user_id.in.(${userIds.join(",")})`);
      const map = new Map<string, any>();
      for (const p of data || []) {
        if ((p as any).id) map.set((p as any).id, p);
        if ((p as any).user_id) map.set((p as any).user_id, p);
      }
      return map;
    },
  });

  const groups: StoryGroup[] = useMemo(() => {
    const byUser = new Map<string, RawStory[]>();
    for (const s of rawStories) {
      if (!byUser.has(s.user_id)) byUser.set(s.user_id, []);
      byUser.get(s.user_id)!.push(s);
    }
    const out: StoryGroup[] = [];
    for (const [uid, list] of byUser.entries()) {
      const p = profileMap.get(uid);
      out.push({
        userId: uid,
        userName: p?.full_name || "User",
        avatarUrl: p?.avatar_url || undefined,
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
    // Put current user first
    const myIdx = out.findIndex((g) => g.userId === user?.id);
    if (myIdx > 0) {
      const [mine] = out.splice(myIdx, 1);
      out.unshift(mine);
    }
    return out;
  }, [rawStories, profileMap, user?.id]);

  const viewerLocation = useStoryViewerLocation(groups, activeStoryId);

  const hasMyStory = groups.some((g) => g.userId === user?.id);

  const handleRingClick = (group: StoryGroup) => {
    if (group.stories.length === 0) return;
    openStory(group.stories[0].id);
  };

  const handleViewerClose = (meta?: Parameters<typeof closeStory>[0]) => {
    closeStory(meta);
    invalidateAllStoryCaches(queryClient, user?.id);
  };

  if (!user) return null;

  const groupHasUnviewed = (g: StoryGroup) =>
    g.userId !== user.id && g.stories.some((s) => !viewedIds.has(s.id));

  return (
    <>
      <div className="flex gap-2.5 px-3 py-2 overflow-x-auto scrollbar-none border-b border-border/20">
        {/* Add story button */}
        <button
          onClick={() => {
            const myGroup = groups.find((g) => g.userId === user.id);
            if (myGroup) handleRingClick(myGroup);
            else setShowCreate(true);
          }}
          className="flex flex-col items-center gap-0.5 shrink-0"
        >
          <div className="relative">
            <div className={cn(
              "h-[52px] w-[52px] rounded-full flex items-center justify-center border-2",
              hasMyStory
                ? "border-transparent bg-gradient-to-tr from-primary to-primary/60 p-[2px]"
                : "border-dashed border-primary/30"
            )}>
              {hasMyStory ? (
                <div className="h-full w-full rounded-full overflow-hidden bg-card">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={optimizeAvatar(groups.find((g) => g.userId === user.id)?.avatarUrl, 52)} loading="lazy" />
                    <AvatarFallback className="text-xs font-bold">{user.email?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <Plus className="h-4 w-4 text-primary" />
              )}
            </div>
            {!hasMyStory && (
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                <Plus className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            )}
          </div>
          <span className="text-[9px] font-medium text-muted-foreground max-w-[48px] truncate">
            Your story
          </span>
        </button>

        {/* Other users' stories */}
        {groups.filter((g) => g.userId !== user.id).map((g) => {
          const hasUnviewed = groupHasUnviewed(g);
          return (
            <button
              key={g.userId}
              className="flex flex-col items-center gap-0.5 shrink-0"
              onClick={() => handleRingClick(g)}
            >
              <div className={cn(
                "h-[52px] w-[52px] rounded-full p-[2px]",
                hasUnviewed
                  ? "bg-gradient-to-tr from-primary via-destructive to-primary"
                  : "bg-muted-foreground/20"
              )}>
                <div className="h-full w-full rounded-full overflow-hidden bg-card border-2 border-card">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={optimizeAvatar(g.avatarUrl, 52)} loading="lazy" />
                    <AvatarFallback className="text-xs font-bold">{g.userName[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className={cn(
                "text-[9px] max-w-[48px] truncate",
                hasUnviewed ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
              )}>
                {g.userName.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {showCreate && (
        <Suspense fallback={null}>
          <CreateStorySheet open={showCreate} onClose={() => setShowCreate(false)} />
        </Suspense>
      )}

      {viewerLocation && (
        <StoryViewer
          groups={groups}
          startGroupIndex={viewerLocation.groupIndex}
          startStoryIndex={viewerLocation.storyIndex}
          onClose={handleViewerClose}
          onStoryChange={updateStory}
          source="feed"
        />
      )}
    </>
  );
}
