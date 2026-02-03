import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Gift, 
  TrendingUp, 
  DollarSign, 
  Percent,
  Award,
  Share2,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

const GrowthDashboard = () => {
  const { metrics, isLoading } = useGrowthMetrics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const creditTypeData = Object.entries(metrics.credits.byType).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }));

  const serviceData = Object.entries(metrics.firstBooking.byService).map(([service, data]) => ({
    service: service.charAt(0).toUpperCase() + service.slice(1),
    claimed: data.claimed,
    budget: data.budget,
  }));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Growth Dashboard</h1>
            <p className="text-muted-foreground">Referrals, credits, and network effects</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Export Report</Button>
            <Button>Configure Incentives</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{metrics.referrals.total}</p>
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>{metrics.referrals.thisMonth} this month</span>
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Share2 className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Credits Outstanding</p>
                  <p className="text-2xl font-bold">${metrics.credits.outstanding.toFixed(0)}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>${metrics.credits.totalIssued.toFixed(0)} issued total</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <Gift className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{metrics.referrals.conversionRate.toFixed(1)}%</p>
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <TrendingUp className="h-3 w-3" />
                    <span>Referral → Booking</span>
                  </div>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Percent className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Acquisition Cost</p>
                  <p className="text-2xl font-bold">${metrics.acquisition.avgCreditCost.toFixed(2)}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Per referral signup</span>
                  </div>
                </div>
                <div className="p-3 bg-violet-500/10 rounded-full">
                  <Target className="h-5 w-5 text-violet-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="referrals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="incentives">Incentives</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
          </TabsList>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Referral Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span>Pending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metrics.referrals.pending}</span>
                        <Badge variant="secondary">
                          {((metrics.referrals.pending / Math.max(metrics.referrals.total, 1)) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>Qualified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metrics.referrals.qualified}</span>
                        <Badge variant="secondary">
                          {((metrics.referrals.qualified / Math.max(metrics.referrals.total, 1)) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Credited</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metrics.referrals.credited}</span>
                        <Badge variant="secondary">
                          {((metrics.referrals.credited / Math.max(metrics.referrals.total, 1)) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Referrers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Leaderboard coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Credit Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {creditTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={creditTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {creditTypeData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No credit data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Credit Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Issued</span>
                        <span className="font-medium">${metrics.credits.totalIssued.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Used</span>
                        <span className="font-medium">${metrics.credits.totalUsed.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ 
                            width: `${(metrics.credits.totalUsed / Math.max(metrics.credits.totalIssued, 1)) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Outstanding</span>
                        <span className="font-medium">${metrics.credits.outstanding.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500" 
                          style={{ 
                            width: `${(metrics.credits.outstanding / Math.max(metrics.credits.totalIssued, 1)) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Expired Unused</span>
                        <span className="font-medium text-red-500">${metrics.credits.expiredUnused.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500" 
                          style={{ 
                            width: `${(metrics.credits.expiredUnused / Math.max(metrics.credits.totalIssued, 1)) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Incentives Tab */}
          <TabsContent value="incentives" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">First Booking Incentives</CardTitle>
                </CardHeader>
                <CardContent>
                  {serviceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={serviceData}>
                        <XAxis dataKey="service" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="claimed" fill="#06b6d4" name="Claims" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No claims yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Budget Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">${metrics.firstBooking.budgetUsed.toFixed(0)}</p>
                      <p className="text-sm text-muted-foreground">Total budget used</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{metrics.firstBooking.totalClaimed}</p>
                      <p className="text-sm text-muted-foreground">Incentives claimed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{metrics.partnerReferrals.total}</p>
                  <p className="text-sm text-muted-foreground">Partner Referrals</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{metrics.partnerReferrals.qualified}</p>
                  <p className="text-sm text-muted-foreground">Qualified</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold">${metrics.partnerReferrals.totalPaid.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Bonuses Paid</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default GrowthDashboard;
