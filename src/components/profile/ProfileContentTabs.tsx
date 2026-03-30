import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ImageIcon, Heart, MessageCircle, Eye, X, Users, Mic, MicOff,
  Camera, SwitchCamera, Share2, Send, ThumbsUp, Play, Radio, FileText,
  Video, Smile, MapPin, Type, Image, Film,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Demo data ──
const demoFeed = [
  { id: "p1", type: "photo" as const, likes: 24, comments: 3, caption: "Beach vibes 🏖️", time: "2h", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop", user: { name: "Sarah M.", avatar: "https://i.pravatar.cc/100?img=1" } },
  { id: "p2", type: "photo" as const, likes: 18, comments: 1, caption: "City lights", time: "5h", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=400&fit=crop", user: { name: "Alex K.", avatar: "https://i.pravatar.cc/100?img=2" } },
  { id: "v1", type: "reel" as const, likes: 42, comments: 7, caption: "Road trip! 🚗", time: "1d", views: 1200, url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=600&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p3", type: "photo" as const, likes: 31, comments: 5, caption: "Morning coffee", time: "2d", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "v2", type: "reel" as const, likes: 89, comments: 12, caption: "Sunset vibes 🌅", time: "3d", views: 3400, url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=600&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p4", type: "photo" as const, likes: 15, comments: 2, caption: "Sunset 🌅", time: "3d", url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "v3", type: "reel" as const, likes: 28, comments: 4, caption: "Mountain hike", time: "4d", views: 890, url: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&h=600&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p5", type: "photo" as const, likes: 20, comments: 3, caption: "Travel goals ✈️", time: "5d", url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
  { id: "p6", type: "photo" as const, likes: 12, comments: 1, caption: "Paradise 🌴", time: "1w", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop", user: { name: "You", avatar: "https://i.pravatar.cc/100?img=3" } },
];

const CREATE_OPTIONS = [
  { id: "photo", label: "Photo", icon: Image, color: "text-primary" },
  { id: "video", label: "Video", icon: Film, color: "text-blue-500" },
  { id: "live", label: "Go Live", icon: Radio, color: "text-destructive" },
  { id: "status", label: "Status", icon: Type, color: "text-amber-500" },
] as const;

type CreateType = (typeof CREATE_OPTIONS)[number]["id"];

export default function ProfileContentTabs({ userId }: { userId?: string }) {
  const { user } = useAuth();
  const [showComposer, setShowComposer] = useState(false);
  const [composerType, setComposerType] = useState<CreateType | null>(null);
  const [selectedPost, setSelectedPost] = useState<(typeof demoFeed)[0] | null>(null);

  return (
    <div className="space-y-3">
      {/* Create Post Button */}
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
          <Film className="w-4.5 h-4.5 text-blue-400/60" />
          <Radio className="w-4.5 h-4.5 text-destructive/60" />
        </div>
      </motion.button>

      {/* Unified Feed Grid */}
      <div className="grid grid-cols-3 gap-0.5 rounded-2xl overflow-hidden">
        {demoFeed.map((item) => (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPost(item)}
            className={cn(
              "relative bg-muted/40 group cursor-pointer overflow-hidden",
              item.type === "video" ? "aspect-[9/14] row-span-2" : item.type === "status" ? "aspect-square" : "aspect-square"
            )}
          >
            {item.type === "status" ? (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 flex flex-col items-center justify-center p-2 gap-1">
                <span className="text-2xl">{item.emoji}</span>
                <p className="text-[9px] text-foreground/70 text-center line-clamp-2 font-medium">{item.caption}</p>
              </div>
            ) : (
              <>
                <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                {item.type === "video" && (
                  <div className="absolute top-1.5 right-1.5 z-10">
                    <Play className="w-4 h-4 text-white fill-white drop-shadow-lg" />
                  </div>
                )}
                {item.type === "video" && item.views && (
                  <div className="absolute bottom-1.5 left-1.5 z-10 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5 text-white" />
                    <span className="text-[9px] text-white font-bold">{item.views > 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views}</span>
                  </div>
                )}
              </>
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
              className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 shrink-0">
                <button onClick={() => setSelectedPost(null)} className="text-white/80 p-1">
                  <X className="w-6 h-6" />
                </button>
                <span className="text-white text-sm font-semibold">{selectedPost.type === "status" ? "Status" : "Post"}</span>
                <div className="w-8" />
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
                {selectedPost.type === "status" ? (
                  <div className="text-center space-y-3">
                    <span className="text-6xl">{selectedPost.emoji}</span>
                    <p className="text-white text-lg font-medium">{selectedPost.caption}</p>
                  </div>
                ) : (
                  <img src={selectedPost.url} alt="" className="max-w-full max-h-[60vh] rounded-xl object-contain" />
                )}
              </div>

              {/* Bottom info */}
              <div className="p-4 space-y-3 shrink-0">
                <p className="text-white/90 text-sm">{selectedPost.caption}</p>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-white/70">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">{selectedPost.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-white/70">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{selectedPost.comments}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-white/70 ml-auto">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-white/40 text-xs">{selectedPost.time} ago</span>
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
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>

                {!composerType ? (
                  /* Type selection */
                  <div className="p-5 space-y-4">
                    <h3 className="text-lg font-bold text-foreground text-center">Create</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {CREATE_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <motion.button
                            key={opt.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (opt.id === "live") {
                                setShowComposer(false);
                                setComposerType(null);
                                toast.info("Opening Live...");
                                // Could navigate to live section
                              } else {
                                setComposerType(opt.id);
                              }
                            }}
                            className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-muted/40 border border-border/20 hover:bg-muted/60 transition-colors"
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
                  /* Composer form */
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
    </div>
  );
}

function ComposerForm({ type, onClose, onBack }: { type: CreateType; onClose: () => void; onBack: () => void }) {
  const [caption, setCaption] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  };

  const handlePost = () => {
    if (type === "status" && !caption.trim()) {
      toast.error("Write something first!");
      return;
    }
    if ((type === "photo" || type === "video") && !mediaPreview) {
      toast.error("Add media first!");
      return;
    }
    toast.success("Posted successfully! 🎉");
    onClose();
  };

  const typeLabel = type === "photo" ? "Photo" : type === "video" ? "Video" : "Status";
  const typeIcon = type === "photo" ? Image : type === "video" ? Film : Type;
  const TypeIcon = typeIcon;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-primary font-medium">← Back</button>
        <h3 className="text-base font-bold text-foreground">New {typeLabel}</h3>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handlePost}
          className="bg-primary text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full"
        >
          Post
        </motion.button>
      </div>

      {/* Media picker for photo/video */}
      {(type === "photo" || type === "video") && (
        <div>
          {mediaPreview ? (
            <div className="relative rounded-2xl overflow-hidden">
              {type === "video" ? (
                <video src={mediaPreview} className="w-full max-h-[40vh] object-cover rounded-2xl" controls />
              ) : (
                <img src={mediaPreview} alt="" className="w-full max-h-[40vh] object-cover rounded-2xl" />
              )}
              <button
                onClick={() => setMediaPreview(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
              >
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
              <span className="text-sm text-muted-foreground">Tap to add {typeLabel.toLowerCase()}</span>
            </motion.button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={type === "video" ? "video/*" : "image/*"}
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}

      {/* Status emoji picker area */}
      {type === "status" && (
        <div className="flex justify-center gap-3 py-2">
          {["😊", "🎉", "✈️", "☕", "🏖️", "❤️", "🔥", "💪"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => setCaption((prev) => prev + emoji)}
              className="text-2xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Caption input */}
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder={type === "status" ? "What's on your mind?" : "Write a caption..."}
        rows={type === "status" ? 4 : 2}
        className="w-full bg-muted/30 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none border border-border/20 focus:border-primary/30 transition-colors"
      />

      {/* Quick actions */}
      <div className="flex items-center gap-3 text-muted-foreground">
        <button className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors">
          <MapPin className="w-4 h-4" /> Location
        </button>
        <button className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors">
          <Smile className="w-4 h-4" /> Feeling
        </button>
        {type !== "photo" && type !== "video" && (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors"
          >
            <Image className="w-4 h-4" /> Photo
          </button>
        )}
      </div>
    </div>
  );
}
