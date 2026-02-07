/**
 * DispatchAnalytics - Analytics & Reporting Dashboard
 */

import { useState, useCallback } from "react";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAnalyticsKPIs,
  useDailyMetrics,
  useTopDrivers,
  useTopMerchants,
  useOrderStatusBreakdown,
  useAnalyticsRealtime,
  type DateRange,
} from "@/hooks/useDispatchAnalytics";
import AnalyticsFilters from "@/components/dispatch/AnalyticsFilters";
import AnalyticsKPICards from "@/components/dispatch/AnalyticsKPICards";
import AnalyticsCharts from "@/components/dispatch/AnalyticsCharts";
import AnalyticsTopLists from "@/components/dispatch/AnalyticsTopLists";
import AnalyticsExport from "@/components/dispatch/AnalyticsExport";

const DispatchAnalytics = () => {
  const queryClient = useQueryClient();
  
  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfDay(subDays(new Date(), 6)),
    end: endOfDay(new Date()),
  });

  // Data hooks
  const { data: kpis, isLoading: isLoadingKPIs } = useAnalyticsKPIs(dateRange);
  const { data: dailyMetrics, isLoading: isLoadingDaily } = useDailyMetrics(dateRange);
  const { data: topDrivers, isLoading: isLoadingDrivers } = useTopDrivers(dateRange);
  const { data: topMerchants, isLoading: isLoadingMerchants } = useTopMerchants(dateRange);
  const { data: statusBreakdown, isLoading: isLoadingStatus } = useOrderStatusBreakdown(dateRange);

  // Real-time updates
  const handleRealtimeUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["dispatch-analytics-kpis"] });
  }, [queryClient]);

  useAnalyticsRealtime(handleRealtimeUpdate);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dispatch-analytics-kpis"] });
    queryClient.invalidateQueries({ queryKey: ["dispatch-analytics-daily"] });
    queryClient.invalidateQueries({ queryKey: ["dispatch-analytics-top-drivers"] });
    queryClient.invalidateQueries({ queryKey: ["dispatch-analytics-top-merchants"] });
    queryClient.invalidateQueries({ queryKey: ["dispatch-analytics-status"] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            Business performance metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <AnalyticsExport
            dateRange={dateRange}
            dailyMetrics={dailyMetrics}
            topDrivers={topDrivers}
            topMerchants={topMerchants}
          />
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters dateRange={dateRange} onDateRangeChange={setDateRange} />

      {/* KPI Cards */}
      <AnalyticsKPICards kpis={kpis} isLoading={isLoadingKPIs} />

      {/* Charts */}
      <AnalyticsCharts
        dailyMetrics={dailyMetrics}
        statusBreakdown={statusBreakdown}
        isLoading={isLoadingDaily || isLoadingStatus}
      />

      {/* Top Lists */}
      <AnalyticsTopLists
        topDrivers={topDrivers}
        topMerchants={topMerchants}
        isLoadingDrivers={isLoadingDrivers}
        isLoadingMerchants={isLoadingMerchants}
      />
    </div>
  );
};

export default DispatchAnalytics;
