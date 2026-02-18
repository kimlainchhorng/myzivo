/**
 * INVESTOR OVERVIEW PAGE
 * Internal-only page for potential acquirers and investors
 */

import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  DollarSign,
  Globe,
  LineChart,
  Plane,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  POTENTIAL_ACQUIRERS,
  VALUE_DRIVERS,
  BRAND_POSITIONING,
  EXIT_PATHS,
  VALUATION_FACTORS,
} from "@/config/acquisitionReadiness";
import { cn } from "@/lib/utils";

// TODO: Fetch real platform metrics from database
const PLATFORM_METRICS = {
  mau: 0,
  arr: 0,
  revenueGrowth: 0,
  bookingsPerMonth: 0,
  organicShare: 0,
  conversionRate: 0,
  complianceScore: 0,
};

export default function InvestorOverview() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plane className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">ZIVO</h1>
                <p className="text-xs text-muted-foreground">
                  Investor & Partner Overview
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              CONFIDENTIAL
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-0">
            Travel & Mobility Platform
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {BRAND_POSITIONING.primary}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            ZIVO is a multi-vertical travel marketplace connecting high-intent 
            travelers with trusted booking partners through a clean, 
            compliance-first affiliate model.
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <StatCard
              icon={Users}
              value={`${(PLATFORM_METRICS.mau / 1000).toFixed(0)}K`}
              label="Monthly Users"
            />
            <StatCard
              icon={DollarSign}
              value={`$${(PLATFORM_METRICS.arr / 1000000).toFixed(1)}M`}
              label="Annual Revenue"
            />
            <StatCard
              icon={TrendingUp}
              value={`${PLATFORM_METRICS.revenueGrowth}%`}
              label="Growth Rate"
            />
            <StatCard
              icon={Shield}
              value={`${PLATFORM_METRICS.complianceScore}%`}
              label="Compliance Score"
            />
          </div>
        </section>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="value">Value Drivers</TabsTrigger>
            <TabsTrigger value="exit">Exit Paths</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Business Model */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Business Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <ModelCard
                    title="Traffic Acquisition"
                    description="Organic SEO + targeted paid campaigns drive high-intent travelers"
                    icon={Globe}
                  />
                  <ModelCard
                    title="Partner Referrals"
                    description="Users book through trusted travel partners (airlines, OTAs, hotels)"
                    icon={Building2}
                  />
                  <ModelCard
                    title="Commission Revenue"
                    description="Earn affiliate commissions on successful bookings"
                    icon={DollarSign}
                  />
                </div>

                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-sm text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <strong>Zero inventory risk:</strong> Partners handle fulfillment, 
                    payments, and customer service.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Differentiators */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Key Differentiators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {BRAND_POSITIONING.differentiators.map((diff, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-sm">{diff}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Potential Acquirers */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Strategic Fit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {POTENTIAL_ACQUIRERS.categories.map((cat) => (
                    <div
                      key={cat.type}
                      className="p-4 rounded-lg border border-border/50 bg-card/50"
                    >
                      <p className="font-medium mb-1">{cat.label}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {cat.examples.join(", ")}
                      </p>
                      <p className="text-xs text-primary">{cat.interest}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Traffic Metrics */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Traffic Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MetricRow label="Monthly Active Users" value="250,000" trend="+12%" />
                  <MetricRow label="Daily Active Users" value="42,000" trend="+8%" />
                  <MetricRow label="Monthly Sessions" value="520,000" trend="+15%" />
                  <MetricRow label="Monthly Pageviews" value="1.8M" trend="+18%" />
                  
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Traffic Sources</p>
                    <div className="space-y-2">
                      <SourceBar label="Organic" value={65} />
                      <SourceBar label="Paid" value={20} />
                      <SourceBar label="Direct" value={15} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Metrics */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Revenue Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MetricRow label="Monthly Revenue" value="$100,000" trend="+45%" />
                  <MetricRow label="Annual Run Rate" value="$1.2M" trend="+45%" />
                  <MetricRow label="Revenue Per User" value="$0.40" trend="+8%" />
                  <MetricRow label="Avg Booking Value" value="$420" trend="+5%" />
                  <MetricRow label="Effective Take Rate" value="2.8%" trend="+0.2%" />
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MetricRow label="Monthly Bookings" value="15,000" trend="+22%" />
                  <MetricRow label="Monthly Searches" value="180,000" trend="+18%" />
                  <MetricRow label="Conversion Rate" value="3.2%" trend="+0.3%" />
                  <MetricRow label="Click-Through Rate" value="8.5%" trend="+1.2%" />
                  <MetricRow label="Return User Rate" value="35%" trend="+4%" />
                </CardContent>
              </Card>

              {/* Compliance Metrics */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Compliance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatusRow label="Seller of Travel License" status="active" />
                  <StatusRow label="GDPR Compliant" status="active" />
                  <StatusRow label="CCPA Compliant" status="active" />
                  <StatusRow label="Affiliate Good Standing" status="active" />
                  <MetricRow label="Chargeback Rate" value="0.02%" status="good" />
                  <MetricRow label="Complaint Rate" value="0.1%" status="good" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Value Drivers Tab */}
          <TabsContent value="value" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {VALUE_DRIVERS.map((driver) => (
                <Card key={driver.id} className="border-border/50">
                  <CardContent className="pt-6">
                    <Badge
                      variant="outline"
                      className={cn(
                        "mb-3",
                        driver.importance === "critical"
                          ? "text-red-500 border-red-500/30"
                          : "text-amber-500 border-amber-500/30"
                      )}
                    >
                      {driver.importance}
                    </Badge>
                    <h3 className="font-semibold mb-2">{driver.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {driver.description}
                    </p>
                    <div className="text-xs text-primary">
                      Key metric: {driver.metric}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Valuation Multiples */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  Valuation Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {Object.entries(VALUATION_FACTORS.multiples).map(([key, val]) => (
                    <div key={key} className="text-center p-4 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground uppercase mb-2">
                        {key} Multiple
                      </p>
                      <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                        <span className="text-muted-foreground">{val.low}</span>
                        <span className="text-primary">{val.mid}</span>
                        <span className="text-muted-foreground">{val.high}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{val.metric}</p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <p className="text-sm font-medium mb-3 text-emerald-500">
                      Valuation Premiums
                    </p>
                    {VALUATION_FACTORS.premiums.map((p, i) => (
                      <div key={i} className="flex justify-between text-sm py-1.5">
                        <span className="text-muted-foreground">{p.factor}</span>
                        <span className="text-emerald-500 font-medium">{p.premium}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-3 text-red-500">
                      Valuation Discounts
                    </p>
                    {VALUATION_FACTORS.discounts.map((d, i) => (
                      <div key={i} className="flex justify-between text-sm py-1.5">
                        <span className="text-muted-foreground">{d.factor}</span>
                        <span className="text-red-500 font-medium">{d.discount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exit Paths Tab */}
          <TabsContent value="exit" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {EXIT_PATHS.map((path) => (
                <Card key={path.id} className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">{path.label}</h3>
                      <Badge variant="outline">{path.timeline}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {path.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Valuation potential
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {path.valuation}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Why Prepare Early */}
            <Card className="border-border/50 bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">
                  Why Prepare for Exit Early?
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: "Stronger Negotiation Power", desc: "Data-driven conversations with potential buyers" },
                    { title: "Higher Valuation", desc: "Clean documentation reduces buyer uncertainty" },
                    { title: "Faster Deal Timelines", desc: "Due diligence ready materials accelerate process" },
                    { title: "Less Operational Stress", desc: "Team can focus on growth during discussions" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            This document is confidential and intended for authorized parties only.
            <br />
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </footer>
      </main>
    </div>
  );
}

// Helper Components
function StatCard({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="p-4 rounded-xl bg-card/50 border border-border/50">
      <Icon className="w-5 h-5 text-primary mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ModelCard({ title, description, icon: Icon }: { title: string; description: string; icon: any }) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
      <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
      <p className="font-medium mb-1">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function MetricRow({ label, value, trend, status }: { label: string; value: string; trend?: string; status?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{value}</span>
        {trend && (
          <span className={cn(
            "text-xs",
            trend.startsWith("+") ? "text-emerald-500" : "text-red-500"
          )}>
            {trend}
          </span>
        )}
        {status === "good" && (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        )}
      </div>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
        {status === "active" ? "✓ Active" : status}
      </Badge>
    </div>
  );
}

function SourceBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16">{label}</span>
      <Progress value={value} className="flex-1 h-2" />
      <span className="text-xs font-medium w-10 text-right">{value}%</span>
    </div>
  );
}
