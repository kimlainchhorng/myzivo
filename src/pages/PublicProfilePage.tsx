/**
 * PublicProfilePage — View another user's public profile
 * Shows avatar, name, posts (photos/reels)
 */
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { ArrowLeft, Loader2, User, ImageIcon, Film, Grid3X3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      // Try public_profiles view first
      const { data } = await supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url")
        .eq("id", userId)
        .single();
      if (data) return data;
      // Fallback to profiles
      const { data: p2 } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", userId)
        .single();
      return p2;
    },
    enabled: !!userId,
  });

  // Fetch user posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["public-profile-posts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await (supabase as any)
        .from("user_posts")
        .select("id, media_url, media_type, caption, likes_count, views_count, created_at")
        .eq("user_id", userId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!userId,
  });

  const isLoading = profileLoading || postsLoading;
  const initials = (profile?.full_name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30 px-4 py-2.5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground truncate">{profile?.full_name || "Profile"}</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !profile ? (
        <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
          <User className="h-10 w-10 mb-2" />
          <p className="text-sm">Profile not found</p>
        </div>
      ) : (
        <>
          {/* Profile header */}
          <div className="flex flex-col items-center pt-8 pb-6 px-4">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground mt-4">{profile.full_name}</h2>
            <div className="flex gap-8 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{posts.length}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
            </div>
          </div>

          {/* Posts grid */}
          <div className="px-1">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30">
              <Grid3X3 className="h-4 w-4 text-foreground" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Posts</span>
            </div>
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
                <ImageIcon className="h-8 w-8 mb-2" />
                <p className="text-sm">No posts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                {posts.map((post: any) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="relative aspect-square overflow-hidden bg-muted"
                  >
                    {post.media_type === "video" ? (
                      <>
                        <video src={post.media_url} className="w-full h-full object-cover" muted preload="metadata" />
                        <div className="absolute top-1.5 right-1.5">
                          <Film className="h-3.5 w-3.5 text-white drop-shadow" />
                        </div>
                      </>
                    ) : (
                      <img src={post.media_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Post detail overlay */}
          {selectedPost && (
            <div className="fixed inset-0 z-50 bg-black/90 flex flex-col" onClick={() => setSelectedPost(null)}>
              <div className="flex items-center gap-3 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setSelectedPost(null)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <ArrowLeft className="h-5 w-5 text-white" />
                </button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-white">{profile.full_name}</p>
                  <p className="text-[10px] text-white/60">
                    {(() => { try { return formatDistanceToNow(new Date(selectedPost.created_at), { addSuffix: true }); } catch { return ""; } })()}
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center px-2" onClick={(e) => e.stopPropagation()}>
                {selectedPost.media_type === "video" ? (
                  <video src={selectedPost.media_url} controls autoPlay className="max-h-[70vh] w-full object-contain rounded-lg" />
                ) : (
                  <img src={selectedPost.media_url} alt="" className="max-h-[70vh] w-full object-contain rounded-lg" />
                )}
              </div>
              {selectedPost.caption && (
                <p className="px-4 py-3 text-white text-sm" onClick={(e) => e.stopPropagation()}>{selectedPost.caption}</p>
              )}
            </div>
          )}
        </>
      )}

      <ZivoMobileNav />
    </div>
  );
}
