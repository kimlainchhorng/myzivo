import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, Server, Map, Radio } from "lucide-react";
import LiveMetricsPanel from "./realtime/LiveMetricsPanel";
import ActivityStream from "./realtime/ActivityStream";
import ServiceHealthMonitor from "./realtime/ServiceHealthMonitor";
import LiveMapOverview from "./realtime/LiveMapOverview";

export default function AdminRealtimeDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Real-time Dashboard
            <Badge variant="outline" className="gap-1.5 text-emerald-500 border-emerald-500/30">
              <Radio className="h-3 w-3 animate-pulse" />
              Live
            </Badge>
          </h2>
          <p className="text-muted-foreground">Monitor platform activity and system health in real-time</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-teal-500/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">Live</p>
                <p className="text-xs text-muted-foreground">Metrics Streaming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">~50</p>
                <p className="text-xs text-muted-foreground">Events/min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Server className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">6/6</p>
                <p className="text-xs text-muted-foreground">Services Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Map className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-muted-foreground">Active Entities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="metrics" className="gap-2">
            <Zap className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-2">
            <Server className="h-4 w-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <Map className="h-4 w-4" />
            Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-6">
          <LiveMetricsPanel />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityStream />
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <ServiceHealthMonitor />
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <LiveMapOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
