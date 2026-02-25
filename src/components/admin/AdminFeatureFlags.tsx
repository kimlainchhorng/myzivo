import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Flag, 
  Plus,
  ToggleLeft,
  ToggleRight,
  Users,
  Percent,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetAudience: string;
  environment: "production" | "staging" | "development";
  lastModified: string;
  modifiedBy: string;
  status: "stable" | "testing" | "deprecated";
}

const featureFlags: FeatureFlag[] = [
  {
    id: "1",
    name: "New Checkout Flow",
    key: "new_checkout_v2",
    description: "Redesigned checkout experience with one-click payments",
    enabled: true,
    rolloutPercentage: 75,
    targetAudience: "All Users",
    environment: "production",
    lastModified: "2024-01-28",
    modifiedBy: "Sarah Admin",
    status: "testing",
  },
  {
    id: "2",
    name: "AI Trip Suggestions",
    key: "ai_suggestions",
    description: "ML-powered destination recommendations based on history",
    enabled: true,
    rolloutPercentage: 25,
    targetAudience: "Premium Users",
    environment: "production",
    lastModified: "2024-01-25",
    modifiedBy: "John Dev",
    status: "testing",
  },
  {
    id: "3",
    name: "Dark Mode",
    key: "dark_mode",
    description: "System-wide dark theme support",
    enabled: true,
    rolloutPercentage: 100,
    targetAudience: "All Users",
    environment: "production",
    lastModified: "2024-01-20",
    modifiedBy: "Mike Designer",
    status: "stable",
  },
  {
    id: "4",
    name: "Voice Commands",
    key: "voice_commands",
    description: "Voice-activated controls in driver app",
    enabled: false,
    rolloutPercentage: 0,
    targetAudience: "Drivers",
    environment: "staging",
    lastModified: "2024-01-15",
    modifiedBy: "Emily Dev",
    status: "testing",
  },
  {
    id: "5",
    name: "Legacy API v1",
    key: "api_v1_support",
    description: "Backward compatibility for v1 API endpoints",
    enabled: true,
    rolloutPercentage: 100,
    targetAudience: "API Partners",
    environment: "production",
    lastModified: "2023-12-01",
    modifiedBy: "System",
    status: "deprecated",
  },
];

const envConfig = {
  production: { color: "text-green-500", bg: "bg-green-500/10" },
  staging: { color: "text-amber-500", bg: "bg-amber-500/10" },
  development: { color: "text-blue-500", bg: "bg-blue-500/10" },
};

const statusConfig = {
  stable: { color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 },
  testing: { color: "text-amber-500", bg: "bg-amber-500/10", icon: Eye },
  deprecated: { color: "text-red-500", bg: "bg-red-500/10", icon: AlertTriangle },
};

const AdminFeatureFlags = () => {
  const [flags, setFlags] = useState(featureFlags);

  const toggleFlag = (id: string) => {
    setFlags(prev => 
      prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f)
    );
  };

  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
              <Flag className="h-5 w-5 text-white" />
            </div>
            Feature Flags
          </h2>
          <p className="text-muted-foreground mt-1">Control feature rollouts and A/B tests</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Flag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Flag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{flags.length}</p>
                <p className="text-xs text-muted-foreground">Total Flags</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <ToggleRight className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enabledCount}</p>
                <p className="text-xs text-muted-foreground">Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Eye className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{flags.filter(f => f.status === "testing").length}</p>
                <p className="text-xs text-muted-foreground">Testing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{flags.filter(f => f.status === "deprecated").length}</p>
                <p className="text-xs text-muted-foreground">Deprecated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flags List */}
      <div className="grid gap-4">
        {flags.map((flag, index) => {
          const env = envConfig[flag.environment];
          const status = statusConfig[flag.status];
          const StatusIcon = status.icon;

          return (
            <Card 
              key={flag.id}
              className={cn(
                "border-0 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200",
                !flag.enabled && "opacity-60"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Switch 
                      checked={flag.enabled}
                      onCheckedChange={() => toggleFlag(flag.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{flag.name}</h3>
                        <Badge className={cn("text-[10px] h-4 capitalize", env.bg, env.color)}>
                          {flag.environment}
                        </Badge>
                        <Badge className={cn("text-[10px] h-4 gap-0.5 capitalize", status.bg, status.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {flag.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mb-2">{flag.key}</p>
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        {flag.rolloutPercentage}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Rollout</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {flag.targetAudience}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Audience</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(flag.lastModified).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Modified</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Flag</DropdownMenuItem>
                        <DropdownMenuItem>View Analytics</DropdownMenuItem>
                        <DropdownMenuItem>Copy Key</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminFeatureFlags;
