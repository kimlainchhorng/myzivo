import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Download, Calendar as CalendarIcon, BarChart3, Users, 
  Car, DollarSign, TrendingUp, Clock, FileSpreadsheet, FileDown,
  RefreshCw, CheckCircle, AlertCircle, Utensils, Plane, Building2, CalendarDays
} from "lucide-react";
import ScheduledReports from "./reports/ScheduledReports";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  fields: string[];
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "revenue-summary",
    name: "Revenue Summary",
    description: "Complete revenue breakdown by service and period",
    icon: DollarSign,
    category: "finance",
    fields: ["trips", "food_orders", "car_rentals", "flights", "hotels"],
  },
  {
    id: "driver-performance",
    name: "Driver Performance",
    description: "Driver ratings, trip counts, and earnings",
    icon: Car,
    category: "operations",
    fields: ["drivers", "trips", "ratings"],
  },
  {
    id: "user-growth",
    name: "User Growth Report",
    description: "New user signups and retention metrics",
    icon: Users,
    category: "analytics",
    fields: ["profiles", "user_roles"],
  },
  {
    id: "trip-analytics",
    name: "Trip Analytics",
    description: "Detailed trip statistics and patterns",
    icon: TrendingUp,
    category: "operations",
    fields: ["trips"],
  },
  {
    id: "restaurant-report",
    name: "Restaurant Performance",
    description: "Restaurant orders, ratings, and revenue",
    icon: Utensils,
    category: "services",
    fields: ["restaurants", "food_orders"],
  },
  {
    id: "payout-summary",
    name: "Payout Summary",
    description: "All payouts to drivers and partners",
    icon: FileSpreadsheet,
    category: "finance",
    fields: ["payouts", "transactions"],
  },
];

const AdminReports = () => {
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<{ id: string; name: string; date: Date; status: string }[]>([]);

  const { data: reportStats } = useQuery({
    queryKey: ["admin-report-stats"],
    queryFn: async () => {
      const [tripsRes, ordersRes, driversRes, usersRes] = await Promise.all([
        supabase.from("trips").select("id", { count: "exact", head: true }),
        supabase.from("food_orders").select("id", { count: "exact", head: true }),
        supabase.from("drivers").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      return {
        totalTrips: tripsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalDrivers: driversRes.count || 0,
        totalUsers: usersRes.count || 0,
      };
    },
  });

  const generateCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("CSV downloaded successfully!");
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast.error("Please select a report template");
      return;
    }

    setIsGenerating(true);
    
    try {
      let reportData: any[] = [];
      
      // Fetch real data based on report type
      switch (selectedReport.id) {
        case "revenue-summary": {
          const { data: trips } = await supabase
            .from("trips")
            .select("id, fare_amount, status, created_at")
            .gte("created_at", dateRange.from?.toISOString() || "")
            .lte("created_at", dateRange.to?.toISOString() || "");
          
          const { data: orders } = await supabase
            .from("food_orders")
            .select("id, total_amount, status, created_at")
            .gte("created_at", dateRange.from?.toISOString() || "")
            .lte("created_at", dateRange.to?.toISOString() || "");
          
          reportData = [
            ...(trips || []).map((t: any) => ({ 
              type: "Ride", 
              id: t.id, 
              amount: t.fare_amount || 0, 
              status: t.status,
              date: t.created_at 
            })),
            ...(orders || []).map((o: any) => ({ 
              type: "Food Order", 
              id: o.id, 
              amount: o.total_amount || 0, 
              status: o.status,
              date: o.created_at 
            }))
          ];
          break;
        }
        case "driver-performance": {
          const { data: drivers } = await supabase
            .from("drivers")
            .select("id, full_name, rating, total_trips, vehicle_type, status");
          reportData = (drivers || []).map((d: any) => ({
            driver_id: d.id,
            name: d.full_name,
            rating: d.rating,
            total_trips: d.total_trips,
            vehicle_type: d.vehicle_type,
            status: d.status
          }));
          break;
        }
        case "user-growth": {
          const { data: users } = await supabase
            .from("profiles")
            .select("id, display_name, created_at")
            .gte("created_at", dateRange.from?.toISOString() || "")
            .lte("created_at", dateRange.to?.toISOString() || "");
          reportData = (users || []).map((u: any) => ({
            user_id: u.id,
            name: u.display_name || "N/A",
            joined: u.created_at
          }));
          break;
        }
        case "trip-analytics": {
          const { data: trips } = await supabase
            .from("trips")
            .select("id, pickup_address, dropoff_address, fare_amount, distance_km, duration_minutes, rating, status, created_at")
            .gte("created_at", dateRange.from?.toISOString() || "")
            .lte("created_at", dateRange.to?.toISOString() || "");
          reportData = (trips || []).map((t: any) => ({
            trip_id: t.id,
            pickup: t.pickup_address,
            dropoff: t.dropoff_address,
            fare: t.fare_amount,
            distance_km: t.distance_km,
            duration_min: t.duration_minutes,
            rating: t.rating,
            status: t.status,
            date: t.created_at
          }));
          break;
        }
        case "restaurant-report": {
          const { data: restaurants } = await supabase
            .from("restaurants")
            .select("id, name, cuisine_type, rating");
          reportData = (restaurants || []).map((r: any) => ({
            restaurant_id: r.id,
            name: r.name,
            cuisine: r.cuisine_type,
            rating: r.rating
          }));
          break;
        }
        case "payout-summary": {
          const { data: payouts } = await supabase
            .from("payouts")
            .select("id, amount, status, payout_method, created_at")
            .gte("created_at", dateRange.from?.toISOString() || "")
            .lte("created_at", dateRange.to?.toISOString() || "");
          reportData = (payouts || []).map((p: any) => ({
            payout_id: p.id,
            amount: p.amount,
            status: p.status,
            method: p.payout_method,
            date: p.created_at
          }));
          break;
        }
      }
      
      const newReport = {
        id: `report-${Date.now()}`,
        name: selectedReport.name,
        date: new Date(),
        status: "completed",
        data: reportData,
        recordCount: reportData.length,
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      toast.success(`Report generated with ${reportData.length} records!`);
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (report: any, format: "csv" | "pdf") => {
    if (format === "csv" && report.data) {
      generateCSV(report.data, report.name.replace(/\s+/g, "_").toLowerCase());
    } else {
      toast.success(`Downloading ${format.toUpperCase()} report...`);
    }
  };

  const categoryColors: Record<string, string> = {
    finance: "text-green-500 bg-green-500/10",
    operations: "text-blue-500 bg-blue-500/10",
    analytics: "text-purple-500 bg-purple-500/10",
    services: "text-amber-500 bg-amber-500/10",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
            <FileText className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reports & Exports</h1>
            <p className="text-muted-foreground">Generate and download platform reports</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Car className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Trips</p>
              <p className="text-lg font-semibold">{reportStats?.totalTrips?.toLocaleString() || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Utensils className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Food Orders</p>
              <p className="text-lg font-semibold">{reportStats?.totalOrders?.toLocaleString() || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/10">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-lg font-semibold">{reportStats?.totalUsers?.toLocaleString() || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Car className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Drivers</p>
              <p className="text-lg font-semibold">{reportStats?.totalDrivers?.toLocaleString() || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="bg-card/50">
          <TabsTrigger value="generate" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Scheduled Reports
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            Report History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Templates */}
            <div className="lg:col-span-2">
              <Card className="border-0 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Report Templates
                  </CardTitle>
                  <CardDescription>Select a report template to generate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportTemplates.map((template) => {
                      const Icon = template.icon;
                      const isSelected = selectedReport?.id === template.id;
                      return (
                        <button
                          key={template.id}
                          onClick={() => setSelectedReport(template)}
                          className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all",
                            isSelected 
                              ? "border-primary bg-primary/5" 
                              : "border-border/50 hover:border-border hover:bg-muted/30"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn("p-2 rounded-xl", categoryColors[template.category])}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{template.name}</p>
                                {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {template.description}
                              </p>
                              <Badge variant="outline" className="mt-2 capitalize text-xs">
                                {template.category}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Configuration Panel */}
            <div className="space-y-4">
              <Card className="border-0 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from && dateRange.to ? (
                            <>
                              {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                            </>
                          ) : (
                            "Select date range"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{ from: dateRange.from, to: dateRange.to }}
                          onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Export Format</label>
                    <Select defaultValue="csv">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="xlsx">Excel Workbook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full gap-2 mt-4" 
                    onClick={handleGenerateReport}
                    disabled={!selectedReport || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {selectedReport && (
                <Card className="border-0 bg-card/50 backdrop-blur-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Selected Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{selectedReport.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedReport.fields.map((field) => (
                          <Badge key={field} variant="secondary" className="text-xs capitalize">
                            {field.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Generated Reports
              </CardTitle>
              <CardDescription>Your recently generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No reports generated yet</p>
                  <p className="text-sm text-muted-foreground">Generate your first report above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedReports.map((report) => (
                    <div 
                      key={report.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Generated {format(report.date, "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/10 text-green-500 border-transparent">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {report.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(report, "csv")}
                          className="h-8 w-8"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(report, "pdf")}
                          className="h-8 w-8"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
