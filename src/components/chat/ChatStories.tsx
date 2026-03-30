/**
 * ChatStories — WhatsApp/Instagram-style ephemeral stories row
 * Users can add photo/video stories that expire after 24 hours
 */
import { useState, useRef } from "react";
import { Plus, X, Eye, Trash2, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface StoryGroup {
  userId: string;
  userName: string;
  avatarUrl?: string;
  stories: {
    id: string;
    mediaUrl: string;
    mediaType: string;
    caption?: string;
    createdAt: string;
    viewsCount: number;
  }[];
}

export default function ChatStories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewingGroup, setViewingGroup] = useState<StoryGroup | null>(null);
  const [viewIdx, setViewIdx] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Fetch active stories grouped by user
  const { data: storyGroups = [] } = useQuery({
    queryKey: ["user-stories"],
    enabled: !!user,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_stories" as any)
        .select("id, user_id, media_url, media_type, caption, created_at, expires_at, views_count")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (!data || data.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set((data as any[]).map((s: any) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      // Group by user
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
          createdAt: s.created_at,
          views_count: s.views_count,
        });
      }

      // Put current user first
      const result = Array.from(groups.values());
      const myIdx = result.findIndex((g) => g.userId === user?.id);
      if (myIdx > 0) {
        const [mine] = result.splice(myIdx, 1);
        result.unshift(mine);
      }
      return result;
    },
  });

  const deleteStory = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase.from("user_stories" as any).delete().eq("id", storyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
      toast.success("Story deleted");
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

      const { error: insertError } = await supabase.from("user_stories" as any).insert({
        user_id: user.id,
        media_url: urlData.publicUrl,
        media_type: isVideo ? "video" : "image",
      });

      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
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

  const openViewer = (group: StoryGroup) => {
    setViewingGroup(group);
    setViewIdx(0);
  };

  const nextStory = () => {
    if (!viewingGroup) return;
    if (viewIdx < viewingGroup.stories.length - 1) {
      setViewIdx((i) => i + 1);
    } else {
      setViewingGroup(null);
    }
  };

  const prevStory = () => {
    if (viewIdx > 0) setViewIdx((i) => i - 1);
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

      <div className="px-5 pt-3 pb-1">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="relative w-[60px] h-[60px]">
              <div className={cn(
                "w-full h-full rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden",
                hasMyStory ? "border-primary" : "border-muted-foreground/30"
              )}>
                {myStories?.avatarUrl ? (
                  <img src={myStories.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-5 h-5 text-muted-foreground/50" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                {uploading ? (
                  <div className="w-2.5 h-2.5 border border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {uploading ? "Uploading..." : "Your story"}
            </span>
          </button>

          {storyGroups
            .filter((g) => g.userId !== user?.id)
            .map((group) => (
              <button
                key={group.userId}
                onClick={() => openViewer(group)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className="w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-br from-primary to-accent">
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

      <AnimatePresence>
        {viewingGroup && viewingGroup.stories[viewIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <div className="absolute top-[env(safe-area-inset-top,8px)] left-0 right-0 flex gap-1 px-3 pt-2 z-10">
              {viewingGroup.stories.map((_, i) => (
                <div key={i} className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full bg-white rounded-full transition-all duration-300",
                      i < viewIdx ? "w-full" : i === viewIdx ? "w-full animate-pulse" : "w-0"
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="absolute top-[calc(env(safe-area-inset-top,8px)+16px)] left-0 right-0 flex items-center justify-between px-4 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">
                  {viewingGroup.avatarUrl ? (
                    <img src={viewingGroup.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                      {viewingGroup.userName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{viewingGroup.userName}</p>
                  <p className="text-white/60 text-[10px]">
                    {format(new Date(viewingGroup.stories[viewIdx].createdAt), "h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {viewingGroup.userId === user?.id && (
                  <>
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <Eye className="w-3.5 h-3.5" />
                      {viewingGroup.stories[viewIdx].viewsCount}
                    </span>
                    <button
                      onClick={() => {
                        deleteStory.mutate(viewingGroup.stories[viewIdx].id);
                        if (viewingGroup.stories.length <= 1) {
                          setViewingGroup(null);
                        } else {
                          nextStory();
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-white/70" />
                    </button>
                  </>
                )}
                <button onClick={() => setViewingGroup(null)} className="w-8 h-8 flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center" onClick={nextStory}>
              <div className="absolute left-0 top-0 bottom-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); prevStory(); }} />

              {viewingGroup.stories[viewIdx].mediaType === "video" ? (
                <video
                  src={viewingGroup.stories[viewIdx].mediaUrl}
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                  playsInline
                  muted
                />
              ) : (
                <img
                  src={viewingGroup.stories[viewIdx].mediaUrl}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {viewingGroup.stories[viewIdx].caption && (
              <div className="absolute bottom-[env(safe-area-inset-bottom,20px)] left-0 right-0 px-6 pb-4 z-10">
                <p className="text-white text-sm text-center bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">
                  {viewingGroup.stories[viewIdx].caption}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
