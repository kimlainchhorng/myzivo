/**
 * Dispatch Demand Dashboard
 * AI-powered demand forecasting and driver positioning
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  MapPin,
  RefreshCw,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  useDemandForecasts,
  useDemandKPIs,
  useAtRiskZones,
  useRepositionRecommendations,
  useDemandHeatmap,
  useDismissRecommendation,
  useTriggerForecast,
} from "@/hooks/useDemandForecast";
import { formatDistanceToNow } from "date-fns";
import DemandHeatmap from "@/components/demand/DemandHeatmap";
import ForecastPanel from "@/components/demand/ForecastPanel";

const DispatchDemand = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: forecasts, isLoading: forecastsLoading, refetch: refetchForecasts } = useDemandForecasts(3);
  const { data: atRiskZones, isLoading: atRiskLoading } = useAtRiskZones();
  const { data: recommendations, isLoading: reposLoading } = useRepositionRecommendations();
  const { data: heatmapData, isLoading: heatmapLoading } = useDemandHeatmap(7);
  const kpis = useDemandKPIs();

  const dismissMutation = useDismissRecommendation();
  const triggerForecastMutation = useTriggerForecast();

  const isLoading = forecastsLoading || atRiskLoading || reposLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demand & Forecasting</h1>
          <p className="text-muted-foreground">
            AI-powered demand prediction and driver positioning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchForecasts()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => triggerForecastMutation.mutate()}
            disabled={triggerForecastMutation.isPending}
          >
            {triggerForecastMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Generate Forecasts
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zones At Risk</p>
                <p className="text-3xl font-bold text-destructive">{kpis.zonesAtRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Surge Predicted</p>
                <p className="text-3xl font-bold text-amber-500">{kpis.surgePredicted}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Repositions</p>
                <p className="text-3xl font-bold text-primary">{kpis.pendingRepositions}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Forecast Confidence</p>
                <p className="text-3xl font-bold text-green-600">{kpis.avgConfidence}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="heatmap">Demand Heatmap</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="repositions">Driver Positioning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* At-Risk Zones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  At-Risk Zones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {atRiskLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (atRiskZones || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <CheckCircle className="h-10 w-10 mb-2 text-green-500" />
                      <p>All zones adequately staffed</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Zone</TableHead>
                          <TableHead className="text-right">Predicted</TableHead>
                          <TableHead className="text-right">Drivers</TableHead>
                          <TableHead className="text-right">Shortage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(atRiskZones || []).map((zone) => (
                          <TableRow key={zone.zone_code}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {zone.zone_code}
                                {zone.surge_predicted && (
                                  <Badge variant="destructive" className="text-xs">
                                    Surge
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {zone.predicted_orders} orders
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-muted-foreground">
                                {zone.current_drivers_online}/{zone.predicted_drivers_needed}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="destructive">-{zone.shortage}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Driver Reposition Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Reposition Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {reposLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (recommendations || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Users className="h-10 w-10 mb-2" />
                      <p>No pending recommendations</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(recommendations || []).map((rec) => (
                        <div
                          key={rec.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={rec.driver?.avatar_url || ""} />
                              <AvatarFallback>
                                {rec.driver?.full_name?.charAt(0) || "D"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {rec.driver?.full_name || "Unknown Driver"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {rec.current_zone_code || "Unknown"} → {rec.suggested_zone_code}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={rec.priority === 1 ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              P{rec.priority}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => dismissMutation.mutate(rec.id)}
                              disabled={dismissMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Next Hour Forecasts */}
          <ForecastPanel forecasts={forecasts || []} isLoading={forecastsLoading} />
        </TabsContent>

        <TabsContent value="heatmap">
          <DemandHeatmap data={heatmapData} isLoading={heatmapLoading} />
        </TabsContent>

        <TabsContent value="forecasts">
          <Card>
            <CardHeader>
              <CardTitle>All Forecasts (Next 3 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {forecastsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zone</TableHead>
                        <TableHead>Forecast Time</TableHead>
                        <TableHead className="text-right">Predicted Orders</TableHead>
                        <TableHead className="text-right">Drivers Needed</TableHead>
                        <TableHead className="text-right">Current Drivers</TableHead>
                        <TableHead className="text-right">Confidence</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(forecasts || []).map((forecast) => (
                        <TableRow key={forecast.id}>
                          <TableCell className="font-medium">{forecast.zone_code}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(forecast.forecast_for), {
                                addSuffix: true,
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{forecast.predicted_orders}</TableCell>
                          <TableCell className="text-right">
                            {forecast.predicted_drivers_needed}
                          </TableCell>
                          <TableCell className="text-right">
                            {forecast.current_drivers_online}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                forecast.confidence >= 0.7
                                  ? "default"
                                  : forecast.confidence >= 0.4
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {Math.round(forecast.confidence * 100)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {forecast.surge_predicted ? (
                              <Badge variant="destructive">Surge</Badge>
                            ) : forecast.predicted_drivers_needed > forecast.current_drivers_online ? (
                              <Badge variant="outline" className="text-amber-500 border-amber-500">
                                At Risk
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-500 border-green-500">
                                OK
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repositions">
          <Card>
            <CardHeader>
              <CardTitle>Driver Reposition Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {reposLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (recommendations || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Users className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">No pending recommendations</p>
                    <p className="text-sm">Driver positions are optimally distributed</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver</TableHead>
                        <TableHead>Current Zone</TableHead>
                        <TableHead>Suggested Zone</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(recommendations || []).map((rec) => (
                        <TableRow key={rec.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={rec.driver?.avatar_url || ""} />
                                <AvatarFallback>
                                  {rec.driver?.full_name?.charAt(0) || "D"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {rec.driver?.full_name || "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{rec.current_zone_code || "—"}</TableCell>
                          <TableCell className="font-medium text-primary">
                            {rec.suggested_zone_code}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {rec.reason}
                          </TableCell>
                          <TableCell>
                            <Badge variant={rec.priority === 1 ? "destructive" : "secondary"}>
                              Priority {rec.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDistanceToNow(new Date(rec.expires_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissMutation.mutate(rec.id)}
                              disabled={dismissMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Dismiss
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DispatchDemand;
