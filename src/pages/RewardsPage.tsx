/**
 * ZIVO REWARDS PAGE — Premium 2026
 * Central hub for ZIVO Points loyalty program
 */

import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Gift, Users, Trophy, Info, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-2xl border-b border-border/30">
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
          <PointsBalanceCard 
            balance={points.points_balance}
            lifetimePoints={points.lifetime_points}
            tier={mapTier(points.tier)}
          />
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
              <TierProgressCard 
                lifetimePoints={points.lifetime_points}
                currentTier={mapTier(points.tier)}
              />
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
        
        {/* Compliance Disclaimer — Premium */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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
