/**
 * ChatStories — Stories row for the Chat hub.
 * Uses the shared `StoryViewer` for the fullscreen viewer experience and the
 * shared `CreateStorySheet` (same premium bottom sheet used on Profile/Feed)
 * for the "Add story" flow — so Chat no longer pops the floating top-left
 * native iOS file chooser.
 */
import { lazy, Suspense, useState } from "react";
import Plus from "lucide-react/dist/esm/icons/plus";
import Camera from "lucide-react/dist/esm/icons/camera";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import StoryViewer, { StoryGroup } from "@/components/stories/StoryViewer";
import { useStoryDeepLink, useStoryViewerLocation } from "@/hooks/useStoryDeepLink";
import { invalidateAllStoryCaches } from "@/lib/storiesCache";

const CreateStorySheet = lazy(() => import("@/components/profile/CreateStorySheet"));

export default function ChatStories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const { activeStoryId, openStory, closeStory, updateStory } = useStoryDeepLink({ source: "chat" });

  const { data: storyGroups = [] } = useQuery({
    queryKey: ["user-stories"],
    enabled: !!user,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data } = await supabase
        .from("stories" as any)
        .select("id, user_id, media_url, media_type, caption, audio_url, created_at, expires_at, views_count")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (!data || data.length === 0) return [];

      const userIds = [...new Set((data as any[]).map((s: any) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      const groups = new Map<string, StoryGroup>();
      for (const s of data as any[]) {
        if (!groups.has(s.user_id)) {
          const profile = profileMap.get(s.user_id);
          groups.set(s.user_id, {
            userId: s.user_id,
            userName: profile?.full_name || "User",
            avatarUrl: profile?.avatar_url,
            stories: [],
          });
        }
        groups.get(s.user_id)!.stories.push({
          id: s.id,
          mediaUrl: s.media_url,
          mediaType: s.media_type,
          caption: s.caption,
          audioUrl: s.audio_url,
          createdAt: s.created_at,
          viewsCount: s.views_count ?? 0,
        });
      }

      const result = Array.from(groups.values());
      const myIdx = result.findIndex((g) => g.userId === user?.id);
      if (myIdx > 0) {
        const [mine] = result.splice(myIdx, 1);
        result.unshift(mine);
      }
      return result;
    },
  });

  const myStories = storyGroups.find((g) => g.userId === user?.id);
  const hasMyStory = !!myStories && myStories.stories.length > 0;

  const viewerLocation = useStoryViewerLocation(storyGroups, activeStoryId);

  const openViewer = (group: StoryGroup) => {
    if (group.stories.length === 0) return;
    openStory(group.stories[0].id);
  };

  return (
    <>
      {/* Stories Row — Instagram style */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {/* Your Story */}
          <button
            onClick={() => {
              if (hasMyStory) openViewer(myStories!);
              else setShowCreate(true);
            }}
            className="flex flex-col items-center gap-1 flex-shrink-0 w-[72px]"
          >
            <div className="relative">
              <div className={cn(
                "h-[64px] w-[64px] rounded-full p-[2.5px]",
                hasMyStory
                  ? "bg-[conic-gradient(from_180deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888,#f09433)]"
                  : "bg-muted-foreground/25"
              )}>
                <div className="h-full w-full rounded-full overflow-hidden border-2 border-background bg-card">
                  {myStories?.avatarUrl ? (
                    <img src={myStories.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Camera className="w-5 h-5 text-primary/60" />
                    </div>
                  )}
                </div>
              </div>
              <span
                onClick={(e) => { e.stopPropagation(); setShowCreate(true); }}
                role="button"
                aria-label="Add story"
                className="absolute -bottom-0.5 -right-0.5 h-[22px] w-[22px] rounded-full bg-foreground flex items-center justify-center border-[2.5px] border-background"
              >
                <Plus className="w-3 h-3 text-background" strokeWidth={3} />
              </span>
            </div>
            <span className="text-[11px] text-foreground font-medium max-w-[68px] truncate">
              Your story
            </span>
          </button>

          {/* Other Users */}
          {storyGroups
            .filter((g) => g.userId !== user?.id)
            .map((group) => (
              <button
                key={group.userId}
                onClick={() => openViewer(group)}
                className="flex flex-col items-center gap-1 flex-shrink-0 w-[72px]"
              >
                <div className="h-[64px] w-[64px] rounded-full p-[2.5px] bg-[conic-gradient(from_180deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888,#f09433)]">
                  <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-muted">
                    {group.avatarUrl ? (
                      <img src={group.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {group.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-foreground font-semibold max-w-[68px] truncate">
                  {group.userName.split(" ")[0]}
                </span>
              </button>
            ))}
        </div>
      </div>

      {showCreate && (
        <Suspense fallback={null}>
          <CreateStorySheet open={showCreate} onClose={() => setShowCreate(false)} />
        </Suspense>
      )}

      {viewerLocation && (
        <StoryViewer
          groups={storyGroups}
          startGroupIndex={viewerLocation.groupIndex}
          startStoryIndex={viewerLocation.storyIndex}
          onClose={(meta) => {
            closeStory(meta);
            invalidateAllStoryCaches(queryClient, user?.id);
          }}
          onStoryChange={updateStory}
          source="chat"
        />
      )}
    </>
  );
}
