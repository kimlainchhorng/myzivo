import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  Shield,
  Power,
  Calendar,
  Users,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduledMaintenance {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "in-progress" | "completed";
  affectedServices: string[];
}

const scheduledMaintenance: ScheduledMaintenance[] = [
  {
    id: "1",
    title: "Database Migration",
    description: "Upgrading database infrastructure for improved performance",
    startTime: "2024-02-01 02:00 UTC",
    endTime: "2024-02-01 04:00 UTC",
    status: "scheduled",
    affectedServices: ["Rides", "Food Delivery", "Payments"]
  },
  {
    id: "2",
    title: "Security Patch Deployment",
    description: "Applying critical security updates across all services",
    startTime: "2024-01-28 03:00 UTC",
    endTime: "2024-01-28 03:30 UTC",
    status: "scheduled",
    affectedServices: ["Authentication", "API Gateway"]
  }
];

const getStatusBadge = (status: ScheduledMaintenance["status"]) => {
  switch (status) {
    case "scheduled":
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Scheduled</Badge>;
    case "in-progress":
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">In Progress</Badge>;
    case "completed":
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
  }
};

const AdminMaintenanceMode = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "We're currently performing scheduled maintenance. We'll be back shortly!"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Maintenance Mode
          </h2>
          <p className="text-muted-foreground">Manage platform maintenance windows</p>
        </div>
      </div>

      <Card className={cn(
        "border-2 transition-all",
        isMaintenanceMode 
          ? "border-amber-500/50 bg-amber-500/5" 
          : "border-border/50 bg-card/50"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                isMaintenanceMode ? "bg-amber-500/20" : "bg-muted/30"
              )}>
                <Power className={cn(
                  "h-7 w-7 transition-colors",
                  isMaintenanceMode ? "text-amber-500" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {isMaintenanceMode ? "Maintenance Mode Active" : "System Online"}
                </h3>
                <p className="text-muted-foreground">
                  {isMaintenanceMode 
                    ? "Users are seeing the maintenance page" 
                    : "All services are running normally"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isMaintenanceMode ? "destructive" : "default"} className="text-lg px-4 py-1">
                {isMaintenanceMode ? "OFFLINE" : "ONLINE"}
              </Badge>
              <Switch
                checked={isMaintenanceMode}
                onCheckedChange={setIsMaintenanceMode}
              />
            </div>
          </div>
          
          {isMaintenanceMode && (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-500">Warning: Maintenance mode is enabled</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All users except admins are blocked from accessing the platform. 
                Make sure to disable maintenance mode when work is complete.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Maintenance Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              className="min-h-[120px] bg-muted/30"
              placeholder="Message to display during maintenance..."
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                This message will be shown to users when maintenance mode is active.
              </p>
              <Button variant="outline" size="sm">Preview</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Bypass IPs</span>
                <Badge variant="outline">3 configured</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                These IP addresses can access the platform during maintenance.
              </p>
              <div className="space-y-2">
                {["192.168.1.100", "10.0.0.50", "172.16.0.1"].map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <code className="text-sm">{ip}</code>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">Remove</Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add IP address..." className="bg-muted/30" />
              <Button>Add</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Scheduled Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledMaintenance.map((maintenance) => (
              <div 
                key={maintenance.id}
                className="p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{maintenance.title}</h4>
                      {getStatusBadge(maintenance.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{maintenance.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {maintenance.startTime} - {maintenance.endTime.split(' ')[1]} {maintenance.endTime.split(' ')[2]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Affects: {maintenance.affectedServices.join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm" className="text-red-500">Cancel</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 gap-2">
            <Calendar className="h-4 w-4" />
            Schedule New Maintenance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMaintenanceMode;
