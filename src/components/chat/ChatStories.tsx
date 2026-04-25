/**
 * ChatStories — Stories row for the Chat hub.
 * Uses the shared `StoryViewer` for the fullscreen viewer experience and the
 * shared `CreateStorySheet` (same premium bottom sheet used on Profile/Feed)
 * for the "Add story" flow — so Chat no longer pops the floating top-left
 * native iOS file chooser.
 */
import { lazy, Suspense, useState } from "react";
import Plus from "lucide-react/dist/esm/icons/plus";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Camera from "lucide-react/dist/esm/icons/camera";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import StoryViewer, { StoryGroup } from "@/components/stories/StoryViewer";
import StoryTextTile from "@/components/stories/StoryTextTile";
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
        .select("id, user_id, media_url, media_type, text_overlay, audio_url, created_at, expires_at, view_count")
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
          caption: s.text_overlay,
          audioUrl: s.audio_url,
          createdAt: s.created_at,
          viewsCount: s.view_count ?? 0,
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
                "h-[64px] w-[64px] rounded-full p-[2.5px] box-border",
                hasMyStory
                  ? "bg-[conic-gradient(from_140deg,hsl(160_84%_45%),hsl(174_72%_45%),hsl(190_85%_55%),hsl(160_84%_45%))] shadow-[0_0_12px_-3px_hsl(160_84%_45%/0.55)]"
                  : "bg-muted-foreground/25"
              )}>
                <div className="h-full w-full rounded-full overflow-hidden border-2 border-background bg-card flex items-center justify-center">
                  {(() => {
                    const latest = myStories?.stories[myStories.stories.length - 1];
                    if (latest && latest.mediaType === "image" && latest.mediaUrl) {
                      return <img src={latest.mediaUrl} alt="Your story" className="h-full w-full object-cover" loading="lazy" />;
                    }
                    if (latest && latest.mediaType === "video" && latest.mediaUrl) {
                      return <video src={latest.mediaUrl} className="h-full w-full object-cover" muted playsInline preload="metadata" />;
                    }
                    if (latest && (latest.mediaType === "text" || !latest.mediaUrl)) {
                      return <StoryTextTile text={latest.caption || ""} />;
                    }
                    if (myStories?.avatarUrl) {
                      return <img src={myStories.avatarUrl} alt="" className="w-full h-full object-cover" />;
                    }
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Camera className="w-5 h-5 text-primary/60" />
                      </div>
                    );
                  })()}
                </div>
              </div>
              <span
                onClick={(e) => { e.stopPropagation(); setShowCreate(true); }}
                role="button"
                aria-label="Add story"
                className="absolute -bottom-0.5 -right-0.5 h-[22px] w-[22px] rounded-full bg-gradient-to-br from-[hsl(160_84%_45%)] to-[hsl(174_72%_40%)] flex items-center justify-center border-[2.5px] border-background shadow-[0_2px_6px_-1px_hsl(160_84%_45%/0.6)]"
              >
                {hasMyStory ? (
                  <Sparkles className="w-3 h-3 text-white" strokeWidth={2.5} />
                ) : (
                  <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                )}
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
                <div className="h-[64px] w-[64px] rounded-full p-[2.5px] bg-[conic-gradient(from_140deg,hsl(160_84%_45%),hsl(174_72%_45%),hsl(190_85%_55%),hsl(160_84%_45%))] shadow-[0_0_12px_-3px_hsl(160_84%_45%/0.55)]">
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
          <CreateStorySheet
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onPublished={() => invalidateAllStoryCaches(queryClient, user?.id)}
          />
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
