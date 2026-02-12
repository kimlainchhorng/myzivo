/**
 * DispatchQuality Page
 * Quality metrics dashboard for dispatch panel
 */

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QualityKPICards from "@/components/dispatch/QualityKPICards";
import QualityCharts from "@/components/dispatch/QualityCharts";
import WorstPerformers from "@/components/dispatch/WorstPerformers";
import RecentLowRatings from "@/components/dispatch/RecentLowRatings";
import {
  useQualityKPIs,
  useWorstPerformers,
  useLowRatings,
  useRatingDistribution,
  useQualityRealtime,
} from "@/hooks/useQualityMetrics";

const DispatchQuality = () => {
  const { data: kpis, isLoading: kpisLoading } = useQualityKPIs();
  const { data: performers, isLoading: performersLoading } = useWorstPerformers();
  const { data: lowRatings, isLoading: lowRatingsLoading } = useLowRatings();
  const { data: distribution, isLoading: distributionLoading } = useRatingDistribution();

  const handleNewRating = useCallback(() => {
    toast.info("New rating received", {
      description: "Dashboard data has been refreshed",
    });
  }, []);

  // Subscribe to real-time updates
  useQualityRealtime(handleNewRating);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quality Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor customer ratings and feedback for drivers and merchants
        </p>
      </div>

      <Tabs defaultValue="food" className="w-full">
        <TabsList>
          <TabsTrigger value="food">Food Delivery</TabsTrigger>
          <TabsTrigger value="rides">Rides</TabsTrigger>
        </TabsList>

        <TabsContent value="food" className="space-y-6 mt-4">
          {/* KPI Cards */}
          <QualityKPICards kpis={kpis} isLoading={kpisLoading} />

          {/* Charts */}
          <QualityCharts distribution={distribution} isLoading={distributionLoading} />

          {/* Worst Performers */}
          <WorstPerformers performers={performers} isLoading={performersLoading} />

          {/* Recent Low Ratings */}
          <RecentLowRatings ratings={lowRatings} isLoading={lowRatingsLoading} />
        </TabsContent>

        <TabsContent value="rides" className="space-y-6 mt-4">
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">Ride Ratings</p>
            <p className="text-sm mt-1">Ride quality metrics from the trips table will appear here as ratings accumulate.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DispatchQuality;
