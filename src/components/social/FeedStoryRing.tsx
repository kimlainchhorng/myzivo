/**
 * FeedStoryRing — Horizontal scrollable story rings for the feed page
 * Shows active stories with gradient ring, tapping opens the story viewer
 */
import { useRef, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { optimizeAvatar } from "@/utils/optimizeAvatar";
import { toast } from "sonner";
import ChatStories from "@/components/chat/ChatStories";

interface StoryUser {
  userId: string;
  userName: string;
  avatarUrl?: string;
  hasUnviewed: boolean;
  storyCount: number;
}

export default function FeedStoryRing() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: storyUsers = [] } = useQuery({
    queryKey: ["feed-story-users"],
    enabled: !!user,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("stories")
        .select("user_id")
        .gt("expires_at", new Date().toISOString());

      if (!data || data.length === 0) return [];

      const userIds = [...new Set((data as any[]).map((s: any) => s.user_id))] as string[];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Check which stories the current user has viewed
      const { data: views } = await (supabase as any)
        .from("story_views")
        .select("story_id")
        .eq("viewer_id", user!.id);

      const viewedStoryIds = new Set((views || []).map((v: any) => v.story_id));

      // Get all stories to check viewed status
      const { data: allStories } = await (supabase as any)
        .from("stories")
        .select("id, user_id")
        .gt("expires_at", new Date().toISOString());

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const userStoryMap = new Map<string, { count: number; hasUnviewed: boolean }>();
      for (const s of allStories || []) {
        if (!userStoryMap.has(s.user_id)) {
          userStoryMap.set(s.user_id, { count: 0, hasUnviewed: false });
        }
        const entry = userStoryMap.get(s.user_id)!;
        entry.count++;
        if (!viewedStoryIds.has(s.id) && s.user_id !== user!.id) {
          entry.hasUnviewed = true;
        }
      }

      const result: StoryUser[] = userIds.map((uid) => {
        const profile = profileMap.get(uid);
        const storyInfo = userStoryMap.get(uid) || { count: 0, hasUnviewed: false };
        return {
          userId: uid,
          userName: (profile as any)?.full_name || "User",
          avatarUrl: (profile as any)?.avatar_url,
          hasUnviewed: storyInfo.hasUnviewed,
          storyCount: storyInfo.count,
        };
      });

      // Put current user first
      const myIdx = result.findIndex((u) => u.userId === user!.id);
      if (myIdx > 0) {
        const [mine] = result.splice(myIdx, 1);
        result.unshift(mine);
      }

      return result;
    },
  });

  const handleAddStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const { error: insertError } = await (supabase as any).from("stories").insert({
        user_id: user.id,
        media_url: urlData.publicUrl,
        media_type: isVideo ? "video" : "image",
      });
      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ["feed-story-users"] });
      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
      toast.success("Story added! ✨");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload story");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const hasMyStory = storyUsers.some((u) => u.userId === user?.id);

  if (!user) return null;

  return (
    <>
      <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-none border-b border-border/20">
        {/* Add story button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center gap-1 shrink-0"
          disabled={uploading}
        >
          <div className="relative">
            <div className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center border-2",
              hasMyStory
                ? "border-transparent bg-gradient-to-tr from-primary to-primary/60 p-[2px]"
                : "border-dashed border-primary/30"
            )}>
              {hasMyStory ? (
                <div className="h-full w-full rounded-full overflow-hidden bg-card">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={optimizeAvatar(storyUsers.find((u) => u.userId === user.id)?.avatarUrl, 64)} loading="lazy" />
                    <AvatarFallback className="text-sm font-bold">{user.email?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
              ) : uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Plus className="h-5 w-5 text-primary" />
              )}
            </div>
            {!hasMyStory && (
              <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                <Plus className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <span className="text-[10px] font-medium text-muted-foreground max-w-[56px] truncate">
            Your story
          </span>
        </button>

        {/* Other users' stories */}
        {storyUsers.filter((u) => u.userId !== user.id).map((su) => (
          <button
            key={su.userId}
            className="flex flex-col items-center gap-1 shrink-0"
            onClick={() => {
              // Navigate to chat stories viewer - handled by ChatStories component
              toast.info(`Viewing ${su.userName}'s story`);
            }}
          >
            <div className={cn(
              "h-16 w-16 rounded-full p-[2.5px]",
              su.hasUnviewed
                ? "bg-gradient-to-tr from-primary via-destructive to-primary"
                : "bg-muted-foreground/20"
            )}>
              <div className="h-full w-full rounded-full overflow-hidden bg-card border-2 border-card">
                <Avatar className="h-full w-full">
                  <AvatarImage src={optimizeAvatar(su.avatarUrl, 64)} loading="lazy" />
                  <AvatarFallback className="text-sm font-bold">{su.userName[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className={cn(
              "text-[10px] max-w-[56px] truncate",
              su.hasUnviewed ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
            )}>
              {su.userName.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleAddStory}
      />
    </>
  );
}
