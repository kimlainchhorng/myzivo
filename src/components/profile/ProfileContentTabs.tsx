import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, Play, Radio, FileText, ImageIcon, Heart, MessageCircle, Eye, X, Users, Mic, MicOff, Camera, SwitchCamera, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "posts", label: "Posts", icon: Grid3X3 },
  { id: "videos", label: "Videos", icon: Play },
  { id: "live", label: "Live", icon: Radio },
  { id: "status", label: "Status", icon: FileText },
] as const;

type TabId = (typeof tabs)[number]["id"];

// Demo data
const demoPosts = [
  { id: 1, type: "image", likes: 24, comments: 3 },
  { id: 2, type: "image", likes: 18, comments: 1 },
  { id: 3, type: "image", likes: 42, comments: 7 },
  { id: 4, type: "image", likes: 9, comments: 0 },
  { id: 5, type: "image", likes: 31, comments: 5 },
  { id: 6, type: "image", likes: 15, comments: 2 },
];

export default function ProfileContentTabs({ userId }: { userId?: string }) {
  const [activeTab, setActiveTab] = useState<TabId>("posts");

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex bg-muted/30 rounded-2xl p-1 gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 relative flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-[11px] font-bold transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="profile-tab-bg"
                  className="absolute inset-0 bg-card rounded-xl shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">
                <Icon className="w-4 h-4" />
              </span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "posts" && <PostsGrid />}
          {activeTab === "videos" && <VideosGrid />}
          {activeTab === "live" && <LiveSection />}
          {activeTab === "status" && <StatusSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PostsGrid() {
  return (
    <div>
      {demoPosts.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 rounded-xl overflow-hidden">
          {demoPosts.map((post) => (
            <motion.div
              key={post.id}
              whileTap={{ scale: 0.95 }}
              className="relative aspect-square bg-muted/50 group cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <span className="flex items-center gap-1 text-white text-xs font-bold">
                  <Heart className="w-3.5 h-3.5 fill-white" /> {post.likes}
                </span>
                <span className="flex items-center gap-1 text-white text-xs font-bold">
                  <MessageCircle className="w-3.5 h-3.5 fill-white" /> {post.comments}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Grid3X3} text="No posts yet" sub="Share your first photo or moment" />
      )}
    </div>
  );
}

function VideosGrid() {
  return (
    <div className="grid grid-cols-3 gap-0.5 rounded-xl overflow-hidden">
      {[1, 2, 3].map((id) => (
        <motion.div
          key={id}
          whileTap={{ scale: 0.95 }}
          className="relative aspect-[9/16] bg-muted/50 cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Play className="w-8 h-8 text-muted-foreground/40 fill-muted-foreground/20" />
          </div>
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-white/90 text-[10px] font-bold bg-black/40 rounded-full px-1.5 py-0.5">
            <Eye className="w-3 h-3" /> 0
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-10 h-10 text-white fill-white/80" />
          </div>
        </motion.div>
      ))}
      {[1, 2, 3].length === 0 && (
        <div className="col-span-3">
          <EmptyState icon={Play} text="No videos yet" sub="Share your first video" />
        </div>
      )}
    </div>
  );
}

function LiveSection() {
  return (
    <div className="rounded-2xl bg-card border border-border/30 p-6 text-center space-y-3">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
        <Radio className="w-7 h-7 text-destructive" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">Go Live</p>
        <p className="text-xs text-muted-foreground mt-1">Start a live video and connect with your followers in real-time</p>
      </div>
      <button className="bg-destructive text-destructive-foreground rounded-xl px-6 py-2.5 text-sm font-bold shadow-md shadow-destructive/25">
        Start Live Video
      </button>
    </div>
  );
}

function StatusSection() {
  const statuses = [
    { id: 1, text: "Feeling great today! ☀️", time: "2h ago", emoji: "😊" },
    { id: 2, text: "On the road again 🚗", time: "5h ago", emoji: "🚗" },
    { id: 3, text: "Coffee time ☕", time: "1d ago", emoji: "☕" },
  ];

  return (
    <div className="space-y-2">
      {statuses.map((status) => (
        <motion.div
          key={status.id}
          whileTap={{ scale: 0.98 }}
          className="bg-card rounded-xl p-3 border border-border/30 flex items-start gap-3"
        >
          <span className="text-2xl">{status.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{status.text}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{status.time}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, text, sub }: { icon: any; text: string; sub: string }) {
  return (
    <div className="py-12 text-center space-y-2">
      <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-bold text-muted-foreground">{text}</p>
      <p className="text-xs text-muted-foreground/70">{sub}</p>
    </div>
  );
}
