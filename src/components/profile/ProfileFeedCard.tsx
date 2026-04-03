/**
 * ProfileFeedCard — Mirrors FeedCard from ReelsFeedPage for profile "All" tab.
 * Full interactive features: video playback, double-tap to like, emoji reactions,
 * counts next to action icons, "View all comments", clickable avatars.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MessageCircle, Share2, Play, Bookmark, Globe, MoreVertical,
  Volume2, VolumeX, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { toUserPostInteractionId } from "@/lib/social/postInteraction";
import CommentsSheet from "@/components/social/CommentsSheet";

const REACTIONS = ["❤️", "😂", "😮", "😢", "😡", "👍"];

export type ProfileFeedItem = {
  id: string;
  type: "photo" | "reel";
  likes: number;
  comments: number;
  caption: string;
  time: string;
  url: string | null;
  filterCss?: string;
  views?: number;
  user: { name: string; avatar: string };
  isShared?: boolean;
  sharedOrigin?: {
    name: string;
    avatar: string;
    caption?: string;
    userId?: string;
    storeSlug?: string;
    source?: "user" | "store";
  } | null;
  createdAt?: string;
  userId?: string;
};

interface ProfileFeedCardProps {
  item: ProfileFeedItem;
  currentUserId: string | undefined;
  profileOwnerId: string | undefined;
  isLiked: boolean;
  isBookmarked: boolean;
  onToggleLike: (item: ProfileFeedItem) => void;
  onToggleBookmark: (item: ProfileFeedItem) => void;
  onOpenMenu: (item: ProfileFeedItem) => void;
  onShare: (postId: string) => void;
  onSelectPost: (item: ProfileFeedItem) => void;
}

export default function ProfileFeedCard({
  item,
  currentUserId,
  profileOwnerId,
  isLiked,
  isBookmarked,
  onToggleLike,
  onToggleBookmark,
  onOpenMenu,
  onShare,
  onSelectPost,
}: ProfileFeedCardProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const lastTapRef = useRef(0);

  const isVideo = item.type === "reel";
  const hasMedia = Boolean(item.url);

  const timeAgo = item.createdAt
    ? (() => { try { return formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }); } catch { return item.time; } })()
    : item.time;

  // Auto-play video when visible
  useEffect(() => {
    if (!isVideo || !hasMedia) return;
    const el = containerRef.current;
    if (!el) return;
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
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVideo, hasMedia]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  }, []);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) onToggleLike(item);
      setShowDoubleTapHeart(true);
      setTimeout(() => setShowDoubleTapHeart(false), 800);
    }
    lastTapRef.current = now;
  }, [isLiked, item, onToggleLike]);

  const handleReaction = (emoji: string) => {
    setSelectedReaction(selectedReaction === emoji ? null : emoji);
    setShowReactionPicker(false);
    if (!isLiked) onToggleLike(item);
  };

  const navigateToAuthor = (userId?: string) => {
    if (userId && userId !== currentUserId) {
      navigate(`/user/${userId}`);
    }
  };

  return (
    <div className="bg-card">
      {item.isShared && item.sharedOrigin ? (
        <>
          {/* Sharer header */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => navigateToAuthor(item.userId || profileOwnerId)}
              className="flex items-center gap-3 px-3 py-2.5 flex-1 min-w-0 active:opacity-70"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={item.user.avatar || undefined} />
                <AvatarFallback className="text-xs font-bold">{item.user.name?.[0]?.toUpperCase() || "Z"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-semibold text-foreground truncate">{item.user.name}</p>
                <div className="flex items-center gap-1">
                  <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <Globe className="h-2.5 w-2.5 text-muted-foreground" />
                </div>
              </div>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onOpenMenu(item); }} className="p-1.5 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Sharer's own caption */}
          {item.caption && item.caption !== item.sharedOrigin.caption && (
            <div className="px-3 pb-2">
              <p className="text-[13px] text-foreground">{item.caption}</p>
            </div>
          )}

          {/* Embedded original post card */}
          <div className="mx-3 mb-2 border border-border/50 rounded-2xl overflow-hidden bg-card shadow-sm">
            <div className="flex items-center px-3 py-2.5">
              <button
                type="button"
                onClick={() => {
                  if (item.sharedOrigin?.source === "store" && item.sharedOrigin.storeSlug) {
                    navigate(`/grocery/shop/${item.sharedOrigin.storeSlug}`);
                  } else if (item.sharedOrigin?.userId) {
                    navigateToAuthor(item.sharedOrigin.userId);
                  }
                }}
                className="flex items-center gap-2.5 flex-1 min-w-0 active:opacity-70"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={item.sharedOrigin.avatar} />
                  <AvatarFallback className="text-[10px]">{item.sharedOrigin.name?.[0] || "S"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-semibold text-foreground truncate">{item.sharedOrigin.name}</p>
                  <div className="flex items-center gap-1">
                    <Globe className="h-2.5 w-2.5 text-muted-foreground" />
                  </div>
                </div>
              </button>
            </div>

            {item.sharedOrigin.caption && (
              <div className="px-3 pb-2">
                <p className="text-[13px] text-foreground">{item.sharedOrigin.caption}</p>
              </div>
            )}

            {/* Media */}
            {hasMedia && (
              <div ref={containerRef} onClick={handleDoubleTap} className="relative w-full aspect-square bg-black">
                {isVideo ? (
                  <>
                    <video ref={videoRef} src={item.url!} muted={muted} loop playsInline preload="metadata"
                      onClick={togglePlay} className="h-full w-full object-cover cursor-pointer" />
                    {!isPlaying && (
                      <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Play className="h-14 w-14 text-white/80 fill-white/80 drop-shadow-lg" />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                      className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center min-h-[44px] min-w-[44px]">
                      {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                    </button>
                  </>
                ) : (
                  <img src={item.url!} alt="" className="h-full w-full object-cover cursor-pointer"
                    style={{ filter: item.filterCss || "none" }} loading="lazy" onClick={() => onSelectPost(item)} />
                )}
                {/* Double-tap heart */}
                <AnimatePresence>
                  {showDoubleTapHeart && (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <Heart className="h-20 w-20 text-white fill-white drop-shadow-2xl" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Normal post header */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => navigateToAuthor(item.userId || profileOwnerId)}
              className="flex items-center gap-3 px-3 py-2.5 flex-1 min-w-0 active:opacity-70"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={item.user.avatar || undefined} />
                <AvatarFallback className="text-xs font-bold">{item.user.name?.[0]?.toUpperCase() || "Z"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-semibold text-foreground truncate">{item.user.name}</p>
                <div className="flex items-center gap-1">
                  <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <Globe className="h-2.5 w-2.5 text-muted-foreground" />
                </div>
              </div>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onOpenMenu(item); }} className="p-1.5 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Caption */}
          {item.caption && (
            <div className="px-3 pb-2">
              <p className="text-[13px] text-foreground">
                <span className="font-semibold mr-1">{item.user.name}</span>
                {item.caption}
              </p>
            </div>
          )}

          {/* Media */}
          {hasMedia && (
            <div ref={containerRef} onClick={handleDoubleTap} className="relative w-full aspect-square bg-black">
              {isVideo ? (
                <>
                  <video ref={videoRef} src={item.url!} muted={muted} loop playsInline preload="metadata"
                    onClick={togglePlay} className="h-full w-full object-cover cursor-pointer" />
                  {!isPlaying && (
                    <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Play className="h-14 w-14 text-white/80 fill-white/80 drop-shadow-lg" />
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                    className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center min-h-[44px] min-w-[44px]">
                    {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                  </button>
                </>
              ) : (
                <img src={item.url!} alt="" className="h-full w-full object-cover cursor-pointer"
                  style={{ filter: item.filterCss || "none" }} loading="lazy" onClick={() => onSelectPost(item)} />
              )}
              {/* Double-tap heart */}
              <AnimatePresence>
                {showDoubleTapHeart && (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <Heart className="h-20 w-20 text-white fill-white drop-shadow-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Emoji reaction bar */}
      <AnimatePresence>
        {showReactionPicker && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="flex items-center gap-1 px-3 py-2 mx-3 mt-1 bg-card rounded-full shadow-lg border border-border/30 w-fit">
            {REACTIONS.map((emoji) => (
              <button key={emoji} onClick={() => handleReaction(emoji)}
                className={cn("text-xl p-1.5 rounded-full transition-all active:scale-125 hover:bg-muted",
                  selectedReaction === emoji && "bg-primary/10 ring-2 ring-primary/30")}>
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons with counts */}
      <div className="flex items-center px-3 py-1.5">
        <div className="flex items-center gap-1 flex-1">
          <button
            onClick={() => onToggleLike(item)}
            onContextMenu={(e) => { e.preventDefault(); setShowReactionPicker(!showReactionPicker); }}
            className="min-h-[44px] min-w-[40px] flex items-center justify-center gap-1 group"
          >
            {selectedReaction ? (
              <span className="text-lg">{selectedReaction}</span>
            ) : (
              <Heart className={cn("h-[22px] w-[22px] transition-all", isLiked ? "text-destructive fill-destructive scale-110" : "text-foreground group-active:scale-125")} />
            )}
            {item.likes > 0 && (
              <span className={cn("text-[12px] font-semibold", isLiked || selectedReaction ? "text-destructive" : "text-muted-foreground")}>
                {item.likes > 999 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}
              </span>
            )}
          </button>
          <button onClick={() => setShowComments(true)} className="min-h-[44px] min-w-[40px] flex items-center justify-center text-foreground gap-1">
            <MessageCircle className="h-[22px] w-[22px]" />
            {item.comments > 0 && (
              <span className="text-[12px] text-muted-foreground font-semibold">
                {item.comments > 999 ? `${(item.comments / 1000).toFixed(1)}k` : item.comments}
              </span>
            )}
          </button>
          <button onClick={() => onShare(item.id)} className="min-h-[44px] min-w-[40px] flex items-center justify-center text-foreground gap-1">
            <Share2 className="h-[22px] w-[22px]" />
          </button>
        </div>
        <button onClick={() => onToggleBookmark(item)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Bookmark className={cn("h-[22px] w-[22px] transition-all", isBookmarked ? "text-primary fill-primary" : "text-foreground")} />
        </button>
      </div>

      {/* View all comments */}
      {item.comments > 0 && (
        <button onClick={() => setShowComments(true)} className="px-3 pb-2">
          <p className="text-[12px] text-muted-foreground">View all {item.comments} comments</p>
        </button>
      )}

      {/* Views for videos */}
      {isVideo && (item.views || 0) > 0 && (
        <div className="px-3 pb-2 flex items-center gap-1">
          <Eye className="h-3 w-3 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground">{(item.views || 0).toLocaleString()} views</p>
        </div>
      )}

      {/* Comments Sheet */}
      <CommentsSheet
        open={showComments}
        onClose={() => setShowComments(false)}
        postId={toUserPostInteractionId(item.id)}
        postSource="user"
        currentUserId={currentUserId || null}
        commentsCount={item.comments}
      />
    </div>
  );
}
