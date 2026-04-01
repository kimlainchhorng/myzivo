/**
 * PublicProfilePage — View another user's public profile
 * Shows avatar, name, posts, follow/friend actions
 */
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { ArrowLeft, Loader2, User, ImageIcon, Film, Grid3X3, UserPlus, UserCheck, UserX, Heart, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const isOwnProfile = user?.id === userId;

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url")
        .eq("id", userId)
        .single();
      if (data) return data;
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

  // Fetch counts via RPC
  const { data: followerCount = 0 } = useQuery({
    queryKey: ["follower-count", userId],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_follower_count", { target_user_id: userId! });
      return data || 0;
    },
    enabled: !!userId,
  });

  const { data: followingCount = 0 } = useQuery({
    queryKey: ["following-count", userId],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_following_count", { target_user_id: userId! });
      return data || 0;
    },
    enabled: !!userId,
  });

  const { data: friendCount = 0 } = useQuery({
    queryKey: ["friend-count", userId],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_friend_count", { target_user_id: userId! });
      return data || 0;
    },
    enabled: !!userId,
  });

  // Check if current user follows this profile
  const { data: isFollowing = false } = useQuery({
    queryKey: ["is-following", userId],
    queryFn: async () => {
      const { data } = await supabase.rpc("is_following", { target_user_id: userId! });
      return data || false;
    },
    enabled: !!userId && !!user && !isOwnProfile,
  });

  // Check friendship status
  const { data: friendshipStatus = "none" } = useQuery({
    queryKey: ["friendship-status", userId],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_friendship_status", { target_user_id: userId! });
      return (data as string) || "none";
    },
    enabled: !!userId && !!user && !isOwnProfile,
  });

  // Follow / Unfollow
  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await supabase.from("followers").delete()
          .eq("follower_id", user!.id)
          .eq("following_id", userId!);
      } else {
        await supabase.from("followers").insert({
          follower_id: user!.id,
          following_id: userId!,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following", userId] });
      queryClient.invalidateQueries({ queryKey: ["follower-count", userId] });
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    },
    onError: () => toast.error("Something went wrong"),
  });

  // Add Friend / Cancel Request
  const friendMutation = useMutation({
    mutationFn: async (action: "add" | "cancel" | "accept" | "unfriend") => {
      if (action === "add") {
        await supabase.from("friendships").insert({
          user_id: user!.id,
          friend_id: userId!,
          status: "pending",
        });
      } else if (action === "cancel" || action === "unfriend") {
        await supabase.from("friendships").delete()
          .or(`and(user_id.eq.${user!.id},friend_id.eq.${userId!}),and(user_id.eq.${userId!},friend_id.eq.${user!.id})`);
      } else if (action === "accept") {
        await supabase.from("friendships")
          .update({ status: "accepted", accepted_at: new Date().toISOString() })
          .eq("user_id", userId!)
          .eq("friend_id", user!.id);
      }
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["friendship-status", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend-count", userId] });
      const msgs: Record<string, string> = {
        add: "Friend request sent!",
        cancel: "Request cancelled",
        accept: "Friend added!",
        unfriend: "Unfriended",
      };
      toast.success(msgs[action]);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const isLoading = profileLoading || postsLoading;
  const initials = (profile?.full_name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  // Friend button config
  const getFriendButton = () => {
    switch (friendshipStatus) {
      case "friends":
        return { label: "Friends", icon: UserCheck, variant: "active" as const, action: "unfriend" as const };
      case "request_sent":
        return { label: "Requested", icon: UserX, variant: "pending" as const, action: "cancel" as const };
      case "request_received":
        return { label: "Accept", icon: UserPlus, variant: "accept" as const, action: "accept" as const };
      default:
        return { label: "Add Friend", icon: UserPlus, variant: "default" as const, action: "add" as const };
    }
  };

  const friendBtn = getFriendButton();

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
          <div className="flex flex-col items-center pt-8 pb-4 px-4">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground mt-4">{profile.full_name}</h2>

            {/* Stats row */}
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{posts.length}</p>
                <p className="text-[11px] text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{followerCount}</p>
                <p className="text-[11px] text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{followingCount}</p>
                <p className="text-[11px] text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{friendCount}</p>
                <p className="text-[11px] text-muted-foreground">Friends</p>
              </div>
            </div>

            {/* Action buttons */}
            {!isOwnProfile && user && (
              <div className="flex gap-3 mt-5 w-full max-w-xs">
                {/* Follow button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={`flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isFollowing
                      ? "bg-muted text-foreground border border-border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFollowing ? "fill-primary text-primary" : ""}`} />
                  {isFollowing ? "Following" : "Follow"}
                </motion.button>

                {/* Friend button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => friendMutation.mutate(friendBtn.action)}
                  disabled={friendMutation.isPending}
                  className={`flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    friendshipStatus === "friends"
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : friendshipStatus === "request_sent"
                      ? "bg-muted text-muted-foreground border border-border"
                      : friendshipStatus === "request_received"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border border-border"
                  }`}
                >
                  <friendBtn.icon className="h-4 w-4" />
                  {friendBtn.label}
                </motion.button>

                {/* Message button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/chat`)}
                  className="h-11 w-11 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0"
                >
                  <MessageCircle className="h-4 w-4 text-foreground" />
                </motion.button>
              </div>
            )}

            {isOwnProfile && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/account/profile-edit")}
                className="mt-5 h-11 px-8 rounded-xl bg-muted text-foreground text-sm font-semibold border border-border"
              >
                Edit Profile
              </motion.button>
            )}
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
