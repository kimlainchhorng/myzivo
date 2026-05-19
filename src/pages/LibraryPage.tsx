/**
 * LibraryPage — Your Library hub.
 * Unified entry point for everything the user has saved: bookmarks, posts,
 * searches, and favorites. IG-style cards with gradient icon tiles.
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Search, Heart, ChevronRight, Library, Archive, Star, FolderHeart, Users, Vote, AtSign, Trophy, BookImage, Handshake, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

interface LibrarySection {
  icon: typeof Bookmark;
  title: string;
  description: string;
  path: string;
}

const sections: LibrarySection[] = [
  {
    icon: Bookmark,
    title: "Saved Posts",
    description: "Posts and reels you bookmarked from the feed",
    path: "/saved-posts",
  },
  {
    icon: Bookmark,
    title: "Bookmarks",
    description: "All your bookmarked content in one place",
    path: "/saved",
  },
  {
    icon: Search,
    title: "Saved Searches",
    description: "Searches you saved for later — flights, hotels, more",
    path: "/saved-searches",
  },
  {
    icon: Heart,
    title: "Favorites",
    description: "Your favorite hotels, destinations, and creators",
    path: "/saved-favorites",
  },
  {
    icon: Archive,
    title: "Story Archive",
    description: "Expired stories saved for repost and memory",
    path: "/archive",
  },
  {
    icon: Star,
    title: "Highlights",
    description: "Pin best stories to your profile in named collections",
    path: "/highlights",
  },
  {
    icon: FolderHeart,
    title: "Collections",
    description: "Organize bookmarked posts into named, color-tagged folders",
    path: "/collections",
  },
  {
    icon: Users,
    title: "Close Friends",
    description: "Pick who sees the stories you share privately",
    path: "/close-friends",
  },
  {
    icon: Vote,
    title: "Polls",
    description: "Create polls and track audience answers live",
    path: "/polls",
  },
  {
    icon: AtSign,
    title: "Mentions",
    description: "Posts where you've been @-tagged by others",
    path: "/mentions",
  },
  {
    icon: Trophy,
    title: "Milestones",
    description: "Creator achievements and what's coming next",
    path: "/creator/milestones",
  },
  {
    icon: BookImage,
    title: "Albums",
    description: "Group your posts into named portfolio albums",
    path: "/albums",
  },
  {
    icon: Handshake,
    title: "Collabs",
    description: "Co-author invites and accepted collaborations",
    path: "/collabs",
  },
  {
    icon: Smile,
    title: "Sticker Store",
    description: "Browse sticker packs for stories, reels, and messages",
    path: "/stickers",
  },
];

export default function LibraryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Your Library · ZIVO" description="All your saved content in one place." noIndex />

      <div className="sticky top-0 safe-area-top z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            aria-label="Back"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-ig-gradient flex items-center justify-center">
              <Library className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-ig-gradient">Your Library</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="space-y-3">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.button
                key={section.path}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.18 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(section.path)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-secondary/60 active:scale-[0.99] transition-all text-left"
              >
                <div className="shrink-0 h-12 w-12 rounded-xl bg-ig-gradient flex items-center justify-center shadow-sm">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-foreground">{section.title}</p>
                  <p className="text-[13px] text-muted-foreground line-clamp-1">{section.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
