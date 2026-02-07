/**
 * Dispatch SLA Dashboard
 * SLA monitoring and performance analytics
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download, RefreshCw, Timer } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useSLAKPIs,
  useAtRiskOrders,
  useSLAByZone,
  useSLAByMerchant,
  useSLAByDriver,
  usePendingAdjustments,
  exportSLAMetricsCSV,
  DateRange,
} from "@/hooks/useSLAMetrics";
import SLAKPICards from "@/components/sla/SLAKPICards";
import AtRiskOrdersList from "@/components/sla/AtRiskOrdersList";
import SLAByZoneTable from "@/components/sla/SLAByZoneTable";
import SLAByMerchantTable from "@/components/sla/SLAByMerchantTable";
import SLAByDriverTable from "@/components/sla/SLAByDriverTable";
import PerformanceAdjustmentsPanel from "@/components/sla/PerformanceAdjustmentsPanel";
import AssignDriverModal from "@/components/dispatch/AssignDriverModal";
import { DispatchOrder } from "@/hooks/useDispatchOrders";

const DispatchSLA = () => {
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 7)),
    to: endOfDay(new Date()),
  });

  // Modal state for driver assignment
  const [assignModalOrder, setAssignModalOrder] = useState<DispatchOrder | null>(null);

  // Fetch all SLA data
  const { data: kpis, isLoading: kpisLoading, refetch: refetchKpis } = useSLAKPIs(dateRange);
  const { data: atRiskOrders, isLoading: atRiskLoading } = useAtRiskOrders();
  const { data: zoneData, isLoading: zoneLoading } = useSLAByZone(dateRange);
  const { data: merchantData, isLoading: merchantLoading } = useSLAByMerchant(dateRange);
  const { data: driverData, isLoading: driverLoading } = useSLAByDriver(dateRange);
  const { data: pendingAdj, isLoading: adjLoading } = usePendingAdjustments();

  const handleExport = () => {
    exportSLAMetricsCSV(
      { zone: zoneData, merchants: merchantData, drivers: driverData },
      dateRange
    );
  };

  const handleAssign = (orderId: string) => {
    // Create minimal order object for modal
    const order = atRiskOrders?.find((o) => o.id === orderId);
    if (order) {
      setAssignModalOrder({
        id: order.id,
        status: order.status as any,
        created_at: order.created_at,
        delivery_address: order.delivery_address,
        driver_id: order.driver_id,
      } as DispatchOrder);
    }
  };

  const handleRefresh = () => {
    refetchKpis();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Timer className="h-8 w-8" />
            SLA & Performance
          </h1>
          <p className="text-muted-foreground">
            Monitor delivery performance and SLA compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} -{" "}
                      {format(dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({
                      from: startOfDay(range.from),
                      to: endOfDay(range.to),
                    });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <SLAKPICards kpis={kpis} isLoading={kpisLoading} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* At Risk Orders - takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <AtRiskOrdersList
            orders={atRiskOrders}
            isLoading={atRiskLoading}
            onAssign={handleAssign}
          />
        </div>

        {/* Performance Adjustments */}
        <div>
          <PerformanceAdjustmentsPanel
            adjustments={pendingAdj}
            isLoading={adjLoading}
          />
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SLAByZoneTable zones={zoneData} isLoading={zoneLoading} />
        <SLAByMerchantTable merchants={merchantData} isLoading={merchantLoading} />
        <SLAByDriverTable drivers={driverData} isLoading={driverLoading} />
      </div>

      {/* Assign Driver Modal */}
      <AssignDriverModal
        order={assignModalOrder}
        open={!!assignModalOrder}
        onClose={() => setAssignModalOrder(null)}
      />
    </div>
  );
};

export default DispatchSLA;
