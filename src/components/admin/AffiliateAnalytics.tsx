import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  MousePointer, 
  DollarSign, 
  Users,
  Plane,
  Hotel,
  Car,
  Shield,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { getAffiliateAnalytics } from '@/lib/affiliateTracking';
import { cn } from '@/lib/utils';

interface AffiliateAnalyticsProps {
  className?: string;
}

export default function AffiliateAnalytics({ className }: AffiliateAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ReturnType<typeof getAffiliateAnalytics> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setAnalytics(getAffiliateAnalytics());
      setIsRefreshing(false);
    }, 500);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { 
      label: 'Total Clicks', 
      value: analytics.totalClicks.toLocaleString(), 
      icon: MousePointer,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10'
    },
    { 
      label: 'Today', 
      value: analytics.todayClicks.toLocaleString(), 
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      label: 'Est. Revenue', 
      value: `$${analytics.totalRevenue.toFixed(2)}`, 
      icon: DollarSign,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    },
    { 
      label: 'Avg Order', 
      value: `$${analytics.avgOrderValue.toFixed(0)}`, 
      icon: BarChart3,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
  ];

  const partnerColors: Record<string, string> = {
    skyscanner: 'bg-sky-500',
    kayak: 'bg-orange-500',
    momondo: 'bg-purple-500',
    kiwi: 'bg-green-500',
    'trip.com': 'bg-blue-600',
    google_flights: 'bg-blue-500',
    default: 'bg-muted',
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sky-500" />
          Affiliate Analytics
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadAnalytics}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bgColor)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clicks by Partner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clicks by Partner</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(analytics.clicksByPartner).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No affiliate clicks recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(analytics.clicksByPartner)
                .sort((a, b) => b[1] - a[1])
                .map(([partner, count]) => {
                  const percentage = (count / analytics.totalClicks) * 100;
                  return (
                    <div key={partner} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{partner}</span>
                        <span className="text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", partnerColors[partner.toLowerCase()] || partnerColors.default)}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Routes & Airlines */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Top Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topRoutes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No route data yet.
              </p>
            ) : (
              <div className="space-y-2">
                {analytics.topRoutes.map(([route, count], index) => (
                  <div key={route} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-500 text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium">{route}</span>
                    </div>
                    <Badge variant="secondary">{count} clicks</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-4 h-4" />
              Top Airlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topAirlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No airline data yet.
              </p>
            ) : (
              <div className="space-y-2">
                {analytics.topAirlines.map(([airline, count], index) => (
                  <div key={airline} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium">{airline}</span>
                    </div>
                    <Badge variant="secondary">{count} clicks</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Clicks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentClicks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No clicks recorded yet. Clicks will appear here as users interact with affiliate links.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analytics.recentClicks.slice(0, 10).map((click, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
                  <div className="flex items-center gap-3">
                    <Plane className="w-4 h-4 text-sky-500" />
                    <div>
                      <p className="font-medium">{click.origin} → {click.destination}</p>
                      <p className="text-xs text-muted-foreground">{click.airline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${click.price}</p>
                    <Badge variant="outline" className="text-xs capitalize">{click.affiliatePartner}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disclosure */}
      <p className="text-xs text-muted-foreground text-center">
        Analytics based on local tracking data. Actual revenue may vary based on partner reporting.
      </p>
    </div>
  );
}
