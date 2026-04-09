/**
 * PublicProfilePage — View another user's public profile
 * Shows cover photo, avatar, name, posts/videos/reels, follow/friend/share actions
 * Respects profile_visibility privacy settings
 */
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getPublicOrigin, getProfileShareUrl } from "@/lib/getPublicOrigin";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import {
  ArrowLeft, Loader2, User, ImageIcon, Film, Grid3X3, UserPlus, UserCheck, UserX,
  Heart, MessageCircle, Lock, ShieldCheck, Users, Share2, Play, Eye, Bookmark, Globe,
  Phone, Video,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useCallback, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import PullToRefresh from "@/components/shared/PullToRefresh";
import CommentsSheet from "@/components/social/CommentsSheet";
import { resolveSharedOrigins, type SharedOriginInfo } from "@/lib/social/resolveSharedOrigins";
import { toUserPostInteractionId } from "@/lib/social/postInteraction";

type PostTab = "all" | "photos" | "videos";

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const shareCodeFromUrl = searchParams.get("sc") || "";
  const postIdFromUrl = searchParams.get("post") || "";
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<null | { action: "cancel" | "unfriend"; label: string }>(null);
  const [postTab, setPostTab] = useState<PostTab>("all");
  const [commentPost, setCommentPost] = useState<any>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  // Fetch profile with cover photo
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, avatar_url, cover_url, cover_position, profile_visibility, is_verified, share_code")
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();

      if (data) return data;

      // Fallback for logged-out viewers when profiles table is protected by RLS.
      const { data: publicProfile } = await (supabase as any)
        .from("public_profiles")
        .select("id, user_id, full_name, avatar_url")
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();

      if (!publicProfile) return null;

      return {
        id: publicProfile.id,
        user_id: publicProfile.user_id || publicProfile.id,
        full_name: publicProfile.full_name,
        avatar_url: publicProfile.avatar_url,
        cover_url: null,
        cover_position: null,
        profile_visibility: "public",
        is_verified: false,
        share_code: null,
      };
    },
    enabled: !!userId,
  });

  // Fallback: resolve minimal profile via public view or edge function using share code.
  const { data: fallbackProfile, isLoading: fallbackProfileLoading } = useQuery({
    queryKey: ["public-profile-fallback", userId, shareCodeFromUrl],
    queryFn: async () => {
      if (!userId) return null;

      const { data: pub } = await (supabase as any)
        .from("public_profiles")
        .select("id, user_id, full_name, avatar_url")
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();

      if (pub) {
        return {
          ...pub,
          cover_url: null,
          cover_position: null,
          profile_visibility: "public",
          is_verified: false,
          share_code: shareCodeFromUrl || null,
        };
      }

      if (!shareCodeFromUrl) return null;

      try {
        const res = await fetch(`https://slirphzzwcogdbkeicff.supabase.co/functions/v1/profile-og?resolve=1&code=${encodeURIComponent(shareCodeFromUrl)}`);
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) return null;

        const json = await res.json();
        const fp = json?.profile;
        if (!fp) return null;

        return {
          ...fp,
          cover_position: null,
          profile_visibility: "public",
          is_verified: false,
        };
      } catch {
        return null;
      }
    },
    enabled: !!userId && !profile,
  });

  const resolvedProfile: any = profile || fallbackProfile;
  const targetUserId = resolvedProfile?.user_id || resolvedProfile?.id || userId || "";
  const isOwnProfile = !!user?.id && !!targetUserId && user.id === targetUserId;

  const { data: friendshipStatus = "none" } = useQuery({
    queryKey: ["friendship-status", targetUserId],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_friendship_status", { target_user_id: targetUserId });
      return (data as string) || "none";
    },
    enabled: !!targetUserId && !!user && !isOwnProfile,
  });

  const visibility = resolvedProfile?.profile_visibility || "public";
  const isFriend = friendshipStatus === "friends";
  const isLocked = !isOwnProfile && (
    visibility === "private" || (visibility === "friends" && !isFriend)
  );

  // Fetch user posts with shared origin info
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["public-profile-posts", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const { data } = await (supabase as any)
        .from("user_posts")
        .select("id, media_url, media_type, caption, likes_count, comments_count, views_count, shares_count, created_at, shared_from_post_id, shared_from_user_id")
        .eq("user_id", targetUserId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (!data) return [];

      const sharedPostIds = data
        .map((post: any) => post.shared_from_post_id)
        .filter(Boolean) as string[];
      const sharedUserIds = data
        .map((post: any) => post.shared_from_user_id)
        .filter(Boolean) as string[];

      const { originByPostId, originByUserId } = await resolveSharedOrigins({
        sharedPostIds,
        sharedUserIds,
      });

      return data.map((post: any) => ({
        ...post,
        sharedOrigin: (post.shared_from_post_id ? originByPostId[post.shared_from_post_id] || null : null) ||
          (post.shared_from_user_id ? originByUserId[post.shared_from_user_id] || null : null) as SharedOriginInfo | null,
      }));
    },
    enabled: !!targetUserId && !isLocked,
  });

  // Counts
  const { data: followerCount = 0 } = useQuery({
    queryKey: ["follower-count", targetUserId],
    queryFn: async () => { const { data } = await supabase.rpc("get_follower_count", { target_user_id: targetUserId }); return data || 0; },
    enabled: !!targetUserId,
  });
  const { data: followingCount = 0 } = useQuery({
    queryKey: ["following-count", targetUserId],
    queryFn: async () => { const { data } = await supabase.rpc("get_following_count", { target_user_id: targetUserId }); return data || 0; },
    enabled: !!targetUserId,
  });
  const { data: friendCount = 0 } = useQuery({
    queryKey: ["friend-count", targetUserId],
    queryFn: async () => { const { data } = await supabase.rpc("get_friend_count", { target_user_id: targetUserId }); return data || 0; },
    enabled: !!targetUserId,
  });
  const { data: isFollowing = false } = useQuery({
    queryKey: ["is-following", targetUserId],
    queryFn: async () => { const { data } = await supabase.rpc("is_following", { target_user_id: targetUserId }); return data || false; },
    enabled: !!targetUserId && !!user && !isOwnProfile,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user || !targetUserId || user.id === targetUserId) throw new Error("Invalid");
      if (isFollowing) {
        await supabase.from("followers").delete().eq("follower_id", user.id).eq("following_id", targetUserId).throwOnError();
      } else {
        await supabase.from("followers").insert({ follower_id: user.id, following_id: targetUserId }).throwOnError();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["follower-count", targetUserId] });
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    },
    onError: (err: any) => toast.error(err?.message || "Something went wrong"),
  });

  // Friend mutation
  const friendMutation = useMutation({
    mutationFn: async (action: "add" | "cancel" | "accept" | "unfriend") => {
      if (!user || !targetUserId || user.id === targetUserId) throw new Error("Invalid");
      if (action === "add") {
        if (!isFollowing) await supabase.from("followers").insert({ follower_id: user.id, following_id: targetUserId }).throwOnError();
        await supabase.from("friendships").insert({ user_id: user.id, friend_id: targetUserId, status: "pending" }).throwOnError();
        try {
          const { data: sp } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", user.id).single();
          await supabase.functions.invoke("send-push-notification", {
            body: { user_id: targetUserId, notification_type: "friend_request_received", title: `${sp?.full_name || "Someone"} · Following`, body: `${sp?.full_name || "Someone"} sent you a friend request`, data: { type: "friend_request", sender_id: user.id, avatar_url: sp?.avatar_url, action_url: `/user/${user.id}` } },
          });
        } catch {}
      } else if (action === "cancel" || action === "unfriend") {
        await supabase.from("friendships").delete().or(`and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`).throwOnError();
      } else if (action === "accept") {
        if (!isFollowing) await supabase.from("followers").insert({ follower_id: user.id, following_id: targetUserId }).throwOnError();
        await supabase.from("friendships").update({ status: "accepted", accepted_at: new Date().toISOString() }).eq("user_id", targetUserId).eq("friend_id", user.id).throwOnError();
      }
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["friendship-status", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["friend-count", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["is-following", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["follower-count", targetUserId] });
      toast.success({ add: "Friend request sent!", cancel: "Request cancelled", accept: "Friend added!", unfriend: "Unfriended" }[action]);
    },
    onError: (err: any) => toast.error(err?.message || "Something went wrong"),
  });

  const isLoading = profileLoading || fallbackProfileLoading || (!isLocked && postsLoading);
  const initials = (resolvedProfile?.full_name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const getFriendButton = () => {
    switch (friendshipStatus) {
      case "friends": return { label: "Friends", icon: UserCheck, action: "unfriend" as const };
      case "request_sent": return { label: "Requested", icon: UserX, action: "cancel" as const };
      case "request_received": return { label: "Accept", icon: UserPlus, action: "accept" as const };
      default: return { label: "Add Friend", icon: UserPlus, action: "add" as const };
    }
  };
  const friendBtn = getFriendButton();

  const handlePullRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["public-profile", userId] }),
      queryClient.invalidateQueries({ queryKey: ["public-profile-posts", targetUserId] }),
    ]);
  }, [queryClient, targetUserId, userId]);

  const buildShareUrl = useCallback((postId?: string) => {
    const shareCode = resolvedProfile?.share_code || shareCodeFromUrl || "";
    const fallbackProfileId = targetUserId || userId;
    if (shareCode) {
      return postId
        ? `${getProfileShareUrl(shareCode)}&post=${encodeURIComponent(postId)}`
        : getProfileShareUrl(shareCode);
    }
    if (fallbackProfileId) {
      return postId
        ? `${getPublicOrigin()}/user/${fallbackProfileId}?post=${encodeURIComponent(postId)}`
        : `${getPublicOrigin()}/user/${fallbackProfileId}`;
    }
    return getPublicOrigin();
  }, [resolvedProfile?.share_code, shareCodeFromUrl, targetUserId, userId]);

  const handleShare = async () => {
    const url = buildShareUrl();
    if (navigator.share) {
      try { await navigator.share({ title: `${resolvedProfile?.full_name || "User"} on ZIVO`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied!");
    }
  };

  const handleSharePost = async (post: any) => {
    const url = buildShareUrl(post?.id);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${resolvedProfile?.full_name || "User"} on ZIVO`,
          text: post?.caption || "Check out this post on ZIVO",
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Post link copied!");
    }
  };

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
  };

  useEffect(() => {
    let alive = true;

    const loadBookmarkedPosts = async () => {
      if (!user?.id) {
        if (alive) setBookmarkedPosts(new Set());
        return;
      }

      const interactionIds = posts.map((post: any) => toUserPostInteractionId(post.id));
      if (!interactionIds.length) {
        if (alive) setBookmarkedPosts(new Set());
        return;
      }

      const { data } = await (supabase as any)
        .from("bookmarks")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("item_type", "post")
        .in("item_id", interactionIds);

      if (!alive) return;
      setBookmarkedPosts(new Set((data ?? []).map((row: any) => row.item_id)));
    };

    void loadBookmarkedPosts();

    return () => {
      alive = false;
    };
  }, [posts, user?.id]);

  useEffect(() => {
    if (!postIdFromUrl || !posts.length) return;
    const matchedPost = posts.find((post: any) => post.id === postIdFromUrl);
    if (matchedPost) {
      setSelectedPost(matchedPost);
    }
  }, [postIdFromUrl, posts]);

  const handleBookmark = async (post: any) => {
    if (!user?.id) {
      toast.error("Please sign in to bookmark posts");
      return;
    }

    const interactionId = toUserPostInteractionId(post.id);
    const wasBookmarked = bookmarkedPosts.has(interactionId);

    setBookmarkedPosts((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(interactionId);
      else next.add(interactionId);
      return next;
    });

    try {
      if (wasBookmarked) {
        const { error } = await (supabase as any)
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("item_type", "post")
          .eq("item_id", interactionId);

        if (error) throw error;
        toast.success("Removed from bookmarks");
      } else {
        const { error } = await (supabase as any).from("bookmarks").insert({
          user_id: user.id,
          item_id: interactionId,
          item_type: "post",
          title: post.caption || `Post by ${resolvedProfile?.full_name || "User"}`,
          collection_name: "Posts",
        });

        if (error) throw error;
        toast.success("Saved to bookmarks");
      }
    } catch (error: any) {
      setBookmarkedPosts((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.add(interactionId);
        else next.delete(interactionId);
        return next;
      });
      toast.error(error?.message || "Bookmark failed");
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post: any) => {
    if (postTab === "photos") return post.media_type === "image";
    if (postTab === "videos") return post.media_type === "video";
    return true;
  });
  const photoCount = posts.filter((p: any) => p.media_type === "image").length;
  const videoCount = posts.filter((p: any) => p.media_type === "video").length;

  const getPrivacyInfo = () => {
    if (visibility === "private") return { icon: Lock, title: "This Account is Private", description: "This user has set their profile to private.", showAddFriend: false };
    return { icon: Users, title: "Friends Only", description: `Only friends can see ${resolvedProfile?.full_name || "this user"}'s posts.`, showAddFriend: friendshipStatus === "none" || friendshipStatus === "request_received" };
  };

  const formatTime = (dateStr: string) => {
    try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); } catch { return ""; }
  };

  return (
    <PullToRefresh onRefresh={handlePullRefresh} className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30 safe-area-top">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground truncate flex-1">{resolvedProfile?.full_name || "Profile"}</h1>
          <button onClick={handleShare} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <Share2 className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : !resolvedProfile ? (
        <div className="flex flex-col items-center justify-center h-60 text-muted-foreground"><User className="h-10 w-10 mb-2" /><p className="text-sm">Profile not found</p></div>
      ) : (
        <>
          {/* Cover + Avatar */}
          <div className="relative max-w-3xl mx-auto">
            <div className="w-full h-36 sm:h-48 md:h-56 bg-gradient-to-br from-primary/20 via-primary/10 to-muted overflow-hidden">
              {resolvedProfile.cover_url && (
                <img src={resolvedProfile.cover_url} alt="Cover" className="w-full h-full object-cover" style={{ objectPosition: `center ${resolvedProfile.cover_position ?? 50}%` }} />
              )}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 sm:-bottom-16">
              <div className="relative">
                <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={resolvedProfile.avatar_url || undefined} />
                  <AvatarFallback className="text-3xl sm:text-4xl font-bold bg-muted text-muted-foreground">{initials}</AvatarFallback>
                </Avatar>
                {resolvedProfile.is_verified && (
                  <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-background flex items-center justify-center">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="hsl(var(--primary))" /><path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex flex-col items-center pt-16 sm:pt-20 pb-4 px-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-foreground">{resolvedProfile.full_name}</h2>

            {!isLocked ? (
              <div className="flex gap-6 mt-4">
                {[{ count: posts.length, label: "Posts" }, { count: followerCount, label: "Followers" }, { count: followingCount, label: "Following" }, { count: friendCount, label: "Friends" }].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-bold text-foreground">{s.count}</p>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-6 mt-4">
                {["Posts", "Followers", "Following", "Friends"].map((l) => (
                  <div key={l} className="text-center"><p className="text-lg font-bold text-foreground">—</p><p className="text-[11px] text-muted-foreground">{l}</p></div>
                ))}
              </div>
            )}

            {/* Actions */}
            {!isOwnProfile && user && (
              <div className="flex gap-2.5 mt-5 w-full max-w-sm px-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => followMutation.mutate()} disabled={followMutation.isPending}
                  className={`flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${isFollowing ? "bg-muted text-foreground border border-border" : "bg-primary text-primary-foreground"}`}>
                  <Heart className={`h-4 w-4 ${isFollowing ? "fill-primary text-primary" : ""}`} />
                  {isFollowing ? "Following" : "Follow"}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (friendBtn.action === "cancel") setConfirmAction({ action: "cancel", label: "Cancel this friend request?" });
                    else if (friendBtn.action === "unfriend") setConfirmAction({ action: "unfriend", label: `Unfriend ${resolvedProfile?.full_name}?` });
                    else friendMutation.mutate(friendBtn.action);
                  }}
                  disabled={friendMutation.isPending}
                  className={`flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    friendshipStatus === "friends" ? "bg-primary/10 text-primary border border-primary/30"
                      : friendshipStatus === "request_sent" ? "bg-muted text-muted-foreground border border-border"
                      : friendshipStatus === "request_received" ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border border-border"
                  }`}>
                  <friendBtn.icon className="h-4 w-4" />{friendBtn.label}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (friendshipStatus === "friends") {
                      navigate(`/chat`, {
                        state: {
                          openChat: {
                            recipientId: targetUserId,
                            recipientName: resolvedProfile?.full_name || "User",
                            recipientAvatar: resolvedProfile?.avatar_url,
                          },
                        },
                      });
                    } else {
                      toast("Add as friend to chat");
                    }
                  }}
                  className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${friendshipStatus === "friends" ? "bg-primary text-primary-foreground" : "bg-muted border border-border text-muted-foreground opacity-60"}`}>
                  <MessageCircle className="h-4 w-4" />
                </motion.button>
              </div>
            )}
            {isOwnProfile && (
              <div className="flex gap-3 mt-5">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/account/profile-edit")} className="h-11 px-8 rounded-xl bg-muted text-foreground text-sm font-semibold border border-border">Edit Profile</motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare} className="h-11 w-11 rounded-xl bg-muted text-foreground flex items-center justify-center border border-border"><Share2 className="h-4 w-4" /></motion.button>
              </div>
            )}
          </div>

          {/* Locked */}
          {isLocked ? (
            <div className="px-4 mt-2 max-w-3xl mx-auto">
              <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-muted/30 border border-border/40">
                {(() => { const p = getPrivacyInfo(); return (<>
                  <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center mb-4"><p.icon className="h-7 w-7 text-muted-foreground" /></div>
                  <h3 className="text-base font-bold text-foreground mb-1.5">{p.title}</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-[260px]">{p.description}</p>
                  {p.showAddFriend && !isOwnProfile && user && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => friendMutation.mutate(friendshipStatus === "request_received" ? "accept" : "add")} disabled={friendMutation.isPending}
                      className="mt-5 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />{friendshipStatus === "request_received" ? "Accept Friend Request" : "Send Friend Request"}
                    </motion.button>
                  )}
                  {friendshipStatus === "request_sent" && <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />Friend request sent</p>}
                </>); })()}
              </div>
            </div>
          ) : (
            <>
              {/* Content Tabs */}
              <div className="border-b border-border/30">
                <div className="flex">
                  {([
                    { key: "all" as PostTab, icon: Grid3X3, label: "Posts", count: posts.length },
                    { key: "photos" as PostTab, icon: ImageIcon, label: "Photos", count: photoCount },
                    { key: "videos" as PostTab, icon: Film, label: "Videos", count: videoCount },
                  ]).map((tab) => (
                    <button key={tab.key} onClick={() => setPostTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${postTab === tab.key ? "text-foreground" : "text-muted-foreground"}`}>
                      <tab.icon className="h-4 w-4" /><span>{tab.label}</span>
                      {postTab === tab.key && <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posts */}
              {filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
                  <ImageIcon className="h-8 w-8 mb-2" /><p className="text-sm">No {postTab === "all" ? "posts" : postTab} yet</p>
                </div>
              ) : postTab === "all" ? (
                /* Feed-style view for "All" tab */
                <div className="divide-y divide-border/30">
                  {filteredPosts.map((post: any) => (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card">
                      {post.sharedOrigin ? (
                        /* ── Facebook-style shared post layout ── */
                        <>
                          {/* Sharer header */}
                          <div className="flex items-center gap-2.5 px-3 py-2.5">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={resolvedProfile.avatar_url || undefined} />
                              <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-foreground truncate">{resolvedProfile.full_name}</p>
                              <div className="flex items-center gap-1">
                                <p className="text-[10px] text-muted-foreground">{formatTime(post.created_at)}</p>
                                <span className="text-[10px] text-muted-foreground">·</span>
                                <Globe className="h-2.5 w-2.5 text-muted-foreground" />
                              </div>
                            </div>
                          </div>

                          {/* Sharer's own caption */}
                          {post.caption && post.caption !== post.sharedOrigin.caption && (
                            <div className="px-3 pb-2">
                              <p className="text-[13px] text-foreground">{post.caption}</p>
                            </div>
                          )}

                          {/* Embedded original post card */}
                          <div className="mx-3 mb-2 border border-border/50 rounded-2xl overflow-hidden bg-card shadow-sm">
                            {/* Original author header */}
                            <div className="flex items-center px-3 py-2.5">
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <Avatar className="h-9 w-9 shrink-0">
                                  <AvatarImage src={post.sharedOrigin.avatar} />
                                  <AvatarFallback className="text-[10px]">{post.sharedOrigin.name?.[0] || "S"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 text-left">
                                  <p className="text-[13px] font-semibold text-foreground truncate">{post.sharedOrigin.name}</p>
                                  <div className="flex items-center gap-1">
                                    <Globe className="h-2.5 w-2.5 text-muted-foreground" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Original post caption */}
                            {post.sharedOrigin.caption && (
                              <div className="px-3 pb-2">
                                <p className="text-[13px] text-foreground">{post.sharedOrigin.caption}</p>
                              </div>
                            )}

                            {/* Original post media */}
                            {post.media_url && (
                              <div className="relative w-full aspect-square bg-muted overflow-hidden" onClick={() => setSelectedPost(post)}>
                                {post.media_type === "video" ? (
                                  <>
                                    <video src={post.media_url} className="w-full h-full object-cover" muted preload="metadata" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                        <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <img src={post.media_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        /* ── Normal post layout ── */
                        <>
                          {/* Post header */}
                          <div className="flex items-center gap-2.5 px-3 py-2.5">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={resolvedProfile.avatar_url || undefined} />
                              <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-foreground truncate">{resolvedProfile.full_name}</p>
                              <div className="flex items-center gap-1">
                                <p className="text-[10px] text-muted-foreground">{formatTime(post.created_at)}</p>
                                <span className="text-[10px] text-muted-foreground">·</span>
                                <Globe className="h-2.5 w-2.5 text-muted-foreground" />
                              </div>
                            </div>
                          </div>

                          {/* Caption */}
                          {post.caption && (
                            <div className="px-3 pb-2">
                              <p className="text-[13px] text-foreground">
                                <span className="font-semibold mr-1">{resolvedProfile.full_name}</span>
                                {post.caption}
                              </p>
                            </div>
                          )}

                          {/* Media */}
                          {post.media_url && (
                            <div className="relative w-full aspect-square bg-muted overflow-hidden" onClick={() => setSelectedPost(post)}>
                              {post.media_type === "video" ? (
                                <>
                                  <video src={post.media_url} className="w-full h-full object-cover" muted preload="metadata" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                      <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <img src={post.media_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {/* Interaction bar */}
                      <div className="flex items-center px-4 py-2.5">
                        <div className="flex items-center gap-4 flex-1">
                          <button onClick={() => handleLike(post.id)} className="touch-manipulation active:scale-90 transition-transform">
                            <Heart className={`h-[22px] w-[22px] ${likedPosts.has(post.id) ? "fill-red-500 text-red-500" : "text-foreground"}`} strokeWidth={1.5} />
                          </button>
                          <button onClick={() => setCommentPost(post)} className="touch-manipulation active:scale-90 transition-transform">
                            <MessageCircle className="h-[22px] w-[22px] text-foreground" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => void handleSharePost(post)} className="touch-manipulation active:scale-90 transition-transform">
                            <Share2 className="h-[22px] w-[22px] text-foreground" strokeWidth={1.5} />
                          </button>
                        </div>
                        <button onClick={() => void handleBookmark(post)} className="touch-manipulation active:scale-90 transition-transform">
                          <Bookmark className={`h-[22px] w-[22px] ${bookmarkedPosts.has(toUserPostInteractionId(post.id)) ? "fill-foreground text-foreground" : "text-foreground"}`} strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Engagement counts */}
                      {(post.likes_count > 0 || post.comments_count > 0) && (
                        <div className="px-4 pb-3 flex items-center gap-3">
                          {post.likes_count > 0 && <span className="text-xs font-semibold text-foreground">{post.likes_count} {post.likes_count === 1 ? "like" : "likes"}</span>}
                          {post.comments_count > 0 && <span className="text-xs text-muted-foreground">{post.comments_count} {post.comments_count === 1 ? "comment" : "comments"}</span>}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* Grid view for Photos/Videos tabs */
                <div className="grid grid-cols-3 gap-0.5 mt-0.5 px-0.5">
                  {filteredPosts.map((post: any) => (
                    <motion.button key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedPost(post)}
                      className="relative aspect-square overflow-hidden bg-muted group">
                      {post.media_type === "video" ? (
                        <>
                          <video src={post.media_url} className="w-full h-full object-cover" muted preload="metadata" />
                          <div className="absolute top-1.5 right-1.5"><Film className="h-3.5 w-3.5 text-white drop-shadow" /></div>
                          {post.views_count > 0 && <div className="absolute bottom-1 left-1.5 flex items-center gap-0.5"><Eye className="h-3 w-3 text-white drop-shadow" /><span className="text-[10px] text-white font-semibold drop-shadow">{post.views_count}</span></div>}
                        </>
                      ) : (
                        <img src={post.media_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Post detail overlay — Instagram-style */}
              <AnimatePresence>
                {selectedPost && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-background flex flex-col overflow-y-auto"
                  >
                    {/* Header bar */}
                    <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
                      <button onClick={() => setSelectedPost(null)} className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2">
                        <ArrowLeft className="h-5 w-5 text-foreground" />
                      </button>
                      <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                        <AvatarImage src={resolvedProfile.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{resolvedProfile.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">{formatTime(selectedPost.created_at)}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); void handleSharePost(selectedPost); }} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <Share2 className="h-5 w-5 text-foreground" />
                      </button>
                    </div>

                    {/* Media — fills width, auto height */}
                    <div className="w-full bg-black">
                      {selectedPost.media_type === "video" ? (
                        <video
                          src={selectedPost.media_url}
                          controls
                          autoPlay
                          playsInline
                          className="w-full max-h-[75vh] object-contain"
                        />
                      ) : (
                        <img
                          src={selectedPost.media_url}
                          alt=""
                          className="w-full max-h-[75vh] object-contain"
                        />
                      )}
                    </div>

                    {/* Action bar */}
                    <div className="flex items-center gap-5 px-4 py-3 border-b border-border">
                      <button
                        onClick={() => {
                          const isLiked = likedPosts.has(selectedPost.id);
                          setLikedPosts(prev => {
                            const next = new Set(prev);
                            isLiked ? next.delete(selectedPost.id) : next.add(selectedPost.id);
                            return next;
                          });
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <Heart className={`h-6 w-6 transition-colors ${likedPosts.has(selectedPost.id) ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                        <span className="text-sm font-medium text-foreground">{(selectedPost.likes_count || 0) + (likedPosts.has(selectedPost.id) ? 1 : 0)}</span>
                      </button>
                      <button onClick={() => setCommentPost(selectedPost)} className="flex items-center gap-1.5">
                        <MessageCircle className="h-6 w-6 text-foreground" />
                        <span className="text-sm font-medium text-foreground">{selectedPost.comments_count || 0}</span>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{selectedPost.views_count || 0}</span>
                      </div>
                      <div className="flex-1" />
                      <button onClick={(e) => { e.stopPropagation(); void handleSharePost(selectedPost); }}>
                        <Share2 className="h-5 w-5 text-foreground" />
                      </button>
                    </div>

                    {/* Caption */}
                    {selectedPost.caption && (
                      <div className="px-4 py-3">
                        <p className="text-sm text-foreground leading-relaxed">
                          <span className="font-bold mr-1.5">{resolvedProfile.full_name}</span>
                          {selectedPost.caption}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <CommentsSheet
                open={!!commentPost}
                onClose={() => setCommentPost(null)}
                postId={commentPost ? toUserPostInteractionId(commentPost.id) : ""}
                postSource="user"
                currentUserId={user?.id ?? null}
                commentsCount={commentPost?.comments_count ?? 0}
              />
            </>
          )}
        </>
      )}

      {/* Confirm dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.action === "cancel" ? "Cancel Friend Request?" : "Unfriend?"}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.label}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmAction) friendMutation.mutate(confirmAction.action); setConfirmAction(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {confirmAction?.action === "cancel" ? "Yes, cancel" : "Yes, unfriend"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ZivoMobileNav />
    </PullToRefresh>
  );
}
