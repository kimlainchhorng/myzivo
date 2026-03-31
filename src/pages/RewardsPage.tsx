/**
 * ZIVO REWARDS PAGE — Premium 2026
 * Central hub for ZIVO Points loyalty program
 */

import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Gift, Users, Trophy, Info, Crown, Star, Flame, Target, Zap, TrendingUp, Award, Calendar, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import SEOHead from "@/components/SEOHead";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import {
  PointsBalanceCard,
  PointsEarningList,
  TierProgressCard,
  RedemptionOptions,
  ReferralCard,
} from "@/components/loyalty";
import { POINTS_COMPLIANCE, type ZivoTier } from "@/config/zivoPoints";

export default function RewardsPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { points, isLoading } = useLoyaltyPoints();
  const [activeTab, setActiveTab] = useState("overview");
  
  const mapTier = (oldTier: string): ZivoTier => {
    if (oldTier === 'gold' || oldTier === 'silver') return 'elite';
    if (oldTier === 'bronze') return 'traveler';
    return 'explorer';
  };

  if (!authLoading && !user) {
    return <Navigate to="/login?redirect=/rewards" replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEOHead 
        title="ZIVO Points | Earn Rewards on Your Travels"
        description="Earn ZIVO Points on bookings and redeem for discounts, priority alerts, and exclusive deals."
        canonical="https://hizivo.com/rewards"
      />
      
      {/* Premium Header */}
      <div className="sticky top-0 safe-area-top z-40 bg-background/95 backdrop-blur-2xl border-b border-border/30">
        <div className="px-4 py-3 safe-area-top">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold">ZIVO Points</h1>
                <p className="text-[10px] text-muted-foreground">Earn rewards on every trip</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 pt-5 space-y-6 max-w-4xl mx-auto">
        {/* Balance Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <PointsBalanceCard />
        </motion.div>
        
        {/* Premium Tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
              {[
                { value: "overview", icon: Star, label: "Overview" },
                { value: "earn", icon: Trophy, label: "Earn" },
                { value: "redeem", icon: Gift, label: "Redeem" },
                { value: "refer", icon: Users, label: "Refer" },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 touch-manipulation ${
                    activeTab === tab.value 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
            
            <TabsContent value="overview" className="space-y-5">
              <TierProgressCard />
              <PointsEarningList completedActions={['account_creation']} />
            </TabsContent>
            
            <TabsContent value="earn" className="space-y-5">
              <PointsEarningList completedActions={['account_creation']} />
              <Card className="border-primary/15 bg-primary/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Points are credited automatically after qualifying actions are completed.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="redeem">
              <RedemptionOptions pointsBalance={points.points_balance} />
            </TabsContent>
            
            <TabsContent value="refer">
              <ReferralCard 
                referralCode={user?.id?.slice(0, 8).toUpperCase() || "ZIVO-NEW"}
                referralCount={0}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* === WAVE 7: Rich Rewards Content === */}
        
        {/* Points Earning Streak */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-bold text-foreground">12-Day Earning Streak 🔥</p>
              </div>
              <div className="flex gap-1">
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <div key={i} className={cn("flex-1 text-center py-1.5 rounded-lg text-[9px] font-bold", i < 5 ? "bg-amber-500/20 text-amber-500" : "bg-muted/50 text-muted-foreground")}>
                    {d}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Keep your streak! Book or search daily to earn bonus points.</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Challenges */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-violet-500" /> Active Challenges</h2>
          <div className="space-y-2">
            {[
              { name: "Weekend Warrior", desc: "Book 2 trips this month", progress: 1, total: 2, reward: "500 pts", icon: Zap, color: "text-amber-500" },
              { name: "Explorer", desc: "Search 5 destinations", progress: 3, total: 5, reward: "200 pts", icon: TrendingUp, color: "text-sky-500" },
              { name: "First Review", desc: "Rate your last trip", progress: 0, total: 1, reward: "100 pts", icon: Star, color: "text-emerald-500" },
            ].map(c => (
              <Card key={c.name} className="border-border/40">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center")}>
                    <c.icon className={cn("w-4 h-4", c.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground">{c.name}</p>
                      <Badge className="bg-amber-500/10 text-amber-500 border-0 text-[8px]">{c.reward}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                    <div className="h-1.5 rounded-full bg-muted/50 mt-1.5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(c.progress / c.total) * 100}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-primary" />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{c.progress}/{c.total} completed</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Points History Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5 text-primary" /> Points Earned (Last 6 Months)</p>
              <div className="flex items-end gap-1.5 h-16">
                {[120, 250, 80, 340, 190, 420].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(val / 500) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.08 }}
                      className={cn("w-full rounded-t", i === 5 ? "bg-primary" : "bg-primary/20")} />
                    <span className="text-[8px] text-muted-foreground">{["Oct","Nov","Dec","Jan","Feb","Mar"][i]}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                <span>Total: <b className="text-foreground">1,400 pts</b></span>
                <span className="text-emerald-500">↑ 121% vs prev</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" /> Community Leaderboard</h2>
          <Card className="border-border/40">
            <CardContent className="p-3 space-y-1.5">
              {[
                { rank: 1, name: "Alex M.", pts: "12,450", badge: "🥇" },
                { rank: 2, name: "Sarah K.", pts: "11,200", badge: "🥈" },
                { rank: 3, name: "Mike R.", pts: "9,800", badge: "🥉" },
                { rank: 4, name: "You", pts: String(points.lifetime_points || 420), badge: "🎯", isYou: true },
              ].map(r => (
                <div key={r.rank} className={cn("flex items-center gap-3 p-2 rounded-lg", r.isYou && "bg-primary/5 border border-primary/20")}>
                  <span className="text-sm">{r.badge}</span>
                  <span className="text-xs font-bold text-foreground flex-1">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.pts} pts</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Milestone Rewards */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500" /> Milestone Rewards</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { pts: "1,000", reward: "$10 credit", reached: true },
              { pts: "2,500", reward: "Free upgrade", reached: false },
              { pts: "5,000", reward: "Lounge pass", reached: false },
              { pts: "10,000", reward: "Free flight", reached: false },
            ].map(m => (
              <Card key={m.pts} className={cn("border-border/40", m.reached && "border-emerald-500/20 bg-emerald-500/5")}>
                <CardContent className="p-3 text-center">
                  <p className="text-sm font-bold text-foreground">{m.pts}</p>
                  <p className="text-[10px] text-muted-foreground">{m.reward}</p>
                  {m.reached && <Badge className="mt-1 bg-emerald-500/10 text-emerald-500 border-0 text-[8px]">Unlocked</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Compliance Disclaimer — Premium */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/30 bg-muted/20">
            <CardContent className="p-4">
              <h4 className="font-bold text-xs mb-1.5 flex items-center gap-2 text-muted-foreground">
                <Info className="w-3.5 h-3.5" />
                Important Information
              </h4>
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                {POINTS_COMPLIANCE.fullDisclaimer}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
}
