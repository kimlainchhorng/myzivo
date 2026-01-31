/**
 * ZIVO A/B Testing Analytics Dashboard
 * 
 * Internal admin dashboard for viewing A/B test results,
 * revenue analytics, and optimization insights.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  TrendingUp, 
  MousePointerClick, 
  DollarSign, 
  Target,
  Sparkles,
  RefreshCw,
  Trash2,
  Beaker,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getABAnalytics, clearABData, type ABExperimentStats } from "@/lib/abTesting";
import { getRevenueAnalytics, clearRevenueData, type RevenueAnalytics } from "@/lib/revenueOptimization";
import { getAffiliateAnalytics } from "@/lib/affiliateTracking";
import { cn } from "@/lib/utils";

export default function ABTestingDashboard() {
  const navigate = useNavigate();
  const [abStats, setAbStats] = useState<ABExperimentStats[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueAnalytics | null>(null);
  const [affiliateStats, setAffiliateStats] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    setAbStats(getABAnalytics());
    setRevenueStats(getRevenueAnalytics());
    setAffiliateStats(getAffiliateAnalytics());
  }, [refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };
  
  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all A/B testing and revenue data? This cannot be undone.")) {
      clearABData();
      clearRevenueData();
      handleRefresh();
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Beaker className="w-6 h-6 text-primary" />
                  A/B Testing & Revenue Optimization
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitor experiments, track conversions, optimize revenue
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="destructive" size="sm" onClick={handleClearData}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Data
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="experiments" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="clicks">Click Analytics</TabsTrigger>
          </TabsList>
          
          {/* Experiments Tab */}
          <TabsContent value="experiments" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Experiments</CardTitle>
                  <Beaker className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{abStats.length}</div>
                  <p className="text-xs text-muted-foreground">Running A/B tests</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {abStats.reduce((sum, e) => sum + e.totalImpressions, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all experiments</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {abStats.reduce((sum, e) => sum + e.totalClicks, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">User interactions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Winners Found</CardTitle>
                  <Trophy className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">
                    {abStats.filter(e => e.winningVariant).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Statistically significant</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Experiment Details */}
            <div className="space-y-4">
              {abStats.map((experiment) => (
                <ExperimentCard key={experiment.experimentId} experiment={experiment} />
              ))}
              
              {abStats.length === 0 && (
                <Card className="p-12 text-center">
                  <Beaker className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No experiment data yet</h3>
                  <p className="text-muted-foreground">
                    Interact with CTAs on the site to generate A/B testing data.
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            {revenueStats && (
              <>
                {/* Revenue Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{revenueStats.totalClicks.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{revenueStats.totalConversions}</div>
                      <p className="text-xs text-muted-foreground">
                        {revenueStats.avgCVR.toFixed(1)}% CVR
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-500">
                        ${revenueStats.totalRevenue.toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Revenue/Click</CardTitle>
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${revenueStats.avgRPC.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Service Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance by Service</CardTitle>
                    <CardDescription>Click and revenue distribution across travel services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {Object.entries(revenueStats.performanceByService).map(([service, data]) => (
                        <div key={service} className="p-4 rounded-lg border bg-card">
                          <div className="font-medium capitalize mb-2">{service}</div>
                          <div className="text-2xl font-bold">{data.clicks}</div>
                          <div className="text-sm text-muted-foreground">clicks</div>
                          {data.revenue > 0 && (
                            <div className="text-sm text-emerald-500 mt-1">
                              ${data.revenue.toFixed(2)} revenue
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Top Add-Ons */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add-On Performance</CardTitle>
                    <CardDescription>Click distribution for travel add-ons</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {revenueStats.topAddOns.length > 0 ? (
                      <div className="space-y-4">
                        {revenueStats.topAddOns.map((addon, index) => (
                          <div key={addon.category} className="flex items-center gap-4">
                            <div className="w-8 text-center font-bold text-muted-foreground">
                              #{index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium capitalize">{addon.category}</div>
                              <Progress 
                                value={(addon.clicks / (revenueStats.topAddOns[0]?.clicks || 1)) * 100} 
                                className="h-2 mt-1"
                              />
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{addon.clicks}</div>
                              <div className="text-xs text-muted-foreground">clicks</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No add-on click data yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          {/* Click Analytics Tab */}
          <TabsContent value="clicks" className="space-y-6">
            {affiliateStats && (
              <>
                {/* Click Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Today</CardTitle>
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{affiliateStats.todayClicks}</div>
                      <p className="text-xs text-muted-foreground">clicks today</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Week</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{affiliateStats.weekClicks}</div>
                      <p className="text-xs text-muted-foreground">clicks this week</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{affiliateStats.monthClicks}</div>
                      <p className="text-xs text-muted-foreground">clicks this month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{affiliateStats.conversionRate}%</div>
                      <p className="text-xs text-muted-foreground">
                        from {affiliateStats.resultsViews} page views
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Clicks by CTA Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Clicks by CTA Type</CardTitle>
                    <CardDescription>Which CTAs are performing best</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                      {Object.entries(affiliateStats.clicksByCTA || {}).map(([type, count]) => (
                        <div key={type} className="p-4 rounded-lg border bg-card text-center">
                          <div className="text-2xl font-bold">{count as number}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {type.replace(/_/g, ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Clicks by Device */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Device Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(affiliateStats.clicksByDevice || {}).map(([device, count]) => {
                          const total = Object.values(affiliateStats.clicksByDevice || {}).reduce((a: number, b) => a + (b as number), 0) as number;
                          const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                          return (
                            <div key={device} className="flex items-center gap-4">
                              <div className="w-20 capitalize font-medium">{device}</div>
                              <div className="flex-1">
                                <Progress value={percentage} className="h-2" />
                              </div>
                              <div className="w-16 text-right">
                                <span className="font-bold">{count as number}</span>
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Routes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {affiliateStats.topRoutes?.map(([route, count]: [string, number], index: number) => (
                            <div key={route} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                                  {index + 1}
                                </Badge>
                                <span className="font-medium">{route}</span>
                              </div>
                              <span className="text-muted-foreground">{count} clicks</span>
                            </div>
                          ))}
                          {(!affiliateStats.topRoutes || affiliateStats.topRoutes.length === 0) && (
                            <p className="text-muted-foreground text-center py-4">No route data yet</p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Experiment Card Component
function ExperimentCard({ experiment }: { experiment: ABExperimentStats }) {
  const maxImpressions = Math.max(...experiment.variants.map(v => v.impressions), 1);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {experiment.experimentName}
              {experiment.winningVariant && (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  <Trophy className="w-3 h-3 mr-1" />
                  Winner Found
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {experiment.totalImpressions.toLocaleString()} impressions • {experiment.totalClicks.toLocaleString()} clicks
            </CardDescription>
          </div>
          <Badge variant="outline">{experiment.experimentId}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {experiment.variants.map((variant) => {
            const isWinner = variant.variantId === experiment.winningVariant;
            const ctrDiff = experiment.variants.length > 1
              ? variant.ctr - experiment.variants.find(v => v.variantId !== variant.variantId)!.ctr
              : 0;
            
            return (
              <div 
                key={variant.variantId}
                className={cn(
                  "p-4 rounded-lg border",
                  isWinner && "border-emerald-500/50 bg-emerald-500/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{variant.variantName}</span>
                    {isWinner && <Trophy className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {variant.impressions} impressions
                    </span>
                    <span className="font-medium">
                      {variant.ctr.toFixed(2)}% CTR
                    </span>
                    {ctrDiff !== 0 && (
                      <span className={cn(
                        "flex items-center",
                        ctrDiff > 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {ctrDiff > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(ctrDiff).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
                <Progress 
                  value={(variant.impressions / maxImpressions) * 100} 
                  className={cn("h-2", isWinner && "[&>div]:bg-emerald-500")}
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{variant.clicks} clicks</span>
                  <span>{variant.conversions} conversions • {variant.cvr.toFixed(1)}% CVR</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
