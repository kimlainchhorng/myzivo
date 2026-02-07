/**
 * AnalyticsExport - CSV export buttons and logic
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import type { DateRange, DailyMetrics, DriverStats, MerchantStats } from "@/hooks/useDispatchAnalytics";

interface AnalyticsExportProps {
  dateRange: DateRange;
  dailyMetrics?: DailyMetrics[];
  topDrivers?: DriverStats[];
  topMerchants?: MerchantStats[];
}

const downloadCSV = (data: string, filename: string) => {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const AnalyticsExport = ({
  dateRange,
  dailyMetrics,
  topDrivers,
  topMerchants,
}: AnalyticsExportProps) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const startStr = format(dateRange.start, "yyyy-MM-dd");
  const endStr = format(dateRange.end, "yyyy-MM-dd");

  const exportOrders = async () => {
    setIsExporting("orders");
    try {
      const { data: orders, error } = await supabase
        .from("food_orders")
        .select(`
          id,
          status,
          total_amount,
          subtotal,
          delivery_fee,
          platform_fee,
          payment_status,
          delivery_address,
          created_at,
          delivered_at,
          restaurants:restaurant_id (name),
          drivers:driver_id (full_name)
        `)
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const headers = [
        "Order ID",
        "Status",
        "Restaurant",
        "Driver",
        "Total Amount",
        "Subtotal",
        "Delivery Fee",
        "Platform Fee",
        "Payment Status",
        "Delivery Address",
        "Created At",
        "Delivered At",
      ];

      const rows = (orders || []).map((o) => [
        o.id,
        o.status,
        (o.restaurants as any)?.name || "",
        (o.drivers as any)?.full_name || "",
        o.total_amount?.toFixed(2) || "0.00",
        o.subtotal?.toFixed(2) || "0.00",
        o.delivery_fee?.toFixed(2) || "0.00",
        o.platform_fee?.toFixed(2) || "0.00",
        o.payment_status || "",
        `"${(o.delivery_address || "").replace(/"/g, '""')}"`,
        format(new Date(o.created_at), "yyyy-MM-dd HH:mm:ss"),
        o.delivered_at ? format(new Date(o.delivered_at), "yyyy-MM-dd HH:mm:ss") : "",
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      downloadCSV(csv, `orders-${startStr}-${endStr}.csv`);
      toast.success("Orders exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export orders");
    } finally {
      setIsExporting(null);
    }
  };

  const exportRevenue = () => {
    if (!dailyMetrics || dailyMetrics.length === 0) {
      toast.error("No revenue data to export");
      return;
    }

    const headers = ["Date", "Orders", "Delivered", "Cancelled", "Revenue", "Platform Profit"];
    const rows = dailyMetrics.map((d) => [
      d.date,
      d.orders,
      d.delivered,
      d.cancelled,
      d.revenue.toFixed(2),
      d.profit.toFixed(2),
    ]);

    // Add totals row
    const totals = dailyMetrics.reduce(
      (acc, d) => ({
        orders: acc.orders + d.orders,
        delivered: acc.delivered + d.delivered,
        cancelled: acc.cancelled + d.cancelled,
        revenue: acc.revenue + d.revenue,
        profit: acc.profit + d.profit,
      }),
      { orders: 0, delivered: 0, cancelled: 0, revenue: 0, profit: 0 }
    );

    rows.push([
      "TOTAL",
      totals.orders.toString(),
      totals.delivered.toString(),
      totals.cancelled.toString(),
      totals.revenue.toFixed(2),
      totals.profit.toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(csv, `revenue-summary-${startStr}-${endStr}.csv`);
    toast.success("Revenue summary exported");
  };

  const exportDriverEarnings = () => {
    if (!topDrivers || topDrivers.length === 0) {
      toast.error("No driver earnings data to export");
      return;
    }

    const headers = ["Rank", "Driver Name", "Total Orders", "Total Earnings"];
    const rows = topDrivers.map((d, i) => [
      i + 1,
      d.driverName,
      d.totalOrders,
      d.totalEarnings.toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(csv, `driver-earnings-${startStr}-${endStr}.csv`);
    toast.success("Driver earnings exported");
  };

  const exportMerchantRevenue = () => {
    if (!topMerchants || topMerchants.length === 0) {
      toast.error("No merchant revenue data to export");
      return;
    }

    const headers = ["Rank", "Restaurant Name", "Total Orders", "Total Revenue"];
    const rows = topMerchants.map((m, i) => [
      i + 1,
      `"${m.merchantName.replace(/"/g, '""')}"`,
      m.totalOrders,
      m.totalRevenue.toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(csv, `merchant-revenue-${startStr}-${endStr}.csv`);
    toast.success("Merchant revenue exported");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting !== null}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export CSV
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportOrders}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Orders Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportRevenue}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Revenue Summary
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportDriverEarnings}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Driver Earnings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportMerchantRevenue}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Merchant Revenue
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AnalyticsExport;
