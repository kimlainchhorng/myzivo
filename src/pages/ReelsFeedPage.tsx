/**
 * ReelsFeedPage — Instagram / Facebook style social feed
 * Full-width cards with author info, media, captions, and engagement
 * Everyone can post photos/videos that show up here
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UnifiedShareSheet from "@/components/shared/ShareSheet";
import { supabase } from "@/integrations/supabase/client";
import { normalizeStorePostMediaUrl } from "@/utils/normalizeStorePostMediaUrl";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import NavBar from "@/components/home/NavBar";
import TipSheet from "@/components/social/TipSheet";
import {
  Loader2, Heart, MessageCircle, Share2, Eye, Bookmark,
  MoreHorizontal, Play, Volume2, VolumeX, Image as ImageIcon,
  Plus, Camera, X as XIcon, Send, Film, Radio,
  Globe, Users, Lock, FolderPlus, MapPin, Hash, ChevronDown,
  Flag, Bell, BellOff, Link2, EyeOff, AlertTriangle, ShieldAlert,
  UserX, Ban, Skull, HelpCircle, ChevronLeft, ChevronRight, MessageSquareOff,
  MessageSquare, UserCheck, Settings2, Search, Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getPostShareUrl } from "@/lib/getPublicOrigin";
import { trackInitiateCheckout } from "@/services/metaConversion";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import PullToRefresh from "@/components/shared/PullToRefresh";
import FloatingProductCard from "@/components/reels/FloatingProductCard";
import CommentsSheet from "@/components/social/CommentsSheet";
import FeedStoryRing from "@/components/social/FeedStoryRing";
import SuggestedUsersCarousel from "@/components/social/SuggestedUsersCarousel";
import CreatePostModal from "@/components/social/CreatePostModal";
import FeedSidebar from "@/components/social/FeedSidebar";
import { optimizeAvatar } from "@/utils/optimizeAvatar";

interface FeedItem {
  id: string;
  source: "store" | "user";
  media_urls: string[];
  media_type: "image" | "video";
  caption: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  author_name: string;
  author_avatar: string | null;
  author_id?: string;
  store_slug?: string;
  created_at: string;
  // Share tracking
  shared_from_post_id?: string | null;
  shared_from_user_id?: string | null;
  shared_from_user_name?: string | null;
  shared_from_user_avatar?: string | null;
  shared_from_caption?: string | null;
  shared_from_source?: "user" | "store" | null;
  shared_from_store_slug?: string | null;
  // Interaction controls from profile
  comment_control?: "everyone" | "friends" | "off";
  hide_like_counts?: boolean;
  allow_sharing?: boolean;
  allow_mentions?: boolean;
  commerce_link?: {
    link_type: "store_product" | "truck_sale";
    store_id?: string | null;
    store_product_id?: string | null;
    truck_sale_id?: string | null;
    checkout_path?: string | null;
    map_lat?: number | null;
    map_lng?: number | null;
    map_label?: string | null;
  } | null;
}

const normalizeUserPostMediaType = (mediaType: string | null | undefined): "image" | "video" =>
  mediaType === "video" || mediaType === "reel" ? "video" : "image";

const stripFeedUserPrefix = (postId: string): string => postId.replace(/^u-/, "");
const getReelsSharePostId = (item: FeedItem): string => stripFeedUserPrefix(item.id);
const getFeedInteractionPostId = (item: FeedItem): string => item.source === "user" ? stripFeedUserPrefix(item.id) : item.id;
const getFeedLikesTable = (item: FeedItem): "post_likes" | "store_post_likes" => item.source === "user" ? "post_likes" : "store_post_likes";

export default function ReelsFeedPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [shareForPost, setShareForPost] = useState<{ shareUrl: string; shareText: string; shareMediaUrl?: string; shareMediaType?: "image" | "video"; sharePostId?: string; sharePostAuthorId?: string; sharePostAuthorName?: string } | null>(null);
  const [commerceDraft, setCommerceDraft] = useState<{
    linkType: "store_product" | "truck_sale";
    storeId?: string;
    storeProductId?: string;
    truckSaleId?: string;
    checkoutPath?: string;
    mapLat?: number;
    mapLng?: number;
    mapLabel?: string;
  } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string | null } | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [reelsStartIndex, setReelsStartIndex] = useState<number | null>(null);
  const reelsScrollRef = useRef<HTMLDivElement>(null);
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [feedFilter, setFeedFilter] = useState<"all" | "photos" | "videos" | "text">("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  // Handle share-to-profile deep link
  useEffect(() => {
    const state = location.state as {
      shareToProfile?: boolean;
      openCreate?: boolean;
      shareUrl?: string;
      shareText?: string;
      shareMediaUrl?: string;
      shareMediaType?: "image" | "video";
      sharePostId?: string;
      sharePostAuthorId?: string;
      sharePostAuthorName?: string;
      commerceLinkDraft?: {
        linkType: "store_product" | "truck_sale";
        storeId?: string;
        storeProductId?: string;
        truckSaleId?: string;
        checkoutPath?: string;
        mapLat?: number;
        mapLng?: number;
        mapLabel?: string;
      };
    } | null;
    if (state?.shareToProfile && userId) {
      setShareForPost({ shareUrl: state.shareUrl || "", shareText: state.shareText || "", shareMediaUrl: state.shareMediaUrl, shareMediaType: state.shareMediaType, sharePostId: state.sharePostId, sharePostAuthorId: state.sharePostAuthorId, sharePostAuthorName: state.sharePostAuthorName });
      setCommerceDraft(state.commerceLinkDraft || null);
      setShowCreate(true);
      window.history.replaceState({}, document.title);
    } else if (state?.openCreate && userId) {
      setCommerceDraft(state.commerceLinkDraft || null);
      setShowCreate(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, userId]);

  useEffect(() => {
    const refreshFeed = () => {
      queryClient.invalidateQueries({ queryKey: ["reels-feed-grid"] });
    };

    window.addEventListener("zivo-feed-refresh", refreshFeed);
    return () => window.removeEventListener("zivo-feed-refresh", refreshFeed);
  }, [queryClient]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const authUser = data.user;
      const uid = authUser?.id || null;
      setUserId(uid);
      if (!uid) return;

      const metaAvatar = authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || null;
      const metaName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split("@")[0] || "You";
      setUserProfile({
        name: metaName,
        avatar: optimizeAvatar(metaAvatar, 96) || metaAvatar || null,
      });

      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .or(`id.eq.${uid},user_id.eq.${uid}`)
        .limit(1)
        .maybeSingle()
        .then(({ data: p }) => {
          if (p) {
            setUserProfile({
              name: (p as any).full_name || metaName,
              avatar: optimizeAvatar((p as any).avatar_url, 96) || optimizeAvatar(metaAvatar, 96) || metaAvatar || null,
            });
          }
        });
    });
  }, []);

  // User search with debounce
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const words = q.trim().toLowerCase().split(/\s+/);
        let query = supabase.from("public_profiles" as any).select("id, full_name, avatar_url").limit(20);
        words.forEach((w) => { query = query.ilike("full_name", `%${w}%`); });
        const { data } = await query;
        setSearchResults(data || []);
      } catch { setSearchResults([]); }
      setSearchLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["reels-feed-grid"],
    queryFn: async () => {
      const allItems: FeedItem[] = [];

      // Fetch store posts
      const { data: storePosts } = await supabase
        .from("store_posts")
        .select("id, media_urls, media_type, caption, likes_count, comments_count, shares_count, view_count, created_at, store_id")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (storePosts?.length) {
        const storeIds = [...new Set(storePosts.map((p: any) => p.store_id))];
        const { data: stores } = await supabase
          .from("store_profiles")
          .select("id, name, logo_url, slug")
          .in("id", storeIds);
        const storeMap = new Map((stores || []).map((s: any) => [s.id, s]));

        for (const post of storePosts as any[]) {
          const store = storeMap.get(post.store_id);
          const urls: string[] = (post.media_urls || []).map((u: string) => normalizeStorePostMediaUrl(u));
          if (!urls.length) continue;

          allItems.push({
            id: post.id,
            source: "store",
            media_urls: urls,
            media_type: (post.media_type === "video" || urls[0]?.match(/\.(mp4|mov|webm)/i)) ? "video" : "image",
            caption: post.caption,
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            shares_count: post.shares_count || 0,
            views_count: post.view_count || 0,
            author_name: store?.name || "Store",
            author_avatar: store?.logo_url || null,
            store_slug: store?.slug || null,
            created_at: post.created_at,
          });
        }
      }

      // Fetch user posts
      try {
        const { data: userPosts } = await (supabase as any)
          .from("user_posts")
          .select("id, media_url, media_urls, media_type, caption, likes_count, comments_count, shares_count, views_count, created_at, user_id, shared_from_post_id, shared_from_user_id")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(50);

        if (userPosts?.length) {
          const userIds = [...new Set(userPosts.map((p: any) => p.user_id))] as string[];
          const sharedFromUserIds = [...new Set(userPosts.filter((p: any) => p.shared_from_user_id).map((p: any) => p.shared_from_user_id))] as string[];
          const sharedFromPostIds = [...new Set(userPosts.filter((p: any) => p.shared_from_post_id).map((p: any) => p.shared_from_post_id))] as string[];

          let originalUserPosts: Array<{ id: string; user_id: string; caption: string | null }> = [];
          let originalStorePosts: Array<{ id: string; store_id: string; caption: string | null }> = [];

          if (sharedFromPostIds.length) {
            const [{ data: sourceUserPosts }, { data: sourceStorePosts }] = await Promise.all([
              (supabase as any).from("user_posts").select("id, user_id, caption").in("id", sharedFromPostIds),
              supabase.from("store_posts").select("id, store_id, caption").in("id", sharedFromPostIds),
            ]);

            originalUserPosts = (sourceUserPosts ?? []) as Array<{ id: string; user_id: string; caption: string | null }>;
            originalStorePosts = (sourceStorePosts ?? []) as Array<{ id: string; store_id: string; caption: string | null }>;
          }

          const originalUserIds = [...new Set(originalUserPosts.map((p) => p.user_id))] as string[];
          const allProfileIds = [...new Set([...userIds, ...sharedFromUserIds, ...originalUserIds].filter(Boolean))] as string[];
          const [
            { data: publicProfilesById },
            { data: publicProfilesByUserId },
            { data: profileSettingsById },
            { data: profileSettingsByUserId },
          ] = await Promise.all([
            allProfileIds.length
              ? (supabase as any).from("public_profiles").select("id, user_id, full_name, avatar_url").in("id", allProfileIds)
              : Promise.resolve({ data: [] as any[] }),
            allProfileIds.length
              ? (supabase as any).from("public_profiles").select("id, user_id, full_name, avatar_url").in("user_id", allProfileIds)
              : Promise.resolve({ data: [] as any[] }),
            allProfileIds.length
              ? (supabase as any).from("profiles").select("id, user_id, comment_control, hide_like_counts, allow_sharing, allow_mentions").in("id", allProfileIds)
              : Promise.resolve({ data: [] as any[] }),
            allProfileIds.length
              ? (supabase as any).from("profiles").select("id, user_id, comment_control, hide_like_counts, allow_sharing, allow_mentions").in("user_id", allProfileIds)
              : Promise.resolve({ data: [] as any[] }),
          ]);

          let sharedStores: Array<{ id: string; name: string; logo_url: string | null; slug: string }> = [];
          const sharedStoreIds = [...new Set(originalStorePosts.map((p) => p.store_id))] as string[];
          if (sharedStoreIds.length) {
            const { data } = await supabase
              .from("store_profiles")
              .select("id, name, logo_url, slug")
              .in("id", sharedStoreIds);
            sharedStores = (data ?? []) as Array<{ id: string; name: string; logo_url: string | null; slug: string }>;
          }

          const publicProfileMap = new Map<string, any>();
          [...(publicProfilesById || []), ...(publicProfilesByUserId || [])].forEach((profile: any) => {
            if (profile?.id) publicProfileMap.set(profile.id, profile);
            if (profile?.user_id) publicProfileMap.set(profile.user_id, profile);
          });

          const profileSettingsMap = new Map<string, any>();
          [...(profileSettingsById || []), ...(profileSettingsByUserId || [])].forEach((profile: any) => {
            if (profile?.id) profileSettingsMap.set(profile.id, profile);
            if (profile?.user_id) profileSettingsMap.set(profile.user_id, profile);
          });

          const originalUserPostMap = new Map(originalUserPosts.map((post) => [post.id, post]));
          const originalStorePostMap = new Map(originalStorePosts.map((post) => [post.id, post]));
          const sharedStoreMap = new Map(sharedStores.map((store) => [store.id, store]));

          for (const post of userPosts as any[]) {
            const profileDisplay = publicProfileMap.get(post.user_id);
            const profileSettings = profileSettingsMap.get(post.user_id);
            if (!post.media_url && !post.caption?.trim()) continue;
            const normalizedMediaType = normalizeUserPostMediaType(post.media_type);

            const originalUserPost = post.shared_from_post_id ? originalUserPostMap.get(post.shared_from_post_id) : null;
            const originalStorePost = post.shared_from_post_id ? originalStorePostMap.get(post.shared_from_post_id) : null;

            let sharedFromSource: "user" | "store" | null = null;
            let sharedFromUserId: string | null = post.shared_from_user_id || null;
            let sharedFromUserName: string | null = null;
            let sharedFromUserAvatar: string | null = null;
            let sharedFromCaption: string | null = null;
            let sharedFromStoreSlug: string | null = null;

            if (originalStorePost) {
              const sharedStore = sharedStoreMap.get(originalStorePost.store_id);
              sharedFromSource = "store";
              sharedFromUserName = sharedStore?.name?.trim() || "Store";
              sharedFromUserAvatar = sharedStore?.logo_url || null;
              sharedFromCaption = originalStorePost.caption || null;
              sharedFromStoreSlug = sharedStore?.slug || null;
            } else if (originalUserPost) {
              const sharedProfile = publicProfileMap.get(originalUserPost.user_id);
              sharedFromSource = "user";
              sharedFromUserId = originalUserPost.user_id;
              sharedFromUserName = sharedProfile?.full_name?.trim() || "Someone";
              sharedFromUserAvatar = optimizeAvatar(sharedProfile?.avatar_url, 96) || sharedProfile?.avatar_url || null;
              sharedFromCaption = originalUserPost.caption || null;
            } else if (post.shared_from_user_id) {
              const sharedProfile = publicProfileMap.get(post.shared_from_user_id);
              sharedFromSource = "user";
              sharedFromUserName = sharedProfile?.full_name?.trim() || "Someone";
              sharedFromUserAvatar = optimizeAvatar(sharedProfile?.avatar_url, 96) || sharedProfile?.avatar_url || null;
            }

            let postMediaUrls: string[] = Array.isArray(post.media_urls) && post.media_urls.length > 0
              ? post.media_urls
              : post.media_url ? [post.media_url] : [];

            allItems.push({
              id: `u-${post.id}`,
              source: "user",
              media_urls: postMediaUrls,
              media_type: normalizedMediaType,
              caption: post.caption,
              likes_count: post.likes_count || 0,
              comments_count: post.comments_count || 0,
              shares_count: post.shares_count || 0,
              views_count: post.views_count || 0,
              author_name: profileDisplay?.full_name?.trim() || "User",
              author_avatar: optimizeAvatar(profileDisplay?.avatar_url, 96) || profileDisplay?.avatar_url || null,
              author_id: post.user_id,
              created_at: post.created_at,
              shared_from_post_id: post.shared_from_post_id || null,
              shared_from_user_id: sharedFromUserId,
              shared_from_user_name: sharedFromUserName,
              shared_from_user_avatar: sharedFromUserAvatar,
              shared_from_caption: sharedFromCaption,
              shared_from_source: sharedFromSource,
              shared_from_store_slug: sharedFromStoreSlug,
              comment_control: profileSettings?.comment_control ?? "everyone",
              hide_like_counts: profileSettings?.hide_like_counts ?? false,
              allow_sharing: profileSettings?.allow_sharing ?? true,
              allow_mentions: profileSettings?.allow_mentions ?? true,
            });
          }
        }

        // Enrich with post_media table for multi-image posts
        try {
          const userItemIds = allItems.filter((i) => i.source === "user" && i.media_urls.length <= 1).map((i) => i.id.replace(/^u-/, ""));
          if (userItemIds.length) {
            const { data: postMediaRows } = await (supabase as any)
              .from("post_media")
              .select("post_id, media_url, sort_order")
              .in("post_id", userItemIds);
            if (postMediaRows?.length) {
              const mediaMap = new Map<string, string[]>();
              (postMediaRows as any[])
                .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                .forEach((row: any) => {
                  if (!mediaMap.has(row.post_id)) mediaMap.set(row.post_id, []);
                  if (row.media_url) mediaMap.get(row.post_id)!.push(row.media_url);
                });
              allItems.forEach((item) => {
                if (item.source !== "user") return;
                const rawId = item.id.replace(/^u-/, "");
                const extra = mediaMap.get(rawId);
                if (extra && extra.length > item.media_urls.length) {
                  item.media_urls = extra;
                }
              });
            }
          }
        } catch {}
      } catch {}

      try {
        const storePostIds = allItems.filter((i) => i.source === "store").map((i) => i.id);
        const userPostIds = allItems.filter((i) => i.source === "user").map((i) => i.id.replace(/^u-/, ""));

        const [storeLinksRes, userLinksRes] = await Promise.all([
          storePostIds.length
            ? (supabase as any)
                .from("social_reel_links")
                .select("post_id, post_source, link_type, store_id, store_product_id, truck_sale_id, checkout_path, map_lat, map_lng, map_label")
                .eq("post_source", "store")
                .in("post_id", storePostIds)
            : Promise.resolve({ data: [] as any[] }),
          userPostIds.length
            ? (supabase as any)
                .from("social_reel_links")
                .select("post_id, post_source, link_type, store_id, store_product_id, truck_sale_id, checkout_path, map_lat, map_lng, map_label")
                .eq("post_source", "user")
                .in("post_id", userPostIds)
            : Promise.resolve({ data: [] as any[] }),
        ]);

        const links = [...(storeLinksRes.data || []), ...(userLinksRes.data || [])] as any[];
        const linkMap = new Map(links.map((row) => [`${row.post_source}:${row.post_id}`, row]));

        allItems.forEach((item) => {
          const rawId = item.source === "user" ? item.id.replace(/^u-/, "") : item.id;
          const link = linkMap.get(`${item.source}:${rawId}`);
          if (!link) return;
          item.commerce_link = {
            link_type: link.link_type,
            store_id: link.store_id,
            store_product_id: link.store_product_id,
            truck_sale_id: link.truck_sale_id,
            checkout_path: link.checkout_path,
            map_lat: link.map_lat,
            map_lng: link.map_lng,
            map_label: link.map_label,
          };
        });
      } catch {
        // Keep feed rendering even if commerce links fail.
      }

      try {
        const userPostIds = [...new Set(
          allItems
            .filter((item) => item.source === "user")
            .map((item) => stripFeedUserPrefix(item.id))
            .filter(Boolean)
        )];

        if (userPostIds.length) {
          const commentPostIds = [...new Set([...userPostIds, ...userPostIds.map((id) => `u-${id}`)])];

          const [{ data: rawLikes }, { data: rawComments }] = await Promise.all([
            (supabase as any)
              .from("post_likes")
              .select("post_id")
              .in("post_id", userPostIds),
            (supabase as any)
              .from("post_comments")
              .select("post_id")
              .eq("post_source", "user")
              .in("post_id", commentPostIds),
          ]);

          const likeCounts = new Map<string, number>();
          for (const row of rawLikes || []) {
            const postId = String((row as any).post_id || "");
            if (!postId) continue;
            likeCounts.set(postId, (likeCounts.get(postId) || 0) + 1);
          }

          const commentCounts = new Map<string, number>();
          for (const row of rawComments || []) {
            const postId = stripFeedUserPrefix(String((row as any).post_id || ""));
            if (!postId) continue;
            commentCounts.set(postId, (commentCounts.get(postId) || 0) + 1);
          }

          allItems.forEach((item) => {
            if (item.source !== "user") return;
            const rawId = stripFeedUserPrefix(item.id);
            item.likes_count = likeCounts.get(rawId) ?? item.likes_count ?? 0;
            item.comments_count = commentCounts.get(rawId) ?? item.comments_count ?? 0;
          });
        }
      } catch {
        // Fall back to denormalized counters if interaction tables are unavailable.
      }

      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return allItems;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    const postId = new URLSearchParams(location.search).get("post");
    if (!postId || items.length === 0) return;

    const target = items.find((item) => item.id === postId || item.id === `u-${postId}`);
    if (!target) return;

    if (target.media_type === "video") {
      const videoItems = items.filter((item) => item.media_type === "video");
      const videoIndex = videoItems.findIndex((item) => item.id === target.id);
      if (videoIndex >= 0) {
        setReelsStartIndex(videoIndex);
      }
      return;
    }

    const itemIndex = items.findIndex((item) => item.id === target.id);
    if (itemIndex >= 0) {
      setFullscreenIndex(itemIndex);
    }
  }, [items, location.search]);

  useEffect(() => {
    if (reelsStartIndex === null) return;

    requestAnimationFrame(() => {
      const slide = reelsScrollRef.current?.children[reelsStartIndex] as HTMLElement | undefined;
      slide?.scrollIntoView({ block: "start" });
    });
  }, [reelsStartIndex]);

  const handlePullRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["reels-feed-grid"] });
  }, [queryClient]);

  // Listen for chat panel state to adjust layout
  const [chatOpen, setChatOpen] = useState(false);
  useEffect(() => {
    const handler = (e: any) => setChatOpen(!!e.detail?.open);
    window.addEventListener("zivo-chat-state", handler as EventListener);
    return () => window.removeEventListener("zivo-chat-state", handler as EventListener);
  }, []);

  return (
    <>
      {/* Desktop NavBar */}
      <div className="hidden lg:block relative z-[1200]">
        <NavBar />
      </div>

      <div className={cn(
        "lg:flex lg:pt-16 transition-all duration-300",
        chatOpen && "lg:pr-[360px] xl:pr-[380px] 2xl:pr-[400px]"
      )}>
        {/* Desktop Sidebar */}
        <FeedSidebar />

        {/* Main Feed Content */}
        <PullToRefresh onRefresh={handlePullRefresh} className="min-h-screen bg-background pb-20 lg:pb-0 flex-1 lg:max-w-2xl lg:mx-auto">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30 px-4 py-2.5 flex items-center gap-3 lg:pt-3" style={{ paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 0.625rem), 0.625rem)' }}>
            <h1 className="text-lg font-bold text-foreground shrink-0 lg:hidden">Feed</h1>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder="Search people..."
                className="w-full pl-9 pr-8 py-2 rounded-full bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XIcon className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Search overlay */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                className="fixed inset-0 z-50 bg-background flex flex-col"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30" style={{ paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 0.5rem), 0.5rem)' }}>
                  <button onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <ChevronLeft className="h-5 w-5 text-foreground" />
                  </button>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search people..."
                      className="w-full pl-9 pr-8 py-2.5 rounded-full bg-muted/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {searchQuery && (
                      <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <XIcon className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {searchLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : !searchQuery.trim() ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/50">
                      <Search className="h-8 w-8 mb-2" />
                      <p className="text-sm">Search for people by name</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/50">
                      <p className="text-sm">No results found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/20">
                      {searchResults.map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); navigate(`/user/${p.id}`); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                        >
                          <Avatar className="h-11 w-11 border-2 border-border/30">
                            <AvatarImage src={p.avatar_url || undefined} />
                            <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                              {(p.full_name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{p.full_name || "Unknown"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          {/* Create post prompt (logged in) */}
          {userId && (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border/10 bg-card hover:bg-muted/20 transition-colors"
            >
              <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border-2 border-primary/20 shrink-0">
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground/50">
                    <Camera className="h-4 w-4" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex-1 text-left">What's on your mind?</p>
              <div className="flex gap-1.5">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Film className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Camera className="h-3.5 w-3.5 text-orange-600" />
                </div>
              </div>
            </button>
          )}


          {/* Story Rings */}
          <FeedStoryRing />

          {/* Suggested Users */}
          <SuggestedUsersCarousel />


          {/* Posts */}
          {isLoading ? (
            <div className="flex items-center justify-center h-60">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center px-6">
              <div className="text-5xl mb-3">📸</div>
              <p className="text-base font-bold text-foreground mb-1">No posts yet</p>
              <p className="text-sm text-muted-foreground mb-4">Be the first to share something amazing!</p>
              {userId && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold active:scale-95 transition-transform shadow-lg shadow-primary/20"
                >
                  Create Post
                </button>
              )}
            </div>
          ) : (() => {
            const filteredItems = feedFilter === "all" ? items
              : feedFilter === "photos" ? items.filter(i => i.media_type === "image" && i.media_urls.length > 0)
              : feedFilter === "videos" ? items.filter(i => i.media_type === "video")
              : items.filter(i => !i.media_urls.length || !i.media_urls[0]);
            return filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
                <p className="text-sm">No {feedFilter} posts found</p>
              </div>
            ) : (
            <div className="divide-y divide-border/20">
              {filteredItems.map((item, idx) => (
                <div key={item.id}>
                  <FeedCard item={item} currentUserId={userId} onOpenFullscreen={() => {
                    if (item.media_type === 'video') {
                      setReelsStartIndex(idx);
                    } else {
                      setFullscreenIndex(idx);
                    }
                  }} />
                  {/* Inject suggested users after 3rd post */}
                  {idx === 2 && <SuggestedUsersCarousel variant="inline" />}
                </div>
              ))}
            </div>
            );
          })()}

          {/* Create Post Modal */}
          <AnimatePresence>
            {showCreate && userId && (
              <CreatePostModal
                userId={userId}
                userProfile={userProfile}
                initialCaption={shareForPost ? shareForPost.shareText : undefined}
                sharedMediaUrl={shareForPost?.shareMediaUrl}
                sharedMediaType={shareForPost?.shareMediaType}
                sharedPostId={shareForPost?.sharePostId}
                sharedPostAuthorId={shareForPost?.sharePostAuthorId}
                sharedPostAuthorName={shareForPost?.sharePostAuthorName}
                commerceLinkDraft={commerceDraft || undefined}
                onClose={() => { setShowCreate(false); setShareForPost(null); setCommerceDraft(null); }}
                onCreated={() => {
                  setShowCreate(false);
                  setShareForPost(null);
                  setCommerceDraft(null);
                  queryClient.invalidateQueries({ queryKey: ["reels-feed-grid"] });
                }}
              />
            )}
          </AnimatePresence>

          {/* TikTok/Reels-style Fullscreen Video Viewer */}
          <AnimatePresence>
            {reelsStartIndex !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] bg-black"
              >
                {/* Snap-scroll container */}
                <div ref={reelsScrollRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory">
                  {items.filter((it) => it.media_type === 'video').map((item) => (
                    <ReelSlide
                      key={item.id}
                      item={item}
                      currentUserId={userId}
                      onClose={() => setReelsStartIndex(null)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Post Detail Viewer */}
          <AnimatePresence>
            {fullscreenIndex !== null && (() => {
              const post = items[fullscreenIndex];
              if (!post) return null;
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-background flex flex-col"
                >
                  <div className="sticky top-0 z-10 flex items-center gap-3 px-3 py-2 bg-background/95 backdrop-blur-xl border-b border-border/30" style={{ paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 0.5rem), 0.5rem)' }}>
                    <button
                      onClick={() => setFullscreenIndex(null)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <h2 className="text-base font-semibold text-foreground">Post</h2>
                  </div>
                  <div
                    ref={fullscreenScrollRef}
                    className="flex-1 overflow-y-auto"
                    style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 6rem), 6rem)' }}
                  >
                    <FeedCard key={post.id} item={post} currentUserId={userId} detailMode />
                  </div>
                  <ZivoMobileNav />
                </motion.div>
              );
            })()}
          </AnimatePresence>

          <ZivoMobileNav />
        </PullToRefresh>
      </div>

    </>
  );
}

/* CreatePostModal is now imported from @/components/social/CreatePostModal */

/* ── Reel Slide (TikTok-style fullscreen video) ─────────────────── */

function ReelSlide({ item, currentUserId, onClose }: { item: FeedItem; currentUserId: string | null; onClose: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(item.likes_count);
  const [localComments, setLocalComments] = useState(item.comments_count);
  const [showCaption, setShowCaption] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const interactionPostId = getFeedInteractionPostId(item);
  const likesTable = getFeedLikesTable(item);

  // Check follow status on mount
  useEffect(() => {
    if (!currentUserId || !item.author_id || item.author_id === currentUserId) return;
    supabase.rpc("is_following", { target_user_id: item.author_id })
      .then(({ data }) => { if (typeof data === "boolean") setIsFollowing(data); });
  }, [currentUserId, item.author_id]);

  const handleReelFollow = async () => {
    if (!currentUserId || !item.author_id || followLoading) return;
    if (isFollowing) {
      setShowUnfollowConfirm(true);
      return;
    }
    setFollowLoading(true);
    try {
      await (supabase as any).from("user_followers").insert({
        follower_id: currentUserId,
        following_id: item.author_id,
      });
      setIsFollowing(true);
      try {
        const { data: sp } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", currentUserId).single();
        await supabase.functions.invoke("send-push-notification", {
          body: { user_id: item.author_id, notification_type: "new_follower", title: "New Follower 🔔", body: `${sp?.full_name || "Someone"} started following you`, data: { type: "new_follower", follower_id: currentUserId, avatar_url: sp?.avatar_url, action_url: `/user/${currentUserId}` } },
        });
      } catch {}
    } catch { /* ignore */ } finally {
      setFollowLoading(false);
    }
  };

  const executeReelUnfollow = async () => {
    if (!currentUserId || !item.author_id) return;
    setFollowLoading(true);
    try {
      await (supabase as any).from("user_followers").delete()
        .eq("follower_id", currentUserId).eq("following_id", item.author_id);
      setIsFollowing(false);
    } catch { /* ignore */ } finally {
      setFollowLoading(false);
    }
  };

  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    setLocalLikes(item.likes_count);
  }, [item.likes_count]);

  useEffect(() => {
    setLocalComments(item.comments_count);
  }, [item.comments_count]);

  useEffect(() => {
    if (!currentUserId) {
      setLiked(false);
      return;
    }

    let alive = true;
    (supabase as any)
      .from(likesTable)
      .select("id")
      .eq("post_id", interactionPostId)
      .eq("user_id", currentUserId)
      .maybeSingle()
      .then(({ data, error }: any) => {
        if (!alive || error) return;
        setLiked(Boolean(data));
      });

    return () => {
      alive = false;
    };
  }, [currentUserId, interactionPostId, likesTable]);

  const mediaUrl = item.media_urls[0];

  // Auto-play when visible via IntersectionObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.7 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to like posts");
      return;
    }

    const newLiked = !liked;
    setLiked(newLiked);
    setLocalLikes((prev) => Math.max(0, prev + (newLiked ? 1 : -1)));

    try {
      if (newLiked) {
        const { error } = await (supabase as any)
          .from(likesTable)
          .insert({ post_id: interactionPostId, user_id: currentUserId });
        if (error) throw error;
        // Push notification to post author
        if (item.author_id && item.author_id !== currentUserId) {
          try {
            const { data: sp } = await supabase.from("profiles").select("full_name").eq("user_id", currentUserId).single();
            await supabase.functions.invoke("send-push-notification", {
              body: { user_id: item.author_id, notification_type: "post_liked", title: "New Like ❤️", body: `${sp?.full_name || "Someone"} liked your post`, data: { type: "post_liked", post_id: item.id, liker_id: currentUserId, action_url: `/reels?post=${item.id}` } },
            });
          } catch {}
        }
      } else {
        const { error } = await (supabase as any)
          .from(likesTable)
          .delete()
          .eq("post_id", interactionPostId)
          .eq("user_id", currentUserId);
        if (error) throw error;
      }

      void queryClient.invalidateQueries({ queryKey: ["reels-feed-grid"] });
    } catch {
      setLiked(!newLiked);
      setLocalLikes((prev) => Math.max(0, prev - (newLiked ? 1 : -1)));
      toast.error("Failed to update like");
    }
  };

  // Comments are now handled by CommentsSheet

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  const shareUrl = getPostShareUrl(getReelsSharePostId(item));
  const shareText = encodeURIComponent(item.caption || `Check out this post by ${item.author_name}`);
  const shareEncodedUrl = encodeURIComponent(shareUrl);

  const handleCopyLink = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.style.cssText = "position:fixed;opacity:0;left:-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("Link copied!");
    } catch {
      toast.info("Long-press URL bar to copy");
    }
    setShowShareSheet(false);
  };

  const handleBuyNow = async () => {
    const commerce = item.commerce_link;
    if (!commerce) return;

    const checkoutPath = commerce.checkout_path
      || (commerce.link_type === "store_product" && commerce.store_product_id
        ? `/grocery/shop/${item.store_slug || ""}?buy=${commerce.store_product_id}`
        : commerce.link_type === "truck_sale" && commerce.truck_sale_id
          ? `/marketplace?truckSale=${commerce.truck_sale_id}`
          : null);

    if (!checkoutPath) {
      toast.error("Checkout path is not configured for this reel");
      return;
    }

    await trackInitiateCheckout({
      eventId: `${item.id}-buy-now-${Date.now()}`,
      externalId: currentUserId || undefined,
      sourceType: commerce.link_type,
      sourceTable: "social_reel_links",
      sourceId: item.id,
      payload: {
        post_id: item.id,
        store_product_id: commerce.store_product_id,
        truck_sale_id: commerce.truck_sale_id,
      },
    });

    onClose();
    navigate(checkoutPath);
  };

  const shareOptions = [
    { label: "WhatsApp", color: "#25D366", svg: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488 11.821 11.821 0 0012.05 0zm0 21.785a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 012.15 11.892C2.15 6.443 6.602 1.992 12.053 1.992a9.84 9.84 0 016.988 2.899 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.9-9.884 9.9z", url: `https://wa.me/?text=${shareText}%20${shareEncodedUrl}` },
    { label: "Telegram", color: "#0088CC", svg: "M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm5.091 8.104l-1.681 7.927c-.128.564-.46.701-.931.437l-2.57-1.894-1.24 1.193c-.137.137-.253.253-.519.253l.185-2.618 4.763-4.303c.207-.184-.045-.286-.321-.102l-5.889 3.71-2.537-.793c-.552-.172-.563-.552.115-.817l9.915-3.822c.459-.166.861.112.71.827z", url: `https://t.me/share/url?url=${shareEncodedUrl}&text=${shareText}` },
    { label: "Facebook", color: "#1877F2", svg: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", url: `https://www.facebook.com/sharer/sharer.php?u=${shareEncodedUrl}` },
    { label: "X", color: "#000000", svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", url: `https://x.com/intent/tweet?text=${shareText}&url=${shareEncodedUrl}` },
    { label: "Email", color: "#EA4335", svg: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z", url: `mailto:?subject=${shareText}&body=${shareEncodedUrl}` },
    { label: "SMS", color: "#34B7F1", svg: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z", url: `sms:?body=${shareText}%20${shareEncodedUrl}` },
  ];

  const moreShareOptions = [
    { label: "TikTok", color: "#000000", svg: "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", url: "__copy__", copyMessage: "Link copied! Paste it in TikTok" },
    { label: "Instagram", color: "#E4405F", svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", url: "__copy__", copyMessage: "Link copied! Paste it in Instagram" },
    { label: "Snapchat", color: "#FFFC00", svg: "M12 0c-1.62 0-3.066.612-4.152 1.612C6.726 2.726 6.12 4.26 6.12 5.88c0 .66.108 1.32.264 1.956-.132.024-.276.036-.42.036-.384 0-.756-.108-1.08-.3a.636.636 0 00-.336-.096c-.264 0-.492.168-.564.42-.06.204-.012.408.12.564.516.588 1.2.96 1.944 1.14-.06.36-.18.708-.36 1.02-.36.636-.924 1.128-1.608 1.404a.648.648 0 00-.384.588c0 .24.132.456.336.576.66.384 1.38.576 2.1.612.072.324.156.66.264.984.06.18.252.3.444.3h.06c.468-.072 1.008-.156 1.536-.156.396 0 .78.048 1.14.192.516.204 1.044.54 1.74.54h.048c.696 0 1.224-.336 1.74-.54.36-.144.744-.192 1.14-.192.528 0 1.068.084 1.536.156h.06c.192 0 .384-.12.444-.3.108-.324.192-.66.264-.984.72-.036 1.44-.228 2.1-.612a.648.648 0 00.336-.576.648.648 0 00-.384-.588c-.684-.276-1.248-.768-1.608-1.404a3.588 3.588 0 01-.36-1.02c.744-.18 1.428-.552 1.944-1.14a.636.636 0 00.12-.564.588.588 0 00-.564-.42.636.636 0 00-.336.096c-.324.192-.696.3-1.08.3-.144 0-.288-.012-.42-.036.156-.636.264-1.296.264-1.956 0-1.62-.612-3.156-1.728-4.272C15.066.612 13.62 0 12 0z", url: `https://www.snapchat.com/scan?attachmentUrl=${shareEncodedUrl}` },
    { label: "LinkedIn", color: "#0A66C2", svg: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareEncodedUrl}` },
  ];

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full snap-start snap-always flex-shrink-0"
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={mediaUrl}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="h-full w-full object-cover"
      />

      {/* Pause indicator */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="h-20 w-20 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-10 w-10 text-white fill-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close button - top left */}
      <button
        onClick={onClose}
        className="absolute top-0 left-4 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
        style={{ marginTop: 'max(calc(env(safe-area-inset-top, 0px) + 0.75rem), 1rem)' }}
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>

      {/* Right side action buttons */}
      <div
        className="absolute right-3 flex flex-col items-center gap-4"
        style={{ bottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 1.5rem), 2.5rem)' }}
      >
        {/* Mute */}
        <button onClick={() => setMuted(!muted)} className="flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center">
          <div className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            {muted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
          </div>
        </button>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center">
          <Heart className={cn("h-7 w-7 drop-shadow-lg transition-all", liked ? "text-red-500 fill-red-500 scale-110" : "text-white")} />
          {!item.hide_like_counts && (
            <span className="text-white text-[11px] font-semibold drop-shadow">
              {localLikes > 999 ? `${(localLikes / 1000).toFixed(1)}k` : localLikes}
            </span>
          )}
        </button>

        {/* Comment */}
        <button
          onClick={() => {
            if (!currentUserId) { toast.error("Please sign in to comment"); return; }
            setShowComments(true);
          }}
          className="flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center"
        >
          <MessageCircle className="h-7 w-7 text-white drop-shadow-lg" />
          {localComments > 0 && (
            <span className="text-white text-[11px] font-semibold drop-shadow">{localComments}</span>
          )}
        </button>

        {/* Views */}
        <div className="flex flex-col items-center gap-1">
          <Eye className="h-6 w-6 text-white/70 drop-shadow-lg" />
          {item.views_count > 0 && <span className="text-white/70 text-[11px] font-semibold drop-shadow">{item.views_count}</span>}
        </div>

        {/* Share */}
        <button onClick={() => setShowShareSheet(true)} className="flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center">
          <Share2 className="h-7 w-7 text-white drop-shadow-lg" />
          <span className="text-white text-[10px] font-medium drop-shadow">Share</span>
        </button>

        {item.commerce_link && (
          <button onClick={handleBuyNow} className="flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] justify-center">
            <div className="px-2.5 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shadow-lg">
              Buy Now
            </div>
          </button>
        )}
      </div>

      {/* Floating Product Card — "Buy from [Shop] - Xkm away" */}
      {item.commerce_link && (
        <div
          className="absolute left-4 right-20"
          style={{ bottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 5.5rem), 7rem)' }}
        >
          <FloatingProductCard
            commerceLink={item.commerce_link}
            shopName={item.author_name}
            storeSlug={item.store_slug}
            postId={item.id}
            currentUserId={currentUserId}
            onNavigate={onClose}
          />
        </div>
      )}

      {/* Right side continued - Author avatar with Follow button */}
      <div
        className="absolute right-3 flex flex-col items-center"
        style={{ bottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 1.5rem), 2.5rem)' }}
      >
        <div className="relative">
          <button
            onClick={() => {
              onClose();
              if (item.source === "store" && item.store_slug) {
                navigate(`/grocery/shop/${item.store_slug}`);
              } else if (item.author_id) {
                navigate(`/user/${item.author_id}`);
              }
            }}
          >
            <div className="h-11 w-11 rounded-full overflow-hidden border-2 border-white shrink-0">
              {item.author_avatar ? (
                <img src={item.author_avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                  {item.author_name[0]}
                </div>
              )}
            </div>
          </button>
          {/* Follow button */}
          {currentUserId && item.author_id !== currentUserId && (
             <button
              onClick={handleReelFollow}
              disabled={followLoading}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: isFollowing ? 'hsl(var(--muted))' : 'hsl(var(--primary))' }}
            >
              {followLoading ? (
                <Loader2 className="h-2.5 w-2.5 animate-spin text-primary-foreground" />
              ) : isFollowing ? (
                <UserCheck className="h-2.5 w-2.5 text-primary-foreground" />
              ) : (
                <Plus className="h-3 w-3 text-primary-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bottom overlay - Author + Caption */}
      <div
        className="absolute left-0 right-16 bottom-0 px-4"
        style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 1rem), 2rem)' }}
      >
        {/* Author info */}
        <button
          onClick={() => {
            onClose();
            if (item.source === "store" && item.store_slug) {
              navigate(`/grocery/shop/${item.store_slug}`);
            } else if (item.author_id) {
              navigate(`/user/${item.author_id}`);
            }
          }}
          className="flex items-center gap-2.5 mb-2"
        >
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/40 shrink-0">
            {item.author_avatar ? (
              <img src={item.author_avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                {item.author_name[0]}
              </div>
            )}
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-bold drop-shadow-lg">{item.author_name}</p>
            <p className="text-white/60 text-[10px] drop-shadow">{timeAgo}</p>
          </div>
        </button>

        {/* Caption */}
        {item.caption && (
          <div onClick={() => setShowCaption(!showCaption)}>
            <p className={cn(
              "text-white text-[13px] leading-snug drop-shadow-lg",
              !showCaption && "line-clamp-2"
            )}>
              {item.caption}
            </p>
            {item.caption.length > 80 && !showCaption && (
              <span className="text-white/60 text-xs">more</span>
            )}
          </div>
        )}
      </div>

      {/* Comments Bottom Sheet */}
      <CommentsSheet
        open={showComments}
        onClose={() => {
          setShowComments(false);
          void queryClient.invalidateQueries({ queryKey: ["reels-feed-grid"] });
        }}
        postId={interactionPostId}
        postSource={item.source}
        currentUserId={currentUserId}
        commentsCount={localComments}
        onCommentsCountChange={setLocalComments}
        dark
      />

      {/* Share Sheet */}
      <AnimatePresence>
        {showShareSheet && (
          <UnifiedShareSheet
            shareUrl={shareUrl}
            shareText={item.caption || `Check out this post by ${item.author_name}`}
            shareMediaUrl={mediaUrl}
            shareMediaType={item.media_type === "video" ? "video" : "image"}
            onClose={() => setShowShareSheet(false)}
            positioning="absolute"
            zIndex={80}
          />
        )}
      </AnimatePresence>
      {/* Unfollow confirm dialog */}
      <AlertDialog open={showUnfollowConfirm} onOpenChange={setShowUnfollowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unfollow?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to unfollow {item.author_name}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { executeReelUnfollow(); setShowUnfollowConfirm(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, unfollow</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── Individual Feed Card (IG/FB style) ──────────────────────────── */

function FeedCard({ item, currentUserId, onOpenFullscreen, autoPlayVideo, detailMode }: { item: FeedItem; currentUserId: string | null; onOpenFullscreen?: () => void; autoPlayVideo?: boolean; detailMode?: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [reportStep, setReportStep] = useState<"categories" | "sub" | "submitted">("categories");
  const [reportCategory, setReportCategory] = useState("");
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [commentSetting, setCommentSetting] = useState<"everyone" | "friends" | "off">(item.comment_control || "everyone");
  const [showCommentSettings, setShowCommentSettings] = useState(false);
  const [localLikes, setLocalLikes] = useState(item.likes_count);
  const [localComments, setLocalComments] = useState(item.comments_count);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showEditCaption, setShowEditCaption] = useState(false);
  const [editCaptionText, setEditCaptionText] = useState(item.caption || "");
  const [editSaving, setEditSaving] = useState(false);
  const [tipTarget, setTipTarget] = useState<{ id: string; name: string } | null>(null);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (item.media_urls.length <= 1) return;
    if (Math.abs(touchDeltaX.current) > 50) {
      if (touchDeltaX.current < 0 && currentMedia < item.media_urls.length - 1) {
        setCurrentMedia(currentMedia + 1);
      } else if (touchDeltaX.current > 0 && currentMedia > 0) {
        setCurrentMedia(currentMedia - 1);
      }
    }
    touchDeltaX.current = 0;
  };
  const lastTapRef = useRef(0);

  const isOwner = Boolean(currentUserId && item.author_id === currentUserId);
  const interactionPostId = getFeedInteractionPostId(item);
  const likesTable = getFeedLikesTable(item);

  useEffect(() => {
    setLocalLikes(item.likes_count);
  }, [item.likes_count]);

  useEffect(() => {
    setLocalComments(item.comments_count);
  }, [item.comments_count]);

  useEffect(() => {
    if (!currentUserId) {
      setLiked(false);
      return;
    }

    let alive = true;
    (supabase as any)
      .from(likesTable)
      .select("id")
      .eq("post_id", interactionPostId)
      .eq("user_id", currentUserId)
      .maybeSingle()
      .then(({ data, error }: any) => {
        if (!alive || error) return;
        setLiked(Boolean(data));
      });

    return () => {
      alive = false;
    };
  }, [currentUserId, interactionPostId, likesTable]);

  // Check follow status
  useEffect(() => {
    if (!currentUserId || !item.author_id || isOwner) return;
    supabase.rpc("is_following" as any, { target_user_id: item.author_id })
      .then(({ data }: any) => { if (typeof data === "boolean") setIsFollowingAuthor(data); });
  }, [currentUserId, item.author_id, isOwner]);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId || !item.author_id || followLoading) return;
    if (isFollowingAuthor) {
      setShowUnfollowConfirm(true);
      return;
    }
    setFollowLoading(true);
    try {
      await (supabase as any).from("user_followers").insert({
        follower_id: currentUserId,
        following_id: item.author_id,
      });
      setIsFollowingAuthor(true);
      try {
        const { data: sp } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", currentUserId).single();
        await supabase.functions.invoke("send-push-notification", {
          body: { user_id: item.author_id, notification_type: "new_follower", title: "New Follower 🔔", body: `${sp?.full_name || "Someone"} started following you`, data: { type: "new_follower", follower_id: currentUserId, avatar_url: sp?.avatar_url, action_url: `/user/${currentUserId}` } },
        });
      } catch {}
    } catch { /* ignore */ } finally {
      setFollowLoading(false);
    }
  };

  const executeFeedUnfollow = async () => {
    if (!currentUserId || !item.author_id) return;
    setFollowLoading(true);
    try {
      await supabase.from("user_followers" as any).delete()
        .eq("follower_id", currentUserId).eq("following_id", item.author_id);
      setIsFollowingAuthor(false);
    } catch { /* ignore */ } finally {
      setFollowLoading(false);
    }
  };

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  // Auto-play videos when visible or when autoPlayVideo is set
  useEffect(() => {
    if (item.media_type !== "video") return;
    if (autoPlayVideo) {
      setTimeout(() => {
        videoRef.current?.play().catch(() => {});
        setIsPlaying(true);
      }, 100);
      return;
    }
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [item.media_type, autoPlayVideo]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to like posts");
      return;
    }

    const newLiked = !liked;
    setLiked(newLiked);
    setLocalLikes((prev) => Math.max(0, prev + (newLiked ? 1 : -1)));

    try {
      if (newLiked) {
        const { error } = await (supabase as any)
          .from(likesTable)
          .insert({ post_id: interactionPostId, user_id: currentUserId });
        if (error) throw error;
        // Push notification to post author
        if (item.author_id && item.author_id !== currentUserId) {
          try {
            const { data: sp } = await supabase.from("profiles").select("full_name").eq("user_id", currentUserId).single();
            await supabase.functions.invoke("send-push-notification", {
              body: { user_id: item.author_id, notification_type: "post_liked", title: "New Like ❤️", body: `${sp?.full_name || "Someone"} liked your post`, data: { type: "post_liked", post_id: item.id, liker_id: currentUserId, action_url: `/reels?post=${item.id}` } },
            });
          } catch {}
        }
      } else {
        const { error } = await (supabase as any)
          .from(likesTable)
          .delete()
          .eq("post_id", interactionPostId)
          .eq("user_id", currentUserId);
        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["reels-feed-grid"] });
    } catch {
      setLiked(!newLiked);
      setLocalLikes((prev) => Math.max(0, prev - (newLiked ? 1 : -1)));
      toast.error("Failed to update like");
    }
  };

  // Double-tap to like
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) handleLike();
      setShowDoubleTapHeart(true);
      setTimeout(() => setShowDoubleTapHeart(false), 800);
    }
    lastTapRef.current = now;
  };

  // Emoji reactions
  const REACTIONS = ["❤️", "😂", "😮", "😢", "🔥", "👏"];
  const handleReaction = (emoji: string) => {
    setSelectedReaction(selectedReaction === emoji ? null : emoji);
    setShowReactionPicker(false);
    toast.success(`Reacted with ${emoji}`);
  };

  const handleShare = () => {
    setShowShareSheet(true);
  };

  const handleBuyNow = async () => {
    const commerce = item.commerce_link;
    if (!commerce) return;

    const checkoutPath = commerce.checkout_path
      || (commerce.link_type === "store_product" && commerce.store_product_id
        ? `/grocery/shop/${item.store_slug || ""}?buy=${commerce.store_product_id}`
        : commerce.link_type === "truck_sale" && commerce.truck_sale_id
          ? `/marketplace?truckSale=${commerce.truck_sale_id}`
          : null);

    if (!checkoutPath) {
      toast.error("Checkout path is not configured for this reel");
      return;
    }

    await trackInitiateCheckout({
      eventId: `${item.id}-buy-now-${Date.now()}`,
      externalId: currentUserId || undefined,
      sourceType: commerce.link_type,
      sourceTable: "social_reel_links",
      sourceId: item.id,
      payload: {
        post_id: item.id,
        store_product_id: commerce.store_product_id,
        truck_sale_id: commerce.truck_sale_id,
      },
    });

    navigate(checkoutPath);
  };

  const shareUrl = getPostShareUrl(getReelsSharePostId(item));
  const shareText = encodeURIComponent(item.caption || `Check out this post by ${item.author_name}`);
  const shareEncodedUrl = encodeURIComponent(shareUrl);

  const shareOptions = [
    { label: "WhatsApp", color: "#25D366", svg: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488 11.821 11.821 0 0012.05 0zm0 21.785a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 012.15 11.892C2.15 6.443 6.602 1.992 12.053 1.992a9.84 9.84 0 016.988 2.899 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.9-9.884 9.9z", url: `https://wa.me/?text=${shareText}%20${shareEncodedUrl}` },
    { label: "Telegram", color: "#0088CC", svg: "M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm5.091 8.104l-1.681 7.927c-.128.564-.46.701-.931.437l-2.57-1.894-1.24 1.193c-.137.137-.253.253-.519.253l.185-2.618 4.763-4.303c.207-.184-.045-.286-.321-.102l-5.889 3.71-2.537-.793c-.552-.172-.563-.552.115-.817l9.915-3.822c.459-.166.861.112.71.827z", url: `https://t.me/share/url?url=${shareEncodedUrl}&text=${shareText}` },
    { label: "Facebook", color: "#1877F2", svg: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", url: `https://www.facebook.com/sharer/sharer.php?u=${shareEncodedUrl}` },
    { label: "X", color: "#000000", svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", url: `https://x.com/intent/tweet?text=${shareText}&url=${shareEncodedUrl}` },
    { label: "Email", color: "#EA4335", svg: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z", url: `mailto:?subject=${shareText}&body=${shareEncodedUrl}` },
    { label: "SMS", color: "#34B7F1", svg: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z", url: `sms:?body=${shareText}%20${shareEncodedUrl}` },
  ];

  const moreShareOptions = [
    { label: "TikTok", color: "#000000", svg: "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", url: "__copy__", copyMessage: "Link copied! Paste it in TikTok" },
    { label: "Instagram", color: "#E4405F", svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", url: "__copy__", copyMessage: "Link copied! Paste it in Instagram" },
    { label: "Snapchat", color: "#FFFC00", svg: "M12 0c-1.62 0-3.066.612-4.152 1.612C6.726 2.726 6.12 4.26 6.12 5.88c0 .66.108 1.32.264 1.956-.132.024-.276.036-.42.036-.384 0-.756-.108-1.08-.3a.636.636 0 00-.336-.096c-.264 0-.492.168-.564.42-.06.204-.012.408.12.564.516.588 1.2.96 1.944 1.14-.06.36-.18.708-.36 1.02-.36.636-.924 1.128-1.608 1.404a.648.648 0 00-.384.588c0 .24.132.456.336.576.66.384 1.38.576 2.1.612.072.324.156.66.264.984.06.18.252.3.444.3h.06c.468-.072 1.008-.156 1.536-.156.396 0 .78.048 1.14.192.516.204 1.044.54 1.74.54h.048c.696 0 1.224-.336 1.74-.54.36-.144.744-.192 1.14-.192.528 0 1.068.084 1.536.156h.06c.192 0 .384-.12.444-.3.108-.324.192-.66.264-.984.72-.036 1.44-.228 2.1-.612a.648.648 0 00.336-.576.648.648 0 00-.384-.588c-.684-.276-1.248-.768-1.608-1.404a3.588 3.588 0 01-.36-1.02c.744-.18 1.428-.552 1.944-1.14a.636.636 0 00.12-.564.588.588 0 00-.564-.42.636.636 0 00-.336.096c-.324.192-.696.3-1.08.3-.144 0-.288-.012-.42-.036.156-.636.264-1.296.264-1.956 0-1.62-.612-3.156-1.728-4.272C15.066.612 13.62 0 12 0z", url: `https://www.snapchat.com/scan?attachmentUrl=${shareEncodedUrl}` },
    { label: "LinkedIn", color: "#0A66C2", svg: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareEncodedUrl}` },
    { label: "Pinterest", color: "#E60023", svg: "M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z", url: `https://pinterest.com/pin/create/button/?url=${shareEncodedUrl}&description=${shareText}` },
    { label: "Reddit", color: "#FF4500", svg: "M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.462.342.342 0 00-.462 0c-.545.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.205-.095z", url: `https://reddit.com/submit?url=${shareEncodedUrl}&title=${shareText}` },
  ];


  const handleCopyLink = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.style.cssText = "position:fixed;opacity:0;left:-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("Link copied!");
    } catch {
      toast.info("Long-press URL bar to copy");
    }
    setShowShareSheet(false);
  };

  const handleSave = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to bookmark posts");
      return;
    }
    const newSaved = !saved;
    setSaved(newSaved);
    if (newSaved) {
      await (supabase as any).from("bookmarks").insert({
        user_id: currentUserId,
        item_id: item.id,
        item_type: "post",
        title: item.caption || `Post by ${item.author_name}`,
        collection_name: "Posts",
      });
      toast.success("Saved to bookmarks");
    } else {
      await (supabase as any).from("bookmarks").delete().eq("user_id", currentUserId).eq("item_id", item.id);
      toast.success("Removed from bookmarks");
    }
  };

  const handleEditPost = async () => {
    if (!currentUserId || !isOwner) return;
    setEditSaving(true);
    try {
      const realId = item.id.replace(/^u-/, "");
      const table = item.source === "store" ? "store_posts" : "user_posts";
      const { error } = await (supabase as any).from(table).update({ caption: editCaptionText }).eq("id", realId);
      if (error) throw error;
      item.caption = editCaptionText;
      setShowEditCaption(false);
      toast.success("Post updated!");
      queryClient.invalidateQueries({ queryKey: ["reels-feed-grid"] });
    } catch {
      toast.error("Failed to update post");
    }
    setEditSaving(false);
  };

  const handleComment = () => {
    if (commentSetting === "off") {
      toast.error("Comments are turned off for this post");
      return;
    }
    if (!currentUserId) {
      toast.error("Please sign in to comment");
      return;
    }
    setShowComments(!showComments);
  };

  // Comments are now handled by CommentsSheet

  const mediaUrl = item.media_urls[currentMedia] || item.media_urls[0];
  const hasMedia = Boolean(mediaUrl);

  const isSharedPost = Boolean(item.shared_from_post_id || item.shared_from_user_id);

  return (
    <div className="bg-card">
      {isSharedPost ? (
        /* ── Facebook-style shared post layout ────────────────── */
        <>
          {/* Sharer header */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => item.author_id && navigate(`/user/${item.author_id}`)}
              className="flex items-center gap-3 px-3 py-2.5 flex-1 min-w-0 active:opacity-70"
            >
              <div className="h-9 w-9 rounded-full overflow-hidden bg-muted border border-border/30 shrink-0">
                {item.author_avatar ? (
                  <img src={item.author_avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-xs font-bold">
                    {item.author_name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-semibold text-foreground truncate">{item.author_name}</p>
                <div className="flex items-center gap-1">
                  <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <Globe className="h-2.5 w-2.5 text-muted-foreground" />
                </div>
              </div>
            </button>
            {/* Follow button */}
            {!isOwner && item.author_id && currentUserId && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={cn(
                  "text-[12px] font-semibold px-3 py-1 rounded-md transition-all active:scale-95",
                  isFollowingAuthor ? "text-muted-foreground" : "text-primary"
                )}
              >
                {followLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isFollowingAuthor ? "Following" : "Follow"}
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowPostMenu(true); }}
              className="p-1.5 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Sharer's own caption (not the original post's caption) */}
          {item.caption && item.caption !== item.shared_from_caption && (
            <div className="px-3 pb-2">
              <p className="text-[13px] text-foreground">{item.caption}</p>
            </div>
          )}

          {/* Embedded original post card */}
          <div className="mx-3 mb-2 border border-border/50 rounded-2xl overflow-hidden bg-card shadow-sm">
            {/* Original author header */}
            <div className="flex items-center px-3 py-2.5">
              <button
                type="button"
                onClick={() => {
                  if (item.shared_from_source === "store" && item.shared_from_store_slug) {
                    navigate(`/grocery/shop/${item.shared_from_store_slug}`);
                  } else if (item.shared_from_user_id) {
                    navigate(`/user/${item.shared_from_user_id}`);
                  }
                }}
                className="flex items-center gap-2.5 flex-1 min-w-0 active:opacity-70"
              >
                <div className="h-9 w-9 rounded-full overflow-hidden bg-muted border border-border/30 shrink-0">
                  {item.shared_from_user_avatar ? (
                    <img src={item.shared_from_user_avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-xs font-bold">
                      {(item.shared_from_user_name || (item.shared_from_source === "store" ? "S" : "?"))[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-semibold text-foreground truncate">
                    {item.shared_from_user_name || (item.shared_from_source === "store" ? "Store" : "Someone")}
                  </p>
                  <div className="flex items-center gap-1">
                    <Globe className="h-2.5 w-2.5 text-muted-foreground" />
                  </div>
                </div>
              </button>
              {/* Follow button */}
              {item.shared_from_user_id && item.shared_from_user_id !== currentUserId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success(`Following ${item.shared_from_user_name || "user"}`);
                  }}
                  className="text-[12px] font-semibold text-primary px-2 py-1 active:opacity-70"
                >
                  Follow
                </button>
              )}
            </div>

            {/* Original post caption */}
            {item.shared_from_caption && (
              <div className="px-3 pb-2">
                <p className="text-[13px] text-foreground">{item.shared_from_caption}</p>
              </div>
            )}

            {/* Original post media */}
            <div ref={containerRef} className={cn("relative overflow-hidden", hasMedia ? (item.media_type === "video" ? "aspect-[9/16] max-h-[500px] w-auto mx-auto bg-black rounded-xl" : "") : "")}>
              {hasMedia ? (
                item.media_type === "video" ? (
                  <>
                    <video
                      ref={videoRef}
                      src={mediaUrl}
                      muted={muted}
                      loop
                      playsInline
                      preload="metadata"
                      onClick={() => onOpenFullscreen ? onOpenFullscreen() : togglePlay()}
                      className="h-full w-full object-cover cursor-pointer"
                    />
                    {!isPlaying && (
                      <button onClick={() => onOpenFullscreen ? onOpenFullscreen() : togglePlay()} className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Play className="h-14 w-14 text-white/80 fill-white/80 drop-shadow-lg" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                      className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center min-h-[44px] min-w-[44px]"
                    >
                      {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                    </button>
                  </>
                ) : item.media_urls.length === 1 ? (
                  <div className="relative aspect-square md:aspect-[4/3] w-full bg-black max-h-[70vh]">
                    <img src={mediaUrl} alt={item.caption || "Shared post"} className="h-full w-full object-cover cursor-pointer" loading="lazy" onClick={() => onOpenFullscreen?.()} />
                  </div>
                ) : item.media_urls.length === 2 ? (
                  <div className="grid grid-cols-2 gap-0.5 w-full aspect-square md:aspect-[2/1]">
                    {item.media_urls.map((url, i) => (
                      <div key={i} className="relative bg-black overflow-hidden">
                        <img src={url} alt="" className="h-full w-full object-cover cursor-pointer" loading="lazy" onClick={() => { setCurrentMedia(i); onOpenFullscreen?.(); }} />
                      </div>
                    ))}
                  </div>
                ) : item.media_urls.length === 3 ? (
                  <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full aspect-square md:aspect-[3/2]">
                    <div className="relative row-span-2 bg-black overflow-hidden">
                      <img src={item.media_urls[0]} alt="" className="h-full w-full object-cover cursor-pointer" loading="lazy" onClick={() => { setCurrentMedia(0); onOpenFullscreen?.(); }} />
                    </div>
                    <div className="relative bg-black overflow-hidden">
                      <img src={item.media_urls[1]} alt="" className="h-full w-full object-cover cursor-pointer" loading="lazy" onClick={() => { setCurrentMedia(1); onOpenFullscreen?.(); }} />
                    </div>
                    <div className="relative bg-black overflow-hidden">
                      <img src={item.media_urls[2]} alt="" className="h-full w-full object-cover cursor-pointer" loading="lazy" onClick={() => { setCurrentMedia(2); onOpenFullscreen?.(); }} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-[3px] w-full aspect-square overflow-hidden rounded-lg">
                    {item.media_urls.slice(0, 4).map((url, i) => (
                      <div key={i} className="relative bg-muted overflow-hidden">
                        <img src={url} alt="" className="h-full w-full object-cover cursor-pointer" loading="lazy" onClick={() => { setCurrentMedia(i); onOpenFullscreen?.(); }} />
                        {i === 3 && item.media_urls.length > 4 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer" onClick={() => { setCurrentMedia(3); onOpenFullscreen?.(); }}>
                            <span className="text-white text-2xl font-bold">+{item.media_urls.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : null}
            </div>
          </div>
        </>
      ) : (
        /* ── Normal post layout ────────────────────────────────── */
        <>
          {/* Author header */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                if (item.source === "store" && item.store_slug) {
                  navigate(`/grocery/shop/${item.store_slug}`);
                } else if (item.author_id) {
                  navigate(`/user/${item.author_id}`);
                }
              }}
              className="flex items-center gap-3 px-3 py-2.5 flex-1 min-w-0 active:opacity-70"
            >
              <div className="h-9 w-9 rounded-full overflow-hidden bg-muted border border-border/30 shrink-0">
                {item.author_avatar ? (
                  <img src={item.author_avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-xs font-bold">
                    {item.author_name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-semibold text-foreground truncate">{item.author_name}</p>
                <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
              </div>
            </button>
            {/* Follow button */}
            {!isOwner && item.author_id && currentUserId && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={cn(
                  "text-[12px] font-semibold px-3 py-1 rounded-md transition-all active:scale-95",
                  isFollowingAuthor
                    ? "text-muted-foreground"
                    : "text-primary"
                )}
              >
                {followLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isFollowingAuthor ? "Following" : "Follow"}
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowPostMenu(true); }}
              className="p-1.5 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Caption before media for normal posts */}
          {item.caption && (
            <div className="px-3 pb-2">
              <p className="text-[13px] text-foreground">{item.caption}</p>
            </div>
          )}

           {/* Media */}
          <div
            ref={containerRef}
            onClick={handleDoubleTap}
            onTouchStart={item.media_urls.length > 1 && item.media_type !== "video" ? undefined : (item.media_urls.length > 1 ? handleTouchStart : undefined)}
            onTouchMove={item.media_urls.length > 1 && item.media_type !== "video" ? undefined : (item.media_urls.length > 1 ? handleTouchMove : undefined)}
            onTouchEnd={item.media_urls.length > 1 && item.media_type !== "video" ? undefined : (item.media_urls.length > 1 ? handleTouchEnd : undefined)}
            className={cn("relative overflow-hidden", hasMedia ? (item.media_type === "video" ? "aspect-[9/16] max-h-[500px] w-auto mx-auto bg-black rounded-xl" : "") : "")}
          >
            {hasMedia ? (
              item.media_type === "video" ? (
                <>
                  <video
                    ref={videoRef}
                    src={mediaUrl}
                    muted={muted}
                    loop
                    playsInline
                    preload="metadata"
                    onClick={() => onOpenFullscreen ? onOpenFullscreen() : togglePlay()}
                    className="h-full w-full object-cover cursor-pointer"
                  />
                  {!isPlaying && (
                    <button onClick={() => onOpenFullscreen ? onOpenFullscreen() : togglePlay()} className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Play className="h-14 w-14 text-white/80 fill-white/80 drop-shadow-lg" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                    className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center min-h-[44px] min-w-[44px]"
                  >
                    {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                  </button>
                  {item.commerce_link && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}
                      className="absolute bottom-3 left-3 px-3 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg min-h-[44px]"
                    >
                      Buy Now
                    </button>
                  )}
                </>
              ) : detailMode ? (
                /* Detail mode — horizontal swipeable carousel with dots */
                <div className="relative w-full">
                  <div
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      const idx = Math.round(el.scrollLeft / el.clientWidth);
                      setCurrentMedia(idx);
                    }}
                  >
                    {item.media_urls.map((url, i) => (
                      <div key={i} className="flex-shrink-0 w-full snap-center bg-black aspect-square flex items-center justify-center">
                        <img
                          src={url}
                          alt={item.caption || "Post"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                  {/* Dots indicator */}
                  {item.media_urls.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                      {item.media_urls.map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "rounded-full transition-all duration-200",
                            currentMedia === i ? "w-2 h-2 bg-primary" : "w-1.5 h-1.5 bg-white/50"
                          )}
                        />
                      ))}
                    </div>
                  )}
                  {/* Image count badge */}
                  {item.media_urls.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                      {currentMedia + 1}/{item.media_urls.length}
                    </div>
                  )}
                </div>
              ) : item.media_urls.length === 1 ? (
                /* Single image */
                <div className="relative aspect-square md:aspect-[4/3] w-full bg-black max-h-[70vh]">
                  <img
                    src={mediaUrl}
                    alt={item.caption || "Post"}
                    className="h-full w-full object-cover cursor-pointer"
                    loading="lazy"
                    onClick={() => onOpenFullscreen?.()}
                  />
                </div>
              ) : item.media_urls.length === 2 ? (
                /* 2 images — side by side */
                <div className="grid grid-cols-2 gap-0.5 w-full aspect-square md:aspect-[2/1]">
                  {item.media_urls.map((url, i) => (
                    <div key={i} className="relative bg-black overflow-hidden">
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover cursor-pointer"
                        loading="lazy"
                        onClick={() => { setCurrentMedia(i); onOpenFullscreen?.(); }}
                      />
                    </div>
                  ))}
                </div>
              ) : item.media_urls.length === 3 ? (
                /* 3 images — 1 large left, 2 stacked right */
                <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full aspect-square md:aspect-[3/2]">
                  <div className="relative row-span-2 bg-black overflow-hidden">
                    <img
                      src={item.media_urls[0]}
                      alt=""
                      className="h-full w-full object-cover cursor-pointer"
                      loading="lazy"
                      onClick={() => { setCurrentMedia(0); onOpenFullscreen?.(); }}
                    />
                  </div>
                  <div className="relative bg-black overflow-hidden">
                    <img
                      src={item.media_urls[1]}
                      alt=""
                      className="h-full w-full object-cover cursor-pointer"
                      loading="lazy"
                      onClick={() => { setCurrentMedia(1); onOpenFullscreen?.(); }}
                    />
                  </div>
                  <div className="relative bg-black overflow-hidden">
                    <img
                      src={item.media_urls[2]}
                      alt=""
                      className="h-full w-full object-cover cursor-pointer"
                      loading="lazy"
                      onClick={() => { setCurrentMedia(2); onOpenFullscreen?.(); }}
                    />
                  </div>
                </div>
              ) : (
                /* 4+ images — 2x2 grid with +N overlay */
                <div className="grid grid-cols-2 gap-[3px] w-full aspect-square overflow-hidden rounded-lg">
                  {item.media_urls.slice(0, 4).map((url, i) => (
                    <div key={i} className="relative bg-muted overflow-hidden">
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover cursor-pointer"
                        loading="lazy"
                        onClick={() => { setCurrentMedia(i); onOpenFullscreen?.(); }}
                      />
                      {i === 3 && item.media_urls.length > 4 && (
                        <div
                          className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                          onClick={() => { setCurrentMedia(3); onOpenFullscreen?.(); }}
                        >
                          <span className="text-white text-2xl font-bold">+{item.media_urls.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : null}

            {/* Double-tap heart animation */}
            <AnimatePresence>
              {showDoubleTapHeart && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <Heart className="h-20 w-20 text-white fill-white drop-shadow-2xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Emoji reaction bar (long-press activated) */}
      <AnimatePresence>
        {showReactionPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="flex items-center gap-1 px-3 py-2 mx-3 mt-1 bg-card rounded-full shadow-lg border border-border/30 w-fit"
          >
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={cn(
                  "text-xl p-1.5 rounded-full transition-all active:scale-125 hover:bg-muted",
                  selectedReaction === emoji && "bg-primary/10 ring-2 ring-primary/30"
                )}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons — enhanced with counts */}
      <div className="flex items-center px-3 py-1.5">
        <div className="flex items-center gap-1 flex-1">
          <button
            onClick={handleLike}
            onContextMenu={(e) => { e.preventDefault(); setShowReactionPicker(!showReactionPicker); }}
            className="min-h-[44px] min-w-[40px] flex items-center justify-center gap-1 group"
          >
            {selectedReaction ? (
              <span className="text-lg">{selectedReaction}</span>
            ) : (
              <Heart className={cn("h-[22px] w-[22px] transition-all", liked ? "text-destructive fill-destructive scale-110" : "text-foreground group-active:scale-125")} />
            )}
            {!item.hide_like_counts && (
              <span className={cn("text-[12px] font-semibold", liked || selectedReaction ? "text-destructive" : "text-muted-foreground")}>
                {localLikes > 999 ? `${(localLikes/1000).toFixed(1)}k` : localLikes}
              </span>
            )}
          </button>
          {commentSetting !== "off" && (
            <button onClick={handleComment} className="min-h-[44px] min-w-[40px] flex items-center justify-center text-foreground gap-1">
              <MessageCircle className="h-[22px] w-[22px]" />
              {localComments > 0 && (
                <span className="text-[12px] text-muted-foreground font-semibold">
                  {localComments > 999 ? `${(localComments/1000).toFixed(1)}k` : localComments}
                </span>
              )}
            </button>
          )}
          {item.allow_sharing !== false && (
            <button onClick={handleShare} className="min-h-[44px] min-w-[40px] flex items-center justify-center text-foreground gap-1">
              <Share2 className="h-[22px] w-[22px]" />
              {item.shares_count > 0 && (
                <span className="text-[12px] text-muted-foreground font-semibold">
                  {item.shares_count > 999 ? `${(item.shares_count/1000).toFixed(1)}k` : item.shares_count}
                </span>
              )}
            </button>
          )}
        </div>
        <button onClick={handleSave} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Bookmark className={cn("h-[22px] w-[22px] transition-all", saved ? "text-primary fill-primary" : "text-foreground")} />
        </button>
      </div>

      {item.commerce_link && (
        <div className="px-3 pb-2">
          <button
            onClick={handleBuyNow}
            className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold"
          >
            Buy Now
          </button>
        </div>
      )}

      {/* Caption for normal posts already shown above media; skip duplicate */}

      {/* Comments count or off indicator */}
      {commentSetting === "off" ? (
        <div className="px-3 pb-2 flex items-center gap-1.5">
          <MessageSquareOff className="h-3.5 w-3.5 text-muted-foreground/60" />
          <p className="text-[12px] text-muted-foreground/60">Comments are turned off</p>
        </div>
      ) : localComments > 0 ? (
        <button onClick={handleComment} className="px-3 pb-2">
          <p className="text-[12px] text-muted-foreground">
            View all {localComments} comments
          </p>
        </button>
      ) : null}

      {/* Comments Sheet */}
      <CommentsSheet
        open={showComments}
        onClose={() => {
          setShowComments(false);
          void queryClient.invalidateQueries({ queryKey: ["reels-feed-grid"] });
        }}
        postId={interactionPostId}
        postSource={item.source}
        currentUserId={currentUserId}
        commentsCount={localComments}
        onCommentsCountChange={setLocalComments}
      />

      {/* Views */}
      {item.media_type === "video" && item.views_count > 0 && (
        <div className="px-3 pb-2 flex items-center gap-1">
          <Eye className="h-3 w-3 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground">{item.views_count.toLocaleString()} views</p>
        </div>
      )}

      {/* Share Sheet */}
      <AnimatePresence>
        {showShareSheet && (
          <UnifiedShareSheet
            shareUrl={shareUrl}
            shareText={item.caption || `Check out this post by ${item.author_name}`}
            shareMediaUrl={item.media_urls[0] || undefined}
            shareMediaType={item.media_type === "video" ? "video" : "image"}
            sharePostId={item.shared_from_post_id ? item.shared_from_post_id : item.id.replace(/^u-/, "")}
            sharePostAuthorId={item.shared_from_user_id || item.author_id}
            sharePostAuthorName={item.shared_from_user_name || item.author_name}
            onClose={() => setShowShareSheet(false)}
            zIndex={70}
          />
        )}
      </AnimatePresence>

      {/* Post Options Menu */}
      <AnimatePresence>
        {showPostMenu && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40"
            onClick={() => setShowPostMenu(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-t-2xl pb-8 overflow-hidden"
            >
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="px-2">
                <button
                  onClick={() => { setShowPostMenu(false); setShowReportSheet(true); setReportStep("categories"); setReportCategory(""); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                >
                  <Flag className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Report</span>
                </button>
                <button
                  onClick={() => { setNotificationsOn(!notificationsOn); setShowPostMenu(false); toast.success(notificationsOn ? "Notifications turned off" : "Notifications turned on for this post"); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                >
                  {notificationsOn ? <BellOff className="h-5 w-5 text-foreground" /> : <Bell className="h-5 w-5 text-foreground" />}
                  <span className="text-sm font-medium text-foreground">{notificationsOn ? "Turn off notifications" : "Turn on notifications"}</span>
                </button>
                <button
                  onClick={() => { setShowPostMenu(false); handleCopyLink(); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                >
                  <Link2 className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Copy link</span>
                </button>
                <button
                  onClick={() => { setShowPostMenu(false); toast.success("You won't see posts like this anymore"); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                >
                  <EyeOff className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Not interested</span>
                </button>
                <button
                  onClick={() => { setShowPostMenu(false); setShowShareSheet(true); }}
                  className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                >
                  <Share2 className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Share</span>
                </button>

                {/* Tip creator */}
                {!isOwner && item.author_id && (
                  <button
                    onClick={() => { setShowPostMenu(false); setTipTarget({ id: item.author_id!, name: item.author_name }); }}
                    className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                  >
                    <Heart className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-medium text-foreground">Send Tip</span>
                  </button>
                )}

                {isOwner && (
                  <button
                    onClick={() => { setShowPostMenu(false); setShowCommentSettings(true); }}
                    className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                  >
                    <Settings2 className="h-5 w-5 text-foreground" />
                    <span className="text-sm font-medium text-foreground">Comment settings</span>
                  </button>
                )}

                {/* Owner-only: Delete post */}
                {isOwner && (
                  <button
                    onClick={() => { setShowPostMenu(false); setEditCaptionText(item.caption || ""); setShowEditCaption(true); }}
                    className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                  >
                    <Settings2 className="h-5 w-5 text-foreground" />
                    <span className="text-sm font-medium text-foreground">Edit caption</span>
                  </button>
                )}

                {/* Owner-only: Delete post */}
                {isOwner && (
                  <button
                    onClick={async () => {
                      setShowPostMenu(false);
                      const realId = item.id.replace(/^u-/, "");
                      const { error } = await supabase.from("user_posts").delete().eq("id", realId).eq("user_id", currentUserId);
                      if (error) {
                        toast.error("Failed to delete post");
                      } else {
                        toast.success("Post deleted");
                        queryClient.invalidateQueries({ queryKey: ["reels-feed-grid"] });
                      }
                    }}
                    className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                  >
                    <Trash2 className="h-5 w-5 text-destructive" />
                    <span className="text-sm font-medium text-destructive">Delete post</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Sheet */}
      <AnimatePresence>
        {showReportSheet && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] flex items-end justify-center bg-black/40"
            onClick={() => setShowReportSheet(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-t-2xl pb-8 overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {reportStep === "categories" ? (
                <>
                  <div className="flex items-center px-4 pb-3">
                    <button onClick={() => setShowReportSheet(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <h3 className="flex-1 text-center text-base font-bold text-foreground pr-11">Report</h3>
                  </div>
                  <p className="px-6 pb-4 text-xs text-muted-foreground">Why are you reporting this post? Your report is anonymous.</p>
                  <div className="overflow-y-auto px-2 flex-1">
                    {[
                      { icon: AlertTriangle, label: "Spam" , desc: "Misleading or repetitive content" },
                      { icon: ShieldAlert, label: "Scam or fraud", desc: "Trying to steal money or personal info" },
                      { icon: UserX, label: "Fake account", desc: "Pretending to be someone else" },
                      { icon: Ban, label: "Harassment or bullying", desc: "Targeting or intimidating someone" },
                      { icon: Skull, label: "Violence or dangerous acts", desc: "Threatening or promoting violence" },
                      { icon: EyeOff, label: "Nudity or sexual content", desc: "Inappropriate images or language" },
                      { icon: Flag, label: "Hate speech", desc: "Attacking a group or individual" },
                      { icon: ShieldAlert, label: "Intellectual property", desc: "Using content without permission" },
                      { icon: HelpCircle, label: "Something else", desc: "Other issue not listed above" },
                    ].map((r) => (
                      <button
                        key={r.label}
                        onClick={() => { setReportCategory(r.label); setReportStep("sub"); }}
                        className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px] text-left"
                      >
                        <r.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{r.label}</p>
                          <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90 shrink-0" />
                      </button>
                    ))}
                  </div>
                </>
              ) : reportStep === "sub" ? (
                <>
                  <div className="flex items-center px-4 pb-3">
                    <button onClick={() => setReportStep("categories")} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <h3 className="flex-1 text-center text-base font-bold text-foreground pr-11">{reportCategory}</h3>
                  </div>
                  <p className="px-6 pb-4 text-xs text-muted-foreground">Select the option that best describes the issue.</p>
                  <div className="overflow-y-auto px-2 flex-1">
                    {((): { label: string }[] => {
                      const subMap: Record<string, string[]> = {
                        "Spam": ["Promotional content", "Repetitive posts", "Bot activity", "Clickbait", "Misleading information"],
                        "Scam or fraud": ["Phishing attempt", "Financial scam", "Fake giveaway", "Identity theft", "Cryptocurrency scam", "Impersonating a business"],
                        "Fake account": ["Impersonating me", "Impersonating someone I know", "Impersonating a celebrity", "Impersonating a business or brand", "Bot or fake engagement"],
                        "Harassment or bullying": ["Threatening language", "Unwanted contact", "Intimidation", "Stalking behavior", "Revealing private info (doxxing)", "Encouraging self-harm"],
                        "Violence or dangerous acts": ["Graphic violence", "Threatening harm", "Glorifying violence", "Dangerous challenges", "Animal cruelty", "Terrorist content"],
                        "Nudity or sexual content": ["Nudity", "Sexual activity", "Sexual exploitation", "Non-consensual imagery", "Content involving minors"],
                        "Hate speech": ["Racism", "Religious discrimination", "Sexism or misogyny", "Homophobia or transphobia", "Disability discrimination", "Xenophobia"],
                        "Intellectual property": ["Copyright infringement", "Trademark violation", "Stolen content", "Unauthorized use of my work"],
                        "Something else": ["Misinformation", "Self-injury or suicide", "Drug sales", "Unauthorized sales", "Privacy violation", "Other"],
                      };
                      return (subMap[reportCategory] || ["Other"]).map((s) => ({ label: s }));
                    })().map((sub) => (
                      <button
                        key={sub.label}
                        onClick={() => setReportStep("submitted")}
                        className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px] text-left"
                      >
                        <span className="text-sm font-medium text-foreground">{sub.label}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90 shrink-0" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Flag className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Thanks for reporting</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-[260px]">
                    We'll review this post and take action if it violates our community guidelines.
                  </p>
                  <button
                    onClick={() => setShowReportSheet(false)}
                    className="mt-4 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm min-h-[48px]"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Settings Sheet (Owner only) */}
      <AnimatePresence>
        {showCommentSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-end justify-center bg-black/40"
            onClick={() => setShowCommentSettings(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-t-2xl pb-8 overflow-hidden"
            >
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center px-4 pb-3">
                <button onClick={() => setShowCommentSettings(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                <h3 className="flex-1 text-center text-base font-bold text-foreground pr-11">Comment Settings</h3>
              </div>
              <p className="px-6 pb-4 text-xs text-muted-foreground">Choose who can comment on this post.</p>
              <div className="px-2 space-y-1">
                {([
                  { value: "everyone" as const, icon: Globe, label: "Everyone", desc: "Anyone can comment on this post" },
                  { value: "friends" as const, icon: UserCheck, label: "Friends only", desc: "Only your friends can comment" },
                  { value: "off" as const, icon: MessageSquareOff, label: "Turn off comments", desc: "No one can comment on this post" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setCommentSetting(opt.value);
                      setShowCommentSettings(false);
                      if (opt.value === "off") setShowComments(false);
                      toast.success(
                        opt.value === "everyone" ? "Comments open for everyone" :
                        opt.value === "friends" ? "Only friends can comment now" :
                        "Comments turned off"
                      );
                    }}
                    className="flex items-center gap-4 w-full px-4 py-3.5 hover:bg-muted/50 rounded-xl min-h-[48px]"
                  >
                    <opt.icon className={cn("h-5 w-5", commentSetting === opt.value ? "text-primary" : "text-foreground")} />
                    <div className="flex-1 text-left">
                      <span className={cn("text-sm font-medium", commentSetting === opt.value ? "text-primary" : "text-foreground")}>{opt.label}</span>
                      <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                    </div>
                    {commentSetting === opt.value && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Caption Sheet */}
      <AnimatePresence>
        {showEditCaption && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[230] flex items-end justify-center bg-black/40"
            onClick={() => setShowEditCaption(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-t-2xl pb-8 overflow-hidden"
            >
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="px-4">
                <h3 className="text-base font-bold text-foreground mb-3">Edit Caption</h3>
                <textarea
                  value={editCaptionText}
                  onChange={(e) => setEditCaptionText(e.target.value)}
                  rows={4}
                  maxLength={2200}
                  className="w-full p-3 rounded-xl bg-muted/50 border border-border/40 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Write a caption..."
                />
                <p className="text-[10px] text-muted-foreground mt-1 mb-3">{editCaptionText.length}/2,200</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditCaption(false)}
                    className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditPost}
                    disabled={editSaving}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                  >
                    {editSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Tip Sheet */}
      <TipSheet
        open={!!tipTarget}
        onClose={() => setTipTarget(null)}
        creatorId={tipTarget?.id || ""}
        creatorName={tipTarget?.name || ""}
      />

      {/* Unfollow confirm dialog */}
      <AlertDialog open={showUnfollowConfirm} onOpenChange={setShowUnfollowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unfollow?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to unfollow {item.author_name}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { executeFeedUnfollow(); setShowUnfollowConfirm(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, unfollow</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
