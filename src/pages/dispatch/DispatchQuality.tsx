/**
 * DispatchQuality Page
 * Quality metrics dashboard for dispatch panel
 */

import { useCallback } from "react";
import { toast } from "sonner";
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

      {/* KPI Cards */}
      <QualityKPICards kpis={kpis} isLoading={kpisLoading} />

      {/* Charts */}
      <QualityCharts distribution={distribution} isLoading={distributionLoading} />

      {/* Worst Performers */}
      <WorstPerformers performers={performers} isLoading={performersLoading} />

      {/* Recent Low Ratings */}
      <RecentLowRatings ratings={lowRatings} isLoading={lowRatingsLoading} />
    </div>
  );
};

export default DispatchQuality;
