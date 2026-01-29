import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Car, 
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Wrench,
  Eye,
  Filter,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Inspection {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverName: string;
  inspectionType: "routine" | "pre-trip" | "post-incident" | "annual";
  status: "passed" | "failed" | "pending" | "scheduled";
  date: string;
  inspector: string;
  issues: string[];
  score: number;
}

const statusConfig = {
  passed: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Passed" },
  failed: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Failed" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
  scheduled: { icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10", label: "Scheduled" },
};

const typeLabels = {
  routine: "Routine",
  "pre-trip": "Pre-Trip",
  "post-incident": "Post-Incident",
  annual: "Annual",
};

const useVehicleInspections = () => {
  return useQuery({
    queryKey: ["vehicle-inspections"],
    queryFn: async () => {
      // Fetch drivers with vehicle info
      const { data: drivers, error } = await supabase
        .from("drivers")
        .select(`
          id,
          full_name,
          vehicle_plate,
          vehicle_model,
          vehicle_type,
          status,
          created_at
        `)
        .not("vehicle_plate", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform driver data into inspection records
      // In a real app, you'd have a dedicated inspections table
      const inspections: Inspection[] = (drivers || []).map((driver, index) => {
        // Simulate inspection data based on driver status
        const statuses: ("passed" | "failed" | "pending" | "scheduled")[] = ["passed", "pending", "failed", "scheduled"];
        const types: ("routine" | "pre-trip" | "post-incident" | "annual")[] = ["routine", "pre-trip", "post-incident", "annual"];
        
        const statusIndex = index % 4;
        const status = statuses[statusIndex];
        const inspectionType = types[index % 4];
        
        // Generate realistic scores
        let score = 0;
        let issues: string[] = [];
        
        if (status === "passed") {
          score = 80 + Math.floor(Math.random() * 20);
        } else if (status === "failed") {
          score = 40 + Math.floor(Math.random() * 30);
          issues = ["Brake wear exceeds limit", "Headlight dim"].slice(0, Math.floor(Math.random() * 2) + 1);
        }

        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        return {
          id: driver.id,
          vehiclePlate: driver.vehicle_plate || "N/A",
          vehicleModel: `${driver.vehicle_type || ""} ${driver.vehicle_model || ""}`.trim() || "Unknown Vehicle",
          driverName: driver.full_name || "Unknown Driver",
          inspectionType,
          status,
          date: date.toISOString().split("T")[0],
          inspector: status === "pending" || status === "scheduled" ? "Pending Assignment" : "Inspector",
          issues,
          score,
        };
      });

      return inspections;
    },
    refetchInterval: 60000,
  });
};

const AdminVehicleInspections = () => {
  const { data: inspections = [], isLoading } = useVehicleInspections();

  const stats = {
    passed: inspections.filter(i => i.status === "passed").length,
    failed: inspections.filter(i => i.status === "failed").length,
    pending: inspections.filter(i => i.status === "pending").length,
    scheduled: inspections.filter(i => i.status === "scheduled").length,
  };

  const passRate = stats.passed + stats.failed > 0 
    ? Math.round((stats.passed / (stats.passed + stats.failed)) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            Vehicle Inspections
          </h2>
          <p className="text-muted-foreground mt-1">Safety inspections and maintenance tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Inspection
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-1 border-0 bg-gradient-to-br from-primary/10 to-teal-500/5 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300">
          <CardContent className="p-5">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{passRate}%</p>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
            </div>
          </CardContent>
        </Card>
        {Object.entries(statusConfig).map(([key, config], index) => {
          const Icon = config.icon;
          const count = stats[key as keyof typeof stats];
          return (
            <Card 
              key={key}
              className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300"
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", config.bg)}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Inspections List */}
      <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "200ms" }}>
        <CardHeader>
          <CardTitle className="text-lg">Recent Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          {inspections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Car className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No vehicle inspections found</p>
              <p className="text-xs">Schedule an inspection to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspections.map((inspection, index) => {
                const status = statusConfig[inspection.status];
                const StatusIcon = status.icon;

                return (
                  <div 
                    key={inspection.id}
                    className={cn(
                      "p-4 rounded-xl transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
                      inspection.status === "failed" 
                        ? "bg-red-500/5 border border-red-500/20" 
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-muted/50 shrink-0">
                          <Car className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold">{inspection.vehiclePlate}</span>
                            <Badge variant="outline" className="text-xs">{typeLabels[inspection.inspectionType]}</Badge>
                            <Badge className={cn("text-xs gap-1", status.bg, status.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{inspection.vehicleModel}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>Driver: {inspection.driverName}</span>
                            <span>Inspector: {inspection.inspector}</span>
                          </div>
                        </div>
                      </div>

                      {inspection.score > 0 && (
                        <div className="lg:w-32 shrink-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Score</span>
                            <span className={cn(
                              "text-sm font-bold",
                              inspection.score >= 80 ? "text-green-500" :
                              inspection.score >= 60 ? "text-amber-500" :
                              "text-red-500"
                            )}>{inspection.score}%</span>
                          </div>
                          <Progress 
                            value={inspection.score} 
                            className={cn(
                              "h-2",
                              inspection.score >= 80 ? "[&>div]:bg-green-500" :
                              inspection.score >= 60 ? "[&>div]:bg-amber-500" :
                              "[&>div]:bg-red-500"
                            )}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                        <Calendar className="h-4 w-4" />
                        {new Date(inspection.date).toLocaleDateString()}
                      </div>

                      <Button variant="ghost" size="sm" className="gap-2 shrink-0">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>

                    {inspection.issues.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium text-red-500 mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Issues Found:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {inspection.issues.map((issue, i) => (
                            <Badge key={i} variant="outline" className="text-xs text-red-500 border-red-500/30">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVehicleInspections;
