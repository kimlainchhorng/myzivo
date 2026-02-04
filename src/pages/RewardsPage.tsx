/**
 * ZIVO REWARDS PAGE
 * 
 * Central hub for ZIVO Points loyalty program
 * Shows balance, earning options, redemption, and tier progress
 */

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Gift, Users, Trophy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  const { user, isLoading: authLoading } = useAuth();
  const { points, isLoading } = useLoyaltyPoints();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Map old tier system to new
  const mapTier = (oldTier: string): ZivoTier => {
    if (oldTier === 'gold' || oldTier === 'silver') return 'elite';
    if (oldTier === 'bronze') return 'traveler';
    return 'explorer';
  };

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login?redirect=/rewards" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="ZIVO Points | Earn Rewards on Your Travels"
        description="Earn ZIVO Points on bookings and redeem for discounts, priority alerts, and exclusive deals. Start earning today!"
        canonical="https://hizivo.com/rewards"
      />
      
      <Header />
      
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                ZIVO Points
              </h1>
              <p className="text-muted-foreground text-sm">
                Earn rewards on every trip
              </p>
            </div>
          </div>
          
          {/* Balance Card */}
          <PointsBalanceCard 
            className="mb-6"
            balance={points.points_balance}
            lifetimePoints={points.lifetime_points}
            tier={mapTier(points.tier)}
          />
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="earn" className="gap-1.5">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Earn</span>
              </TabsTrigger>
              <TabsTrigger value="redeem" className="gap-1.5">
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Redeem</span>
              </TabsTrigger>
              <TabsTrigger value="refer" className="gap-1.5">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Refer</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <TierProgressCard 
                lifetimePoints={points.lifetime_points}
                currentTier={mapTier(points.tier)}
              />
              
              <PointsEarningList 
                completedActions={['account_creation']}
              />
            </TabsContent>
            
            {/* Earn Tab */}
            <TabsContent value="earn" className="space-y-6">
              <PointsEarningList 
                completedActions={['account_creation']}
              />
              
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Points are credited automatically after qualifying actions are completed.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            {/* Redeem Tab */}
            <TabsContent value="redeem">
              <RedemptionOptions 
                pointsBalance={points.points_balance}
              />
            </TabsContent>
            
            {/* Refer Tab */}
            <TabsContent value="refer">
              <ReferralCard 
                referralCode={user?.id?.slice(0, 8).toUpperCase() || "ZIVO-NEW"}
                referralCount={0}
              />
            </TabsContent>
          </Tabs>
          
          {/* Full Compliance Disclaimer */}
          <div className="mt-8 p-4 rounded-xl bg-muted/30 border">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              Important Information
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {POINTS_COMPLIANCE.fullDisclaimer}
            </p>
          </div>
        </div>
      </main>
      
      <MobileBottomNav />
      <Footer />
    </div>
  );
}
