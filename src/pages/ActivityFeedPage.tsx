import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, MessageCircle, UserPlus, Star, ShoppingBag, Award, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Activity {
  id: string;
  type: "like" | "comment" | "follow" | "review" | "purchase" | "achievement" | "post";
  user: string;
  action: string;
  target?: string;
  time: string;
  preview?: string;
}

const MOCK_ACTIVITY: Activity[] = [
  { id: "1", type: "like", user: "Alex Morgan", action: "liked your photo", time: "2m ago", preview: "Sunset in Bali" },
  { id: "2", type: "comment", user: "Sarah Kim", action: "commented on your reel", time: "15m ago", preview: "Amazing content! 🔥" },
  { id: "3", type: "follow", user: "Mike Ross", action: "started following you", time: "30m ago" },
  { id: "4", type: "follow", user: "Luna, DJ Nova", action: "started following you", time: "1h ago" },
  { id: "5", type: "review", user: "Tom L.", action: "left a 5★ review on your listing", time: "2h ago", target: "Vintage Camera" },
  { id: "6", type: "purchase", user: "Nina P.", action: "purchased your item", time: "3h ago", target: "Travel Backpack" },
  { id: "7", type: "achievement", user: "You", action: "earned a new badge", time: "5h ago", target: "Top Creator 🏆" },
  { id: "8", type: "like", user: "Carlos D. and 12 others", action: "liked your post", time: "8h ago" },
  { id: "9", type: "post", user: "Priya S.", action: "mentioned you in a post", time: "1d ago" },
  { id: "10", type: "follow", user: "Amy W.", action: "started following you", time: "1d ago" },
];

const ICON_MAP: Record<string, any> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  review: Star,
  purchase: ShoppingBag,
  achievement: Award,
  post: Zap,
};

const COLOR_MAP: Record<string, string> = {
  like: "text-red-500 bg-red-500/10",
  comment: "text-blue-500 bg-blue-500/10",
  follow: "text-primary bg-primary/10",
  review: "text-yellow-500 bg-yellow-500/10",
  purchase: "text-green-500 bg-green-500/10",
  achievement: "text-purple-500 bg-purple-500/10",
  post: "text-orange-500 bg-orange-500/10",
};

export default function ActivityFeedPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");

  const filters = ["all", "likes", "comments", "follows", "sales"];
  const filterTypeMap: Record<string, string[]> = {
    all: [],
    likes: ["like"],
    comments: ["comment"],
    follows: ["follow"],
    sales: ["purchase", "review"],
  };

  const filtered = filter === "all" ? MOCK_ACTIVITY : MOCK_ACTIVITY.filter(a => filterTypeMap[filter]?.includes(a.type));

  // Group by time period
  const today = filtered.filter(a => a.time.includes("m ago") || a.time.includes("h ago"));
  const earlier = filtered.filter(a => a.time.includes("d ago"));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 safe-area-top z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Activity</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <Badge key={f} variant={filter === f ? "default" : "outline"} className="cursor-pointer capitalize shrink-0"
              onClick={() => setFilter(f)}>
              {f}
            </Badge>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border">
        {today.length > 0 && (
          <>
            <p className="text-xs font-semibold text-muted-foreground px-4 py-2 bg-muted/50">Today</p>
            {today.map((activity, i) => (
              <ActivityRow key={activity.id} activity={activity} index={i} />
            ))}
          </>
        )}
        {earlier.length > 0 && (
          <>
            <p className="text-xs font-semibold text-muted-foreground px-4 py-2 bg-muted/50">Earlier</p>
            {earlier.map((activity, i) => (
              <ActivityRow key={activity.id} activity={activity} index={i} />
            ))}
          </>
        )}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ activity, index }: { activity: Activity; index: number }) {
  const Icon = ICON_MAP[activity.type];
  const colorClass = COLOR_MAP[activity.type];

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{activity.user}</span>{" "}
          {activity.action}
        </p>
        {activity.target && <p className="text-xs text-muted-foreground">{activity.target}</p>}
        {activity.preview && <p className="text-xs text-muted-foreground italic">"{activity.preview}"</p>}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
    </motion.div>
  );
}
