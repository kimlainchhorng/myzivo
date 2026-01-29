import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Car, 
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Camera,
  FileText,
  Calendar,
  Wrench,
  Eye,
  Filter,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const inspections: Inspection[] = [
  {
    id: "1",
    vehiclePlate: "ABC-1234",
    vehicleModel: "Toyota Camry 2023",
    driverName: "John Smith",
    inspectionType: "routine",
    status: "passed",
    date: "2024-01-28",
    inspector: "Mike Johnson",
    issues: [],
    score: 95,
  },
  {
    id: "2",
    vehiclePlate: "XYZ-5678",
    vehicleModel: "Honda Accord 2022",
    driverName: "Sarah Davis",
    inspectionType: "pre-trip",
    status: "pending",
    date: "2024-01-29",
    inspector: "Pending Assignment",
    issues: [],
    score: 0,
  },
  {
    id: "3",
    vehiclePlate: "DEF-9012",
    vehicleModel: "Ford Escape 2021",
    driverName: "Mike Williams",
    inspectionType: "post-incident",
    status: "failed",
    date: "2024-01-27",
    inspector: "Tom Anderson",
    issues: ["Brake wear exceeds limit", "Right headlight dim"],
    score: 62,
  },
  {
    id: "4",
    vehiclePlate: "GHI-3456",
    vehicleModel: "Chevrolet Malibu 2023",
    driverName: "Emily Chen",
    inspectionType: "annual",
    status: "scheduled",
    date: "2024-02-15",
    inspector: "Pending Assignment",
    issues: [],
    score: 0,
  },
  {
    id: "5",
    vehiclePlate: "JKL-7890",
    vehicleModel: "Nissan Altima 2022",
    driverName: "James Wilson",
    inspectionType: "routine",
    status: "passed",
    date: "2024-01-26",
    inspector: "Mike Johnson",
    issues: [],
    score: 88,
  },
];

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

const AdminVehicleInspections = () => {
  const stats = {
    passed: inspections.filter(i => i.status === "passed").length,
    failed: inspections.filter(i => i.status === "failed").length,
    pending: inspections.filter(i => i.status === "pending").length,
    scheduled: inspections.filter(i => i.status === "scheduled").length,
  };

  const passRate = Math.round((stats.passed / (stats.passed + stats.failed)) * 100) || 0;

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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVehicleInspections;
