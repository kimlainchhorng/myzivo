import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption?: string;
  created_at: string;
  viewed?: boolean;
  user_name?: string;
  user_avatar?: string;
}

interface StoryGroup {
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  stories: Story[];
  hasUnviewed: boolean;
}

const DEMO_STORIES: StoryGroup[] = [
  {
    user_id: "demo-1",
    user_name: "Sarah",
    user_avatar: null,
    hasUnviewed: true,
    stories: [
      { id: "s1", user_id: "demo-1", media_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=700&fit=crop", media_type: "image", caption: "Beach vibes 🏖️", created_at: new Date(Date.now() - 3600000).toISOString(), user_name: "Sarah", user_avatar: undefined },
      { id: "s2", user_id: "demo-1", media_url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=700&fit=crop", media_type: "image", caption: "Sunset cruise 🌅", created_at: new Date(Date.now() - 7200000).toISOString(), user_name: "Sarah", user_avatar: undefined },
    ],
  },
  {
    user_id: "demo-2",
    user_name: "Mike",
    user_avatar: null,
    hasUnviewed: true,
    stories: [
      { id: "s3", user_id: "demo-2", media_url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=700&fit=crop", media_type: "image", caption: "Road trip! 🚗", created_at: new Date(Date.now() - 1800000).toISOString(), user_name: "Mike", user_avatar: undefined },
    ],
  },
  {
    user_id: "demo-3",
    user_name: "Emma",
    user_avatar: null,
    hasUnviewed: false,
    stories: [
      { id: "s4", user_id: "demo-3", media_url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=700&fit=crop", media_type: "image", caption: "Travel goals ✈️", created_at: new Date(Date.now() - 5400000).toISOString(), user_name: "Emma", user_avatar: undefined },
    ],
  },
  {
    user_id: "demo-4",
    user_name: "Alex",
    user_avatar: null,
    hasUnviewed: true,
    stories: [
      { id: "s5", user_id: "demo-4", media_url: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&h=700&fit=crop", media_type: "image", caption: "Mountain hike 🏔️", created_at: new Date(Date.now() - 900000).toISOString(), user_name: "Alex", user_avatar: undefined },
    ],
  },
  {
    user_id: "demo-5",
    user_name: "Lisa",
    user_avatar: null,
    hasUnviewed: true,
    stories: [
      { id: "s6", user_id: "demo-5", media_url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=700&fit=crop", media_type: "image", caption: "Paradise 🌴", created_at: new Date(Date.now() - 2700000).toISOString(), user_name: "Lisa", user_avatar: undefined },
    ],
  },
];

const ProfileStories = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storyGroups] = useState<StoryGroup[]>(DEMO_STORIES);
  const [viewingGroup, setViewingGroup] = useState<StoryGroup | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const STORY_DURATION = 5000;

  useEffect(() => {
    if (!viewingGroup) return;
    setProgress(0);
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(p);
      if (p < 1) {
        timerRef.current = setTimeout(tick, 30);
      } else {
        if (currentStoryIndex < viewingGroup.stories.length - 1) {
          setCurrentStoryIndex(prev => prev + 1);
        } else {
          setViewingGroup(null);
          setCurrentStoryIndex(0);
        }
      }
    };
    timerRef.current = setTimeout(tick, 30);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [viewingGroup, currentStoryIndex]);

  const openStory = (group: StoryGroup) => {
    setCurrentStoryIndex(0);
    setViewingGroup(group);
  };

  const nextStory = () => {
    if (!viewingGroup) return;
    if (currentStoryIndex < viewingGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      const idx = storyGroups.findIndex(g => g.user_id === viewingGroup.user_id);
      if (idx < storyGroups.length - 1) {
        setViewingGroup(storyGroups[idx + 1]);
        setCurrentStoryIndex(0);
      } else {
        setViewingGroup(null);
      }
    }
  };

  const prevStory = () => {
    if (!viewingGroup) return;
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else {
      const idx = storyGroups.findIndex(g => g.user_id === viewingGroup.user_id);
      if (idx > 0) {
        setViewingGroup(storyGroups[idx - 1]);
        setCurrentStoryIndex(storyGroups[idx - 1].stories.length - 1);
      }
    }
  };

  const handleAddStory = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    toast.success("Story uploaded! 📸");
    e.target.value = "";
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)}m`;
    return `${hours}h`;
  };

  const currentStory = viewingGroup?.stories[currentStoryIndex];

  return (
    <>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleAddStory}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-muted/60 border-2 border-dashed border-primary/40 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                      {profile?.full_name?.[0] || "Y"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-primary/60" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-md">
                <Plus className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground w-16 text-center truncate">Your story</span>
          </motion.button>

          {storyGroups.map((group) => (
            <motion.button
              key={group.user_id}
              whileTap={{ scale: 0.93 }}
              onClick={() => openStory(group)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className={`w-16 h-16 rounded-full p-[2.5px] ${
                group.hasUnviewed
                  ? "bg-gradient-to-br from-primary via-green-400 to-emerald-500"
                  : "bg-muted-foreground/20"
              }`}>
                <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-muted">
                  {group.stories[0]?.media_url ? (
                    <img
                      src={group.stories[0].media_url}
                      alt={group.user_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                      {group.user_name[0]}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-medium text-foreground/70 w-16 text-center truncate">
                {group.user_name}
              </span>
            </motion.button>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {createPortal(
        <AnimatePresence>
          {viewingGroup && currentStory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
            >
              {/* Tap zones */}
              <div className="absolute inset-0 z-40 flex">
                <button className="w-1/3 h-full" onClick={prevStory} aria-label="Previous" />
                <div className="w-1/3 h-full" />
                <button className="w-1/3 h-full" onClick={nextStory} aria-label="Next" />
              </div>

              {/* Progress bars */}
              <div className="absolute top-3 left-3 right-3 z-50 flex gap-1">
                {viewingGroup.stories.map((_, i) => (
                  <div key={i} className="flex-1 h-[3px] rounded-full bg-white/25 overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      style={{
                        width: i < currentStoryIndex ? "100%" : i === currentStoryIndex ? `${progress * 100}%` : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-8 left-3 right-3 z-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">
                    {viewingGroup.user_avatar ? (
                      <img src={viewingGroup.user_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                        {viewingGroup.user_name[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-white text-sm font-semibold">{viewingGroup.user_name}</span>
                  <span className="text-white/50 text-xs">{timeAgo(currentStory.created_at)}</span>
                </div>
                <button
                  onClick={() => { setViewingGroup(null); setCurrentStoryIndex(0); }}
                  className="p-2 text-white/80 hover:text-white z-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Story content */}
              <motion.div
                key={currentStory.id}
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                {currentStory.media_type === "video" ? (
                  <video
                    src={currentStory.media_url}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={currentStory.media_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>

              {/* Caption */}
              {currentStory.caption && (
                <div className="absolute bottom-12 left-0 right-0 z-50 text-center px-6">
                  <p className="text-white text-sm font-medium drop-shadow-lg bg-black/30 backdrop-blur-sm rounded-2xl px-4 py-2 inline-block">
                    {currentStory.caption}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ProfileStories;
