/**
 * DriverHomePage - Professional Driver Home Screen
 * iOS 2026 style dashboard with earnings hero, quick stats, quick actions
 * Ported from Zivo Driver Connect
 */
import { useState } from "react";
import DriverBottomNav from "@/components/driver/DriverBottomNav";
import DriverEarningsHero from "@/components/driver/DriverEarningsHero";
import DriverQuickStatsBar from "@/components/driver/DriverQuickStatsBar";
import DriverQuickActions from "@/components/driver/DriverQuickActions";
import { useDriverDashboardData } from "@/hooks/useDriverDashboardData";
import { Loader2 } from "lucide-react";

export default function DriverHomePage() {
  const [isOnline, setIsOnline] = useState(false);
  const { stats, isLoading } = useDriverDashboardData();

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* Quick Stats Bar */}
      <DriverQuickStatsBar
        trips={stats.todayDeliveries}
        earnings={stats.todayEarnings}
        hoursOnline={stats.hoursOnline}
        acceptanceRate={stats.acceptanceRate}
        tips={stats.todayTips}
      />

      <main className="flex-1 flex flex-col overflow-auto px-3 gap-1.5 mt-1 pb-24">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Earnings Hero */}
            <DriverEarningsHero
              isOnline={isOnline}
              todayEarnings={stats.todayEarnings}
              todayDeliveries={stats.todayDeliveries}
              hoursOnline={stats.hoursOnline}
              targetEarnings={stats.dailyGoal}
              rating={stats.rating}
              todayTips={stats.todayTips}
            />

            {/* Quick Actions */}
            <DriverQuickActions />
          </>
        )}
      </main>

      <DriverBottomNav isOnline={isOnline} />
    </div>
  );
}
