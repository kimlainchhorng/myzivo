import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Award, Star, Flame, Target, Lock, CheckCircle, Trophy, Zap, Heart, MessageCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  earned: boolean;
  progress: number;
  maxProgress: number;
  category: string;
}

const BADGES: BadgeDef[] = [
  { id: "1", name: "First Post", description: "Create your first post", icon: Zap, color: "text-yellow-500 bg-yellow-500/10", earned: true, progress: 1, maxProgress: 1, category: "content" },
  { id: "2", name: "Social Butterfly", description: "Follow 50 people", icon: Users, color: "text-blue-500 bg-blue-500/10", earned: true, progress: 50, maxProgress: 50, category: "social" },
  { id: "3", name: "Heartbreaker", description: "Receive 100 likes", icon: Heart, color: "text-red-500 bg-red-500/10", earned: true, progress: 100, maxProgress: 100, category: "engagement" },
  { id: "4", name: "Chatterbox", description: "Send 500 messages", icon: MessageCircle, color: "text-green-500 bg-green-500/10", earned: false, progress: 342, maxProgress: 500, category: "social" },
  { id: "5", name: "Star Creator", description: "Get 1000 total views", icon: Star, color: "text-purple-500 bg-purple-500/10", earned: false, progress: 780, maxProgress: 1000, category: "content" },
  { id: "6", name: "On Fire", description: "7-day posting streak", icon: Flame, color: "text-orange-500 bg-orange-500/10", earned: false, progress: 4, maxProgress: 7, category: "streaks" },
  { id: "7", name: "Marketplace Pro", description: "Complete 10 sales", icon: Target, color: "text-emerald-500 bg-emerald-500/10", earned: false, progress: 3, maxProgress: 10, category: "commerce" },
  { id: "8", name: "Top Creator", description: "Reach 5000 followers", icon: Trophy, color: "text-amber-500 bg-amber-500/10", earned: false, progress: 1240, maxProgress: 5000, category: "social" },
];

const CATEGORIES = ["all", "content", "social", "engagement", "streaks", "commerce"];

export default function BadgesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const earned = BADGES.filter(b => b.earned).length;
  const filtered = activeTab === "all" ? BADGES : BADGES.filter(b => b.category === activeTab);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-b from-primary/20 to-background p-4 pt-6 safe-area-top">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Award className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Badges & Achievements</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{earned}/{BADGES.length}</p>
            <p className="text-sm text-muted-foreground">Badges Earned</p>
            <Progress value={(earned / BADGES.length) * 100} className="h-2 mt-3" />
          </Card>
        </motion.div>
      </div>

      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {CATEGORIES.map((cat) => (
            <Badge key={cat} variant={activeTab === cat ? "default" : "outline"} className="cursor-pointer capitalize shrink-0"
              onClick={() => setActiveTab(cat)}>
              {cat}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((badge, i) => (
            <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className={`p-4 text-center relative ${!badge.earned ? "opacity-60" : ""}`}>
                {badge.earned && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
                {!badge.earned && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2 ${badge.color}`}>
                  <badge.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-0.5">{badge.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                {!badge.earned && (
                  <>
                    <Progress value={(badge.progress / badge.maxProgress) * 100} className="h-1.5 mb-1" />
                    <p className="text-xs text-muted-foreground">{badge.progress}/{badge.maxProgress}</p>
                  </>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
