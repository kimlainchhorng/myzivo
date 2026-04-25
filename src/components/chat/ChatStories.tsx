/**
 * ChatStories — Stories row for the Chat hub.
 * Uses the shared `StoryViewer` for the fullscreen viewer experience.
 */
import { useState, useRef, useMemo } from "react";
import Plus from "lucide-react/dist/esm/icons/plus";
import Camera from "lucide-react/dist/esm/icons/camera";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import StoryViewer, { StoryGroup } from "@/components/stories/StoryViewer";
import { useStoryDeepLink } from "@/hooks/useStoryDeepLink";

export default function ChatStories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { activeStoryId, openStory, closeStory, updateStory } = useStoryDeepLink();

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(isVideo ? "Video must be under 20MB" : "Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("user-stories")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("user-stories").getPublicUrl(path);

      const { error: insertError } = await supabase.from("stories" as any).insert({
        user_id: user.id,
        media_url: urlData.publicUrl,
        media_type: isVideo ? "video" : "image",
      });
      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ["user-stories"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["feed-story-users"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["profile-story-rings", user.id], exact: true });
      queryClient.invalidateQueries({ queryKey: ["profile-my-story", user.id], exact: true });
      toast.success("Story added!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload story");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const myStories = storyGroups.find((g) => g.userId === user?.id);
  const hasMyStory = !!myStories && myStories.stories.length > 0;

  const viewerLocation = useMemo(() => {
    if (!activeStoryId) return null;
    for (let gi = 0; gi < storyGroups.length; gi++) {
      const si = storyGroups[gi].stories.findIndex((s) => s.id === activeStoryId);
      if (si !== -1) return { groupIndex: gi, storyIndex: si };
    }
    return null;
  }, [activeStoryId, storyGroups]);

  const openViewer = (group: StoryGroup) => {
    if (group.stories.length === 0) return;
    openStory(group.stories[0].id);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Stories Row */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {/* Your Story */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="relative w-[60px] h-[60px]">
              <button
                onClick={() => {
                  if (hasMyStory) openViewer(myStories!);
                  else fileInputRef.current?.click();
                }}
                disabled={uploading}
                className="w-full h-full rounded-full overflow-hidden"
              >
                <div className={cn(
                  "w-full h-full rounded-full border-2 flex items-center justify-center overflow-hidden",
                  hasMyStory
                    ? "border-primary bg-gradient-to-br from-primary/20 to-accent/20"
                    : "border-dashed border-muted-foreground/30"
                )}>
                  {myStories?.avatarUrl ? (
                    <img src={myStories.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-5 h-5 text-muted-foreground/50" />
                  )}
                </div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                disabled={uploading}
                aria-label="Add story"
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background z-10"
              >
                {uploading ? (
                  <div className="w-2.5 h-2.5 border border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-3 h-3 text-primary-foreground" />
                )}
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {uploading ? "Uploading..." : "Your story"}
            </span>
          </div>

          {/* Other Users */}
          {storyGroups
            .filter((g) => g.userId !== user?.id)
            .map((group) => (
              <button
                key={group.userId}
                onClick={() => openViewer(group)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className="w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-br from-primary via-accent to-primary">
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
                <span className="text-[10px] text-foreground font-medium max-w-[60px] truncate">
                  {group.userName.split(" ")[0]}
                </span>
              </button>
            ))}
        </div>
      </div>

      {viewing && (
        <StoryViewer
          groups={viewing.groups}
          startGroupIndex={viewing.startIdx}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
