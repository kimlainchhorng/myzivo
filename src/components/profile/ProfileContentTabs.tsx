import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Heart, MessageCircle, Eye, X, SwitchCamera, Mic, MicOff, Sparkles,
  Share2, Play, Radio, ChevronDown, Globe, Users, Lock,
  MapPin, Image, Film, Grid3X3, Clapperboard, Camera,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type FeedItem = {
  id: string;
  type: "photo" | "reel";
  likes: number;
  comments: number;
  caption: string;
  time: string;
  url: string;
  views?: number;
  user: { name: string; avatar: string };
};

const demoFeed: FeedItem[] = [
  { id: "p1", type: "photo", likes: 24, comments: 3, caption: "Beach vibes 🏖️", time: "2h", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop", user: { name: "Sarah M.", avatar: "https://i.pravatar.cc/100?img=1" } },
  { id: "p2", type: "photo", likes: 18, comments: 1, caption: "City lights", time: "5h", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=400&fit=crop", user: { name: "Alex K.", avatar: "https://i.pravatar.cc/100?img=2" } },
  { id: "v1", type: "reel", likes: 42, comments: 7, caption: "Road trip! 🚗", time: "1d", views: 1200, url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=600&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p3", type: "photo", likes: 31, comments: 5, caption: "Morning coffee", time: "2d", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "v2", type: "reel", likes: 89, comments: 12, caption: "Sunset vibes 🌅", time: "3d", views: 3400, url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=600&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p4", type: "photo", likes: 15, comments: 2, caption: "Sunset 🌅", time: "3d", url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "v3", type: "reel", likes: 28, comments: 4, caption: "Mountain hike", time: "4d", views: 890, url: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&h=600&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p5", type: "photo", likes: 20, comments: 3, caption: "Travel goals ✈️", time: "5d", url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p6", type: "photo", likes: 12, comments: 1, caption: "Paradise 🌴", time: "1w", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
];

type TabFilter = "all" | "photo" | "reel";

const TABS: { id: TabFilter; label: string; icon: typeof Grid3X3 }[] = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "photo", label: "Photos", icon: Image },
  { id: "reel", label: "Reels", icon: Clapperboard },
];

export default function ProfileContentTabs({ userId }: { userId?: string }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [showComposer, setShowComposer] = useState(false);
  const [composerType, setComposerType] = useState<"photo" | "reel" | null>(null);
  const [selectedPost, setSelectedPost] = useState<FeedItem | null>(null);
  const [showLive, setShowLive] = useState(false);

  const filtered = activeTab === "all" ? demoFeed : demoFeed.filter((i) => i.type === activeTab);

  return (
    <div className="space-y-3">
      {/* Create Post Bar */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowComposer(true)}
        className="w-full flex items-center gap-3 bg-card rounded-2xl border border-border/30 p-3.5 shadow-sm"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="w-5 h-5 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground flex-1 text-left">What's on your mind?</span>
        <div className="flex items-center gap-2">
          <Image className="w-4.5 h-4.5 text-primary/60" />
          <Film className="w-4.5 h-4.5 text-accent-foreground/40" />
          <Radio className="w-4.5 h-4.5 text-destructive/60" />
        </div>
      </motion.button>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Feed Grid */}
      <div className={cn(
        "grid gap-0.5 rounded-2xl overflow-hidden",
        activeTab === "reel" ? "grid-cols-2" : "grid-cols-3"
      )}>
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPost(item)}
            className={cn(
              "relative bg-muted/40 group cursor-pointer overflow-hidden",
              item.type === "reel" ? "aspect-[9/14]" : "aspect-square"
            )}
          >
            <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            {item.type === "reel" && (
              <div className="absolute top-1.5 right-1.5 z-10">
                <Play className="w-4 h-4 text-white fill-white drop-shadow-lg" />
              </div>
            )}
            {item.type === "reel" && item.views && (
              <div className="absolute bottom-1.5 left-1.5 z-10 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                <Eye className="w-2.5 h-2.5 text-white" />
                <span className="text-[9px] text-white font-bold">{item.views > 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views}</span>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="flex items-center gap-0.5 text-white text-[10px] font-bold">
                <Heart className="w-3 h-3 fill-white" /> {item.likes}
              </span>
              <span className="flex items-center gap-0.5 text-white text-[10px] font-bold">
                <MessageCircle className="w-3 h-3 fill-white" /> {item.comments}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Post Detail Viewer */}
      {createPortal(
        <AnimatePresence>
          {selectedPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-3 shrink-0">
                <button onClick={() => setSelectedPost(null)} className="text-white/80 p-1">
                  <X className="w-6 h-6" />
                </button>
                <img src={selectedPost.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white/20" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{selectedPost.user.name}</p>
                  <p className="text-white/50 text-[10px]">{selectedPost.time} ago</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <img src={selectedPost.url} alt="" className="w-full h-full object-contain" />
              </div>

              {/* Bottom bar */}
              <div className="p-4 space-y-3 shrink-0 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white/90 text-sm">{selectedPost.caption}</p>
                <div className="flex items-center gap-5">
                  <button className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                    <Heart className="w-6 h-6" />
                    <span className="text-sm font-medium">{selectedPost.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm font-medium">{selectedPost.comments}</span>
                  </button>
                  {selectedPost.views && (
                    <span className="flex items-center gap-1.5 text-white/50">
                      <Eye className="w-5 h-5" />
                      <span className="text-sm">{selectedPost.views > 1000 ? `${(selectedPost.views / 1000).toFixed(1)}k` : selectedPost.views}</span>
                    </span>
                  )}
                  <button className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors ml-auto">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Composer Modal */}
      {createPortal(
        <AnimatePresence>
          {showComposer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end justify-center"
              onClick={() => { setShowComposer(false); setComposerType(null); }}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="w-full max-w-lg bg-card rounded-t-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>

                {!composerType ? (
                  <div className="p-5 space-y-4">
                    <h3 className="text-lg font-bold text-foreground text-center">Create</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "photo" as const, label: "Photo", icon: Image, color: "text-primary" },
                        { id: "reel" as const, label: "Reel", icon: Clapperboard, color: "text-accent-foreground" },
                        { id: "live" as const, label: "Go Live", icon: Radio, color: "text-destructive" },
                      ].map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <motion.button
                            key={opt.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (opt.id === "live") {
                                setShowComposer(false);
                                setComposerType(null);
                                setShowLive(true);
                              } else {
                                setComposerType(opt.id);
                              }
                            }}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/40 border border-border/20 hover:bg-muted/60 transition-colors"
                          >
                            <div className={cn("w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm", opt.id === "live" && "bg-destructive/10")}>
                              <Icon className={cn("w-6 h-6", opt.color)} />
                            </div>
                            <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => { setShowComposer(false); setComposerType(null); }}
                      className="w-full py-3 text-sm font-medium text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <ComposerForm
                    type={composerType}
                    onClose={() => { setShowComposer(false); setComposerType(null); }}
                    onBack={() => setComposerType(null)}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Live Broadcast Overlay */}
      {createPortal(
        <AnimatePresence>
          {showLive && <LiveBroadcast onClose={() => setShowLive(false)} />}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

type Visibility = "everyone" | "friends" | "only_me";
const VISIBILITY_OPTIONS: { id: Visibility; label: string; icon: typeof Globe }[] = [
  { id: "everyone", label: "Everyone", icon: Globe },
  { id: "friends", label: "Friends Only", icon: Users },
  { id: "only_me", label: "Only Me", icon: Lock },
];

function ComposerForm({ type, onClose, onBack }: { type: "photo" | "reel"; onClose: () => void; onBack: () => void }) {
  const [caption, setCaption] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("everyone");
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaPreview(URL.createObjectURL(file));
  };

  const handlePost = () => {
    if (!mediaPreview) { toast.error("Add media first!"); return; }
    toast.success("Posted successfully! 🎉");
    onClose();
  };

  const isReel = type === "reel";
  const TypeIcon = isReel ? Clapperboard : Image;
  const label = isReel ? "Reel" : "Photo";
  const currentVis = VISIBILITY_OPTIONS.find((v) => v.id === visibility)!;
  const VisIcon = currentVis.icon;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-primary font-medium">← Back</button>
        <h3 className="text-base font-bold text-foreground">New {label}</h3>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handlePost} className="bg-primary text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full">
          Post
        </motion.button>
      </div>

      {mediaPreview ? (
        <div className="relative rounded-2xl overflow-hidden">
          {isReel ? (
            <video src={mediaPreview} className="w-full max-h-[40vh] object-cover rounded-2xl" controls />
          ) : (
            <img src={mediaPreview} alt="" className="w-full max-h-[40vh] object-cover rounded-2xl" />
          )}
          <button onClick={() => setMediaPreview(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => fileRef.current?.click()}
          className="w-full aspect-video rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-2"
        >
          <TypeIcon className="w-8 h-8 text-primary/40" />
          <span className="text-sm text-muted-foreground">Tap to add {label.toLowerCase()}</span>
        </motion.button>
      )}
      <input ref={fileRef} type="file" accept={isReel ? "video/*" : "image/*"} className="hidden" onChange={handleFile} />

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption..."
        rows={2}
        className="w-full bg-muted/30 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none border border-border/20 focus:border-primary/30 transition-colors"
      />

      {/* Privacy & extras row */}
      <div className="flex items-center gap-3 text-muted-foreground">
        {/* Visibility picker */}
        <div className="relative">
          <button
            onClick={() => setShowVisibilityPicker(!showVisibilityPicker)}
            className="flex items-center gap-1.5 text-xs font-medium hover:text-foreground transition-colors bg-muted/40 rounded-lg px-2.5 py-1.5 border border-border/20"
          >
            <VisIcon className="w-3.5 h-3.5" />
            {currentVis.label}
            <ChevronDown className={cn("w-3 h-3 transition-transform", showVisibilityPicker && "rotate-180")} />
          </button>
          <AnimatePresence>
            {showVisibilityPicker && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute bottom-full left-0 mb-1 bg-card border border-border/40 rounded-xl shadow-lg overflow-hidden z-20 min-w-[160px]"
              >
                {VISIBILITY_OPTIONS.map((opt) => {
                  const OptIcon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => { setVisibility(opt.id); setShowVisibilityPicker(false); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors",
                        visibility === opt.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                      )}
                    >
                      <OptIcon className="w-4 h-4" />
                      {opt.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors">
          <MapPin className="w-4 h-4" /> Location
        </button>
      </div>
    </div>
  );
}

// AR sticker overlays drawn on canvas
const AR_STICKERS = [
  { name: "None", emoji: "⭕", sticker: null },
  { name: "Cat Ears", emoji: "🐱", sticker: "cat" },
  { name: "Dog", emoji: "🐶", sticker: "dog" },
  { name: "Bunny", emoji: "🐰", sticker: "bunny" },
  { name: "Crown", emoji: "👑", sticker: "crown" },
  { name: "Hearts", emoji: "💕", sticker: "hearts" },
  { name: "Stars", emoji: "⭐", sticker: "stars" },
  { name: "Glasses", emoji: "🕶️", sticker: "glasses" },
  { name: "Devil", emoji: "😈", sticker: "devil" },
  { name: "Angel", emoji: "😇", sticker: "angel" },
  { name: "Flowers", emoji: "🌸", sticker: "flowers" },
  { name: "Fire", emoji: "🔥", sticker: "fire" },
  { name: "Butterfly", emoji: "🦋", sticker: "butterfly" },
  { name: "Rainbow", emoji: "🌈", sticker: "rainbow" },
  { name: "Sparkles", emoji: "✨", sticker: "sparkles" },
  { name: "Snow", emoji: "❄️", sticker: "snow" },
];

function drawSticker(ctx: CanvasRenderingContext2D, sticker: string, w: number, h: number) {
  const cx = w / 2;
  const fontSize = Math.min(w, h) * 0.12;
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = "center";

  switch (sticker) {
    case "cat":
      ctx.font = `${fontSize * 1.2}px serif`;
      ctx.fillText("🐱", cx - w * 0.12, h * 0.18);
      ctx.fillText("🐱", cx + w * 0.12, h * 0.18);
      ctx.font = `${fontSize * 0.5}px serif`;
      ctx.fillText("👃", cx, h * 0.35);
      ctx.fillText("ω", cx, h * 0.38);
      break;
    case "dog":
      ctx.font = `${fontSize * 1.3}px serif`;
      ctx.fillText("🐕", cx, h * 0.15);
      ctx.font = `${fontSize * 0.6}px serif`;
      ctx.fillText("👅", cx, h * 0.42);
      break;
    case "bunny":
      ctx.font = `${fontSize * 1.5}px serif`;
      ctx.fillText("🐰", cx, h * 0.12);
      break;
    case "crown":
      ctx.font = `${fontSize * 1.8}px serif`;
      ctx.fillText("👑", cx, h * 0.14);
      break;
    case "hearts":
      ctx.font = `${fontSize * 0.7}px serif`;
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h * 0.5 + h * 0.05;
        ctx.fillText("❤️", x, y);
      }
      break;
    case "stars":
      ctx.font = `${fontSize * 0.6}px serif`;
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h * 0.6;
        ctx.fillText("⭐", x, y);
      }
      break;
    case "glasses":
      ctx.font = `${fontSize * 1.6}px serif`;
      ctx.fillText("🕶️", cx, h * 0.32);
      break;
    case "devil":
      ctx.font = `${fontSize * 1.4}px serif`;
      ctx.fillText("😈", cx, h * 0.12);
      break;
    case "angel":
      ctx.font = `${fontSize * 1.4}px serif`;
      ctx.fillText("😇", cx, h * 0.1);
      ctx.font = `${fontSize * 0.8}px serif`;
      ctx.fillText("🪽", cx - w * 0.3, h * 0.5);
      ctx.fillText("🪽", cx + w * 0.3, h * 0.5);
      break;
    case "flowers":
      ctx.font = `${fontSize * 0.7}px serif`;
      const flowerEmojis = ["🌸", "🌺", "🌻", "💐", "🌷"];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const r = w * 0.3;
        const x = cx + Math.cos(angle) * r;
        const y = h * 0.2 + Math.sin(angle) * r * 0.3;
        ctx.fillText(flowerEmojis[i % flowerEmojis.length], x, y);
      }
      break;
    case "fire":
      ctx.font = `${fontSize * 0.8}px serif`;
      for (let i = 0; i < 5; i++) {
        ctx.fillText("🔥", w * 0.1 + i * w * 0.2, h * 0.92);
      }
      break;
    case "butterfly":
      ctx.font = `${fontSize * 1.2}px serif`;
      ctx.fillText("🦋", cx - w * 0.2, h * 0.15);
      ctx.fillText("🦋", cx + w * 0.2, h * 0.2);
      ctx.font = `${fontSize * 0.7}px serif`;
      ctx.fillText("🦋", w * 0.15, h * 0.35);
      break;
    case "rainbow":
      const gradient = ctx.createLinearGradient(0, h * 0.05, w, h * 0.05);
      gradient.addColorStop(0, "rgba(255,0,0,0.3)");
      gradient.addColorStop(0.17, "rgba(255,165,0,0.3)");
      gradient.addColorStop(0.33, "rgba(255,255,0,0.3)");
      gradient.addColorStop(0.5, "rgba(0,128,0,0.3)");
      gradient.addColorStop(0.67, "rgba(0,0,255,0.3)");
      gradient.addColorStop(0.83, "rgba(75,0,130,0.3)");
      gradient.addColorStop(1, "rgba(238,130,238,0.3)");
      ctx.beginPath();
      ctx.arc(cx, h * 0.35, w * 0.45, Math.PI, 0);
      ctx.lineWidth = h * 0.03;
      ctx.strokeStyle = gradient;
      ctx.stroke();
      break;
    case "sparkles":
      ctx.font = `${fontSize * 0.5}px serif`;
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillText("✨", x, y);
      }
      break;
    case "snow":
      ctx.font = `${fontSize * 0.4}px serif`;
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillText("❄️", x, y);
      }
      break;
  }
}

function LiveBroadcast({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>();
  const [isLive, setIsLive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [elapsed, setElapsed] = useState(0);
  const [viewers] = useState(() => Math.floor(Math.random() * 20) + 1);
  const [comments, setComments] = useState<{ id: number; user: string; text: string }[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterTab, setFilterTab] = useState<"color" | "face" | "ar">("color");
  const [activeSticker, setActiveSticker] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const COLOR_FILTERS = [
    { name: "Original", css: "none", emoji: "✨" },
    { name: "Warm", css: "sepia(0.3) saturate(1.4) brightness(1.05)", emoji: "🌅" },
    { name: "Cool", css: "saturate(0.8) hue-rotate(20deg) brightness(1.05)", emoji: "❄️" },
    { name: "B&W", css: "grayscale(1) contrast(1.1)", emoji: "🖤" },
    { name: "Vintage", css: "sepia(0.5) contrast(0.9) brightness(1.1)", emoji: "📷" },
    { name: "Vivid", css: "saturate(2) contrast(1.15)", emoji: "🎨" },
    { name: "Fade", css: "saturate(0.5) brightness(1.2) contrast(0.8)", emoji: "🌫️" },
    { name: "Drama", css: "contrast(1.5) brightness(0.85) saturate(1.3)", emoji: "🎭" },
    { name: "Glow", css: "brightness(1.25) saturate(1.4)", emoji: "💫" },
    { name: "Noir", css: "grayscale(0.8) contrast(1.4) brightness(0.85)", emoji: "🕶️" },
    { name: "Sunset", css: "sepia(0.2) saturate(1.6) hue-rotate(-10deg) brightness(1.05)", emoji: "🌇" },
    { name: "Ocean", css: "saturate(0.9) hue-rotate(30deg) brightness(1.1)", emoji: "🌊" },
    { name: "Rose", css: "saturate(1.3) hue-rotate(-15deg) brightness(1.1)", emoji: "🌹" },
    { name: "Neon", css: "saturate(2.5) contrast(1.2) brightness(1.1)", emoji: "💜" },
    { name: "Film", css: "sepia(0.15) contrast(1.1) saturate(0.9) brightness(0.95)", emoji: "🎬" },
    { name: "Pop", css: "saturate(1.8) brightness(1.1) contrast(1.05)", emoji: "🍭" },
    { name: "Dreamy", css: "brightness(1.15) saturate(0.7) contrast(0.85)", emoji: "☁️" },
    { name: "Chrome", css: "saturate(0.4) contrast(1.3) brightness(1.05)", emoji: "⚡" },
    { name: "Ember", css: "sepia(0.4) saturate(1.8) hue-rotate(-20deg) brightness(0.95)", emoji: "🔥" },
    { name: "Arctic", css: "saturate(0.6) hue-rotate(40deg) brightness(1.15) contrast(0.9)", emoji: "🧊" },
    { name: "Cyberpunk", css: "saturate(2.2) hue-rotate(-30deg) contrast(1.3) brightness(0.9)", emoji: "🤖" },
    { name: "Pastel", css: "saturate(0.6) brightness(1.25) contrast(0.75)", emoji: "🎀" },
    { name: "Moody", css: "contrast(1.3) brightness(0.75) saturate(1.1) sepia(0.1)", emoji: "🌑" },
    { name: "Golden", css: "sepia(0.4) saturate(1.3) brightness(1.15) hue-rotate(-5deg)", emoji: "👑" },
    { name: "X-Ray", css: "invert(1) hue-rotate(180deg) contrast(1.2)", emoji: "💀" },
    { name: "Thermal", css: "hue-rotate(90deg) saturate(2) contrast(1.3) brightness(0.9)", emoji: "🌡️" },
    { name: "Toxic", css: "hue-rotate(100deg) saturate(2.5) contrast(1.2) brightness(0.9)", emoji: "☢️" },
    { name: "Polaroid", css: "sepia(0.3) saturate(1.1) contrast(0.95) brightness(1.15)", emoji: "🖼️" },
  ];

  const FACE_FILTERS = [
    { name: "Natural", css: "blur(0.2px) brightness(1.08) contrast(0.95) saturate(1.1)", emoji: "🌿" },
    { name: "Smooth", css: "blur(0.6px) brightness(1.12) contrast(0.9) saturate(1.1)", emoji: "🧴" },
    { name: "HD Smooth", css: "blur(0.8px) brightness(1.18) contrast(0.84) saturate(1.08)", emoji: "📸" },
    { name: "Ultra Smooth", css: "blur(1px) brightness(1.2) contrast(0.82) saturate(1.05)", emoji: "🫧" },
    { name: "Cute", css: "blur(0.4px) brightness(1.2) saturate(1.4) contrast(0.86) sepia(0.05)", emoji: "🥰" },
    { name: "Baby Face", css: "blur(0.8px) brightness(1.22) contrast(0.8) saturate(1.15)", emoji: "👶" },
    { name: "Glow Up", css: "blur(0.4px) brightness(1.3) saturate(1.4) contrast(0.88)", emoji: "💎" },
    { name: "Glass Skin", css: "blur(0.5px) brightness(1.32) contrast(0.76) saturate(1.0)", emoji: "🪞" },
    { name: "K-Beauty", css: "blur(0.5px) brightness(1.25) contrast(0.82) saturate(0.92) sepia(0.06)", emoji: "🇰🇷" },
    { name: "Porcelain", css: "blur(0.5px) brightness(1.25) contrast(0.8) saturate(0.85) sepia(0.1)", emoji: "🪆" },
    { name: "Angelic", css: "blur(0.8px) brightness(1.35) contrast(0.76) saturate(0.85) sepia(0.1)", emoji: "😇" },
    { name: "Full Glam", css: "blur(1px) brightness(1.35) contrast(0.78) saturate(1.4) sepia(0.06)", emoji: "👑" },
    { name: "Airbrushed", css: "blur(1.5px) brightness(1.3) contrast(0.78) saturate(1.1)", emoji: "🖌️" },
    { name: "Rosy", css: "blur(0.4px) brightness(1.15) saturate(1.5) contrast(0.88) hue-rotate(-15deg)", emoji: "🌸" },
    { name: "Sun-kissed", css: "blur(0.3px) brightness(1.2) saturate(1.35) contrast(0.92) sepia(0.18)", emoji: "☀️" },
    { name: "Filter Max", css: "blur(1.2px) brightness(1.4) contrast(0.75) saturate(1.3)", emoji: "⭐" },
  ];

  const activeFilters = filterTab === "color" ? COLOR_FILTERS : FACE_FILTERS;
  const currentFilter = activeFilters[activeFilter] || activeFilters[0];

  // Canvas overlay for AR stickers
  useEffect(() => {
    const currentSticker = AR_STICKERS[activeSticker]?.sticker;
    if (!currentSticker) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    const draw = () => {
      if (!running) return;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSticker(ctx, currentSticker, canvas.width, canvas.height);
      animFrameRef.current = requestAnimationFrame(draw);
    };
    // Draw at slower rate for static stickers
    draw();
    // For animated stickers, redraw every 500ms
    const interval = ["hearts", "stars", "sparkles", "snow"].includes(currentSticker)
      ? setInterval(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawSticker(ctx, currentSticker, canvas.width, canvas.height);
        }, 400)
      : undefined;

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (interval) clearInterval(interval);
    };
  }, [activeSticker]);

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      toast.error("Camera access denied");
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goLive = () => {
    setIsLive(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    toast.success("You're LIVE! 🔴");
  };

  const endLive = () => {
    setIsLive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    toast.info(`Live ended • ${formatTime(elapsed)}`);
    onClose();
  };

  const flipCamera = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startCamera(next);
  };

  const toggleMic = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMuted(!audioTrack.enabled);
    }
  };

  const sendComment = () => {
    if (!commentInput.trim()) return;
    setComments((prev) => [...prev, { id: Date.now(), user: "You", text: commentInput.trim() }]);
    setCommentInput("");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
    >
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: facingMode === "user" ? "scaleX(-1)" : "none",
          filter: currentFilter.css,
        }}
      />

      {/* Top overlay */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-12">
        <div className="flex items-center gap-2">
          {isLive && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1.5 bg-destructive px-3 py-1 rounded-full"
            >
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-white text-xs font-bold">LIVE</span>
            </motion.div>
          )}
          {isLive && (
            <span className="text-white/80 text-xs font-mono bg-black/40 px-2 py-1 rounded-full">
              {formatTime(elapsed)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full">
              <Eye className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-bold">{viewers}</span>
            </div>
          )}
          <button onClick={isLive ? endLive : onClose} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Spacer + Comments overlay */}
      {isLive ? (
        <div className="relative z-10 flex-1 flex flex-col justify-end px-4 pb-2">
          <div className="max-h-[30vh] overflow-y-auto space-y-1.5 mb-3 scrollbar-none">
            {comments.map((c) => (
              <div key={c.id} className="bg-black/30 backdrop-blur-sm rounded-xl px-3 py-1.5 max-w-[80%]">
                <span className="text-white text-xs font-bold mr-1.5">{c.user}</span>
                <span className="text-white/90 text-xs">{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* TikTok-style bottom filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 200 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="absolute left-0 right-0 bottom-0 z-20"
          >
            <div className="bg-black/70 backdrop-blur-xl pt-3 pb-6 rounded-t-3xl">
              {/* Category tabs - horizontal scroll */}
              <div className="flex items-center gap-1 px-4 mb-3 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
                {(["color", "face"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setFilterTab(tab); setActiveFilter(0); }}
                    className={cn(
                      "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                      filterTab === tab
                        ? "text-white border-b-2 border-white"
                        : "text-white/40"
                    )}
                  >
                    {tab === "color" ? "🎨 Color" : "✨ Beauty"}
                  </button>
                ))}
              </div>
              {/* Filter grid - 4 columns */}
              <div className="grid grid-cols-4 gap-3 px-4 max-h-[35vh] overflow-y-auto scrollbar-none">
                {activeFilters.map((f, i) => (
                  <button
                    key={f.name}
                    onClick={() => setActiveFilter(i)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={cn(
                        "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                        activeFilter === i
                          ? "border-white scale-105 shadow-lg shadow-white/20"
                          : "border-transparent opacity-75"
                      )}
                      style={{ filter: f.css }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-amber-300 via-rose-400 to-violet-500" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium leading-tight",
                      activeFilter === i ? "text-white" : "text-white/50"
                    )}>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="relative z-10 p-4 pb-8 bg-gradient-to-t from-black/60 to-transparent">
        {isLive ? (
          <div className="flex items-center gap-2">
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendComment()}
              placeholder="Say something..."
              className="flex-1 bg-white/15 backdrop-blur-sm text-white text-sm rounded-full px-4 py-2.5 placeholder:text-white/50 outline-none border border-white/10"
            />
            <button onClick={() => setShowFilters(!showFilters)} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </button>
            <button onClick={toggleMic} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              {muted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>
            <button onClick={endLive} className="px-4 py-2.5 bg-destructive rounded-full">
              <span className="text-white text-sm font-bold">End</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-1",
                showFilters ? "bg-primary text-primary-foreground" : "bg-white/15 text-white/70"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" /> Filters
            </button>
            <div className="flex items-center gap-5">
              <button onClick={flipCamera} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <SwitchCamera className="w-5 h-5 text-white" />
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goLive}
                className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center shadow-lg shadow-destructive/40"
              >
                <Camera className="w-6 h-6 text-white" />
              </motion.button>
              <button onClick={toggleMic} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                {muted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
              </button>
            </div>
            <span className="text-white/60 text-xs font-medium">Tap to Go Live</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
