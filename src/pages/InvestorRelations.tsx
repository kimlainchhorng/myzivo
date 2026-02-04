/**
 * Investor Relations Page
 * Investor-focused content with unit economics and revenue projections
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Globe,
  Zap,
  DollarSign,
  Target,
  Users,
  Smartphone,
  Brain,
  Shield,
  Mail,
  ArrowRight,
  Building2,
  PieChart,
  Plane,
  Car,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ScaleScenarioCard } from "@/components/revenue/ScaleScenarioCard";
import { BusinessModelAdvantages } from "@/components/revenue/BusinessModelAdvantages";
import { 
  REVENUE_EXAMPLES, 
  MONTHLY_TOTALS,
  formatCommissionRate 
} from "@/config/revenueAssumptions";
import { formatPrice } from "@/lib/currency";

const highlights = [
  {
    icon: Globe,
    title: "Global Travel Platform",
    description: "Multi-vertical ecosystem covering flights, hotels, cars, rides, eats, and logistics.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Architecture",
    description: "Progressive Web App with native mobile capabilities and cross-platform support.",
  },
  {
    icon: Brain,
    title: "AI-Powered Personalization",
    description: "Smart recommendations, price tracking, and automated trip planning.",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description: "PCI-DSS compliance, encrypted data, and comprehensive audit logging.",
  },
];

const unitEconomics = [
  {
    service: 'flights' as const,
    icon: Plane,
    model: 'Fixed',
    rate: '$3–$12',
    example: '$7,000/mo (1K bookings)',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
  },
  {
    service: 'hotels' as const,
    icon: Building2,
    model: 'Percentage',
    rate: '10–25%',
    example: '$30,000/mo (500 bookings)',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    service: 'cars' as const,
    icon: Car,
    model: 'Fixed',
    rate: '$5–$30',
    example: '$4,500/mo (300 bookings)',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    service: 'addons' as const,
    icon: Package,
    model: 'Fixed',
    rate: '$3–$10',
    example: '$3,000/mo',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
];

const revenueStreams = [
  {
    title: "Affiliate Commissions",
    description: "Partner commissions from flight, hotel, and car rental bookings.",
    status: "Active",
    revenue: "$44.5K/mo",
  },
  {
    title: "Premium Subscriptions",
    description: "ZIVO Plus membership with exclusive benefits and rewards.",
    status: "Launching",
    revenue: "TBD",
  },
  {
    title: "B2B Data Insights",
    description: "Anonymized travel demand data for partners and enterprises.",
    status: "Roadmap",
    revenue: "TBD",
  },
  {
    title: "White-Label Solutions",
    description: "Travel search technology licensed to third parties.",
    status: "Roadmap",
    revenue: "TBD",
  },
];

const marketOpportunity = [
  { metric: "$1.7T", label: "Global Travel Market" },
  { metric: "$500B+", label: "Digital Booking Market" },
  { metric: "15%", label: "Annual Growth Rate" },
  { metric: "1B+", label: "Potential Users" },
];

const growthStrategy = [
  {
    phase: "Phase 1",
    title: "Foundation",
    items: ["Core travel platform", "US market focus", "ZIVO Miles loyalty", "AI Trip Planner"],
  },
  {
    phase: "Phase 2",
    title: "Expansion",
    items: ["Mobile apps launch", "LATAM expansion", "ZIVO Rides & Eats", "Corporate portal"],
  },
  {
    phase: "Phase 3",
    title: "Scale",
    items: ["Super-app consolidation", "APAC markets", "B2B platform", "ZIVO Move logistics"],
  },
];

const InvestorRelations = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Investor Relations | ZIVO"
        description="ZIVO investor relations - unit economics, revenue projections, market opportunity, and growth strategy."
        canonical="https://hizivo.com/investors"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              Investor Relations
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Building the Future of Travel & Mobility
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ZIVO is a high-margin, low-risk, commission-driven travel platform 
              designed to scale with user growth.
            </p>
          </div>

          {/* Company Overview */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mb-12">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Company Overview</h2>
                  <p className="text-muted-foreground mb-4">
                    ZIVO LLC is a travel technology company building a unified platform 
                    for global travel (flights, hotels, car rentals) and local mobility 
                    (rides, food delivery, logistics).
                  </p>
                  <p className="text-muted-foreground">
                    Our commission-based model generates revenue from partner bookings 
                    while providing users with transparent, no-markup pricing.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-background border border-border/50 text-center">
                    <Building2 className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Founded 2024</p>
                    <p className="text-sm text-muted-foreground">United States</p>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border/50 text-center">
                    <PieChart className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-semibold">6 Verticals</p>
                    <p className="text-sm text-muted-foreground">Unified Platform</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unit Economics */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Unit Economics</h2>
            <Card className="border-border/50 mb-6">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-4 font-semibold">Service</th>
                        <th className="text-left p-4 font-semibold">Model</th>
                        <th className="text-left p-4 font-semibold">Rate</th>
                        <th className="text-left p-4 font-semibold">Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unitEconomics.map((item) => {
                        const Icon = item.icon;
                        return (
                          <tr key={item.service} className="border-b border-border/30">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                                  <Icon className={`w-4 h-4 ${item.color}`} />
                                </div>
                                <span className="font-medium capitalize">{item.service}</span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground">{item.model}</td>
                            <td className="p-4 font-semibold">{item.rate}</td>
                            <td className="p-4 text-muted-foreground">{item.example}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td className="p-4 font-bold" colSpan={3}>Conservative Monthly Total</td>
                        <td className="p-4 font-bold text-emerald-500">{formatPrice(MONTHLY_TOTALS.total)}/mo</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
            <p className="text-center text-sm text-muted-foreground">
              Annual run rate at conservative projections: <strong className="text-foreground">{formatPrice(MONTHLY_TOTALS.annual)}</strong>
            </p>
          </section>

          {/* Scale Scenarios */}
          <section className="mb-16">
            <ScaleScenarioCard />
          </section>

          {/* Business Highlights */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Business Highlights</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {highlights.map((highlight) => (
                <Card key={highlight.title} className="border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <highlight.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{highlight.title}</h3>
                    <p className="text-sm text-muted-foreground">{highlight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Why ZIVO Scales */}
          <section className="mb-16">
            <BusinessModelAdvantages variant="compact" />
          </section>

          {/* Revenue Streams */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Revenue Streams</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {revenueStreams.map((stream) => (
                <Card key={stream.title} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={stream.status === "Active" ? "default" : "secondary"}>
                          {stream.status}
                        </Badge>
                        {stream.status === "Active" && (
                          <span className="text-sm font-semibold text-emerald-500">{stream.revenue}</span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">{stream.title}</h3>
                    <p className="text-sm text-muted-foreground">{stream.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Market Opportunity */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Market Opportunity</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {marketOpportunity.map((item) => (
                <div key={item.label} className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center">
                  <p className="text-3xl font-bold text-primary mb-2">{item.metric}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-6 max-w-2xl mx-auto">
              The global travel industry continues to grow, with increasing demand for 
              unified platforms that simplify the booking experience. The super-app model, 
              proven in Asia, represents a significant opportunity in Western markets.
            </p>
          </section>

          {/* Growth Strategy */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Growth Strategy</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {growthStrategy.map((phase) => (
                <Card key={phase.phase} className="border-border/50">
                  <CardHeader>
                    <Badge className="w-fit mb-2">{phase.phase}</Badge>
                    <CardTitle>{phase.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ArrowRight className="w-3 h-3 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="text-center p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-transparent to-primary/10 border border-emerald-500/20">
            <Mail className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Investor Inquiries</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              For investment opportunities, due diligence materials, or strategic 
              discussions, please contact our investor relations team.
            </p>
            <Button size="lg" className="gap-2" asChild>
              <a href="mailto:investors@hizivo.com">
                <Mail className="w-4 h-4" />
                investors@hizivo.com
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Confidential inquiries welcome. NDA available upon request.
            </p>
          </section>

          {/* Disclaimer */}
          <div className="mt-12 p-6 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Forward-Looking Statements:</strong> This page contains forward-looking 
              statements about ZIVO's business strategy, market opportunity, and growth plans. 
              These statements involve risks and uncertainties, and actual results may differ 
              materially. This is not an offer to sell or solicitation to buy securities.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InvestorRelations;
