/**
 * Creator Dashboard Page
 * Analytics and earnings for influencers
 */

import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Link2,
  TrendingUp,
  DollarSign,
  Users,
  ArrowRight,
  Copy,
  ExternalLink,
  Calendar,
} from "lucide-react";
import CreatorStats from "@/components/creators/CreatorStats";
import { CreatorStats as CreatorStatsType } from "@/types/behaviorAnalytics";
import { toast } from "sonner";

// Creator stats - loaded from real affiliate data when available
const defaultStats: CreatorStatsType = {
  totalClicks: 0,
  conversions: 0,
  conversionRate: 0,
  earningsThisMonth: 0,
  earningsTotal: 0,
  topLinks: [],
  tier: 'rising',
};

// Activity loaded from real affiliate_click_logs when available
const recentActivity: { type: string; product: string; time: string; location: string }[] = [];

export default function CreatorDashboard() {
  const handleCopyLink = async (product: string) => {
    const link = `https://hizivo.com/creators/${product}?creator=your_name`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Creator Dashboard – ZIVO"
        description="Track your earnings, clicks, and performance as a ZIVO creator."
        canonical="https://hizivo.com/creators/dashboard"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                <BarChart3 className="w-3 h-3 mr-1" />
                Creator Dashboard
              </Badge>
              <h1 className="text-3xl font-bold mb-1">Welcome Back, Creator</h1>
              <p className="text-muted-foreground">
                Track your performance and grow your earnings
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link to="/creators" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Link Generator
                </Link>
              </Button>
              <Button className="gap-2">
                <DollarSign className="w-4 h-4" />
                Request Payout
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Stats Panel */}
            <div className="lg:col-span-1">
              <CreatorStats stats={defaultStats} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Chart Placeholder */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Performance
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">7D</Button>
                      <Button variant="ghost" size="sm" className="bg-muted">30D</Button>
                      <Button variant="ghost" size="sm">90D</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg border border-dashed">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>Performance chart coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Quick Copy Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {['flights', 'hotels', 'cars'].map((product) => (
                      <Button
                        key={product}
                        variant="outline"
                        className="justify-between"
                        onClick={() => handleCopyLink(product)}
                      >
                        <span className="capitalize">{product}</span>
                        <Copy className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'conversion' ? 'bg-emerald-500' : 'bg-sky-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium">
                              {activity.type === 'conversion' ? 'Conversion' : 'Click'} on {activity.product}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              via {activity.location}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card>
                <CardHeader>
                  <CardTitle>Creator Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start gap-2" asChild>
                      <Link to="/creators">
                        <Users className="w-4 h-4" />
                        Creator Toolkit
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="justify-start gap-2" asChild>
                      <a href="mailto:creators@hizivo.com">
                        <DollarSign className="w-4 h-4" />
                        Payout Support
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
