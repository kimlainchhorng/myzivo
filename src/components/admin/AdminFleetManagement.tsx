import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Car, 
  Wrench, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Fuel,
  MapPin,
  Battery,
  ThermometerSun,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Gauge,
  Calendar,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: "sedan" | "suv" | "luxury" | "electric";
  driverId: string;
  driverName: string;
  status: "active" | "maintenance" | "idle" | "offline";
  fuelLevel: number;
  mileage: number;
  lastService: string;
  nextService: string;
  location: string;
  healthScore: number;
}

const vehicles: Vehicle[] = [
  {
    id: "1",
    plateNumber: "ABC-1234",
    model: "Toyota Camry 2023",
    type: "sedan",
    driverId: "d1",
    driverName: "John Smith",
    status: "active",
    fuelLevel: 78,
    mileage: 45200,
    lastService: "2024-01-15",
    nextService: "2024-04-15",
    location: "Downtown Manhattan",
    healthScore: 92,
  },
  {
    id: "2",
    plateNumber: "XYZ-5678",
    model: "Tesla Model 3",
    type: "electric",
    driverId: "d2",
    driverName: "Sarah Johnson",
    status: "active",
    fuelLevel: 65,
    mileage: 28500,
    lastService: "2024-01-20",
    nextService: "2024-07-20",
    location: "Brooklyn Heights",
    healthScore: 98,
  },
  {
    id: "3",
    plateNumber: "DEF-9012",
    model: "Honda CR-V 2022",
    type: "suv",
    driverId: "d3",
    driverName: "Mike Williams",
    status: "maintenance",
    fuelLevel: 45,
    mileage: 62000,
    lastService: "2024-01-28",
    nextService: "2024-01-30",
    location: "Service Center",
    healthScore: 68,
  },
  {
    id: "4",
    plateNumber: "GHI-3456",
    model: "Mercedes E-Class",
    type: "luxury",
    driverId: "d4",
    driverName: "Emily Davis",
    status: "idle",
    fuelLevel: 92,
    mileage: 35800,
    lastService: "2024-01-10",
    nextService: "2024-04-10",
    location: "JFK Airport",
    healthScore: 88,
  },
  {
    id: "5",
    plateNumber: "JKL-7890",
    model: "Chevrolet Bolt EV",
    type: "electric",
    driverId: "",
    driverName: "Unassigned",
    status: "offline",
    fuelLevel: 20,
    mileage: 18200,
    lastService: "2023-12-20",
    nextService: "2024-03-20",
    location: "Depot",
    healthScore: 75,
  },
];

const statusConfig = {
  active: { color: "text-green-500", bg: "bg-green-500/10", label: "Active" },
  maintenance: { color: "text-amber-500", bg: "bg-amber-500/10", label: "Maintenance" },
  idle: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Idle" },
  offline: { color: "text-slate-500", bg: "bg-slate-500/10", label: "Offline" },
};

const typeConfig = {
  sedan: { icon: Car, label: "Sedan" },
  suv: { icon: Car, label: "SUV" },
  luxury: { icon: Car, label: "Luxury" },
  electric: { icon: Battery, label: "Electric" },
};

const AdminFleetManagement = () => {
  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === "active").length,
    maintenance: vehicles.filter(v => v.status === "maintenance").length,
    avgHealth: Math.round(vehicles.reduce((sum, v) => sum + v.healthScore, 0) / vehicles.length),
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Car className="h-5 w-5 text-white" />
            </div>
            Fleet Management
          </h2>
          <p className="text-muted-foreground mt-1">Monitor and manage all platform vehicles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200" style={{ animationDelay: "50ms" }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Wrench className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.maintenance}</p>
                <p className="text-xs text-muted-foreground">In Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200" style={{ animationDelay: "150ms" }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgHealth}%</p>
                <p className="text-xs text-muted-foreground">Avg Health Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by plate, model, or driver..." className="pl-10 bg-card/50" />
      </div>

      {/* Vehicle Grid */}
      <div className="grid gap-4">
        {vehicles.map((vehicle, index) => {
          const status = statusConfig[vehicle.status];
          const type = typeConfig[vehicle.type];
          const TypeIcon = type.icon;

          return (
            <Card 
              key={vehicle.id}
              className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Vehicle Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                      vehicle.type === "electric" ? "bg-green-500/10" : "bg-muted/50"
                    )}>
                      <TypeIcon className={cn(
                        "h-7 w-7",
                        vehicle.type === "electric" ? "text-green-500" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{vehicle.plateNumber}</h3>
                        <Badge variant="outline" className="text-xs">{type.label}</Badge>
                        <Badge className={cn("text-xs", status.bg, status.color)}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{vehicle.model}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {vehicle.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="h-3 w-3" />
                          {vehicle.mileage.toLocaleString()} mi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Driver */}
                  <div className="lg:w-32 shrink-0">
                    <p className="text-xs text-muted-foreground mb-1">Driver</p>
                    <p className={cn(
                      "text-sm font-medium",
                      !vehicle.driverId && "text-muted-foreground italic"
                    )}>
                      {vehicle.driverName}
                    </p>
                  </div>

                  {/* Fuel/Battery */}
                  <div className="lg:w-28 shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {vehicle.type === "electric" ? "Battery" : "Fuel"}
                      </span>
                      <span className="text-xs font-medium">{vehicle.fuelLevel}%</span>
                    </div>
                    <Progress 
                      value={vehicle.fuelLevel} 
                      className={cn(
                        "h-2",
                        vehicle.fuelLevel < 30 && "[&>div]:bg-red-500"
                      )}
                    />
                  </div>

                  {/* Health Score */}
                  <div className="lg:w-28 shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Health</span>
                      <span className={cn(
                        "text-xs font-medium",
                        vehicle.healthScore >= 85 ? "text-green-500" :
                        vehicle.healthScore >= 70 ? "text-amber-500" :
                        "text-red-500"
                      )}>
                        {vehicle.healthScore}%
                      </span>
                    </div>
                    <Progress 
                      value={vehicle.healthScore} 
                      className={cn(
                        "h-2",
                        vehicle.healthScore >= 85 ? "[&>div]:bg-green-500" :
                        vehicle.healthScore >= 70 ? "[&>div]:bg-amber-500" :
                        "[&>div]:bg-red-500"
                      )}
                    />
                  </div>

                  {/* Service Info */}
                  <div className="lg:w-32 shrink-0">
                    <p className="text-xs text-muted-foreground mb-1">Next Service</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(vehicle.nextService).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Service</DropdownMenuItem>
                      <DropdownMenuItem>Assign Driver</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove Vehicle</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminFleetManagement;
