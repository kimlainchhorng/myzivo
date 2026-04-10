import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Medal, Crown, TrendingUp, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  rank: number;
  name: string;
  handle: string;
  score: number;
  avatar?: string;
  streak?: number;
  change: "up" | "down" | "same";
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Alex Morgan", handle: "@alexm", score: 12450, streak: 14, change: "same" },
  { rank: 2, name: "Sarah Kim", handle: "@sarahk", score: 11200, streak: 21, change: "up" },
  { rank: 3, name: "Mike Ross", handle: "@mikeross", score: 9870, streak: 7, change: "up" },
  { rank: 4, name: "DJ Nova", handle: "@djnova", score: 8540, streak: 12, change: "down" },
  { rank: 5, name: "Priya S.", handle: "@priyas", score: 7890, change: "same" },
  { rank: 6, name: "Tom L.", handle: "@toml", score: 6720, change: "up" },
  { rank: 7, name: "Luna", handle: "@luna", score: 5430, streak: 5, change: "down" },
  { rank: 8, name: "Carlos D.", handle: "@carlosd", score: 4890, change: "same" },
  { rank: 9, name: "Nina P.", handle: "@ninap", score: 4210, change: "up" },
  { rank: 10, name: "Amy W.", handle: "@amyw", score: 3780, change: "down" },
];

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
};

const rankBg = (rank: number) => {
  if (rank === 1) return "bg-yellow-500/10 border-yellow-500/20";
  if (rank === 2) return "bg-gray-500/5 border-gray-500/10";
  if (rank === 3) return "bg-amber-500/5 border-amber-500/10";
  return "";
};

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("weekly");
  const [myRank] = useState(15);
  const [myScore] = useState(2450);

  return (
    <div className="min-h-screen bg-background pb-20 safe-area-top">
      <div className="bg-gradient-to-b from-primary/20 to-background p-4 pt-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Trophy className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Leaderboard</h1>
        </div>

        {/* My Position */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 mb-4 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">Y</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">Your Rank</p>
                  <p className="text-xs text-muted-foreground">#{myRank} · {myScore.toLocaleString()} pts</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+340</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-4">
          {["weekly", "monthly", "all-time"].map((p) => (
            <Badge key={p} variant={period === p ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setPeriod(p)}>
              {p}
            </Badge>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-3 px-4 mb-6">
        {[MOCK_LEADERBOARD[1], MOCK_LEADERBOARD[0], MOCK_LEADERBOARD[2]].map((entry, i) => {
          const heights = ["h-20", "h-28", "h-16"];
          const sizes = ["h-12 w-12", "h-16 w-16", "h-12 w-12"];
          return (
            <motion.div key={entry.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center">
              <Avatar className={`${sizes[i]} border-2 ${entry.rank === 1 ? "border-yellow-500" : "border-muted"} mb-1`}>
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">{entry.name[0]}</AvatarFallback>
              </Avatar>
              <p className="text-xs font-medium text-foreground truncate max-w-[80px]">{entry.name}</p>
              <p className="text-xs text-muted-foreground">{entry.score.toLocaleString()}</p>
              <div className={`${heights[i]} w-20 rounded-t-lg mt-1 flex items-start justify-center pt-2 ${
                entry.rank === 1 ? "bg-yellow-500/20" : entry.rank === 2 ? "bg-gray-500/10" : "bg-amber-500/10"
              }`}>
                {rankIcon(entry.rank)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full List */}
      <div className="px-4 space-y-2">
        {MOCK_LEADERBOARD.slice(3).map((entry, i) => (
          <motion.div key={entry.rank} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className={`p-3 flex items-center gap-3 ${rankBg(entry.rank)}`}>
              <div className="w-6 flex justify-center shrink-0">{rankIcon(entry.rank)}</div>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">{entry.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground">{entry.handle}</p>
              </div>
              {entry.streak && (
                <div className="flex items-center gap-0.5 text-orange-500">
                  <Flame className="h-3 w-3" />
                  <span className="text-xs font-medium">{entry.streak}</span>
                </div>
              )}
              <span className="text-sm font-semibold text-foreground">{entry.score.toLocaleString()}</span>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
