/**
 * Investor Relations Page
 * Comprehensive pitch deck for investors with problem/solution narrative
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
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Rocket,
  BarChart3,
  BadgeCheck,
  Layers,
  Eye,
  Search,
  Ban,
  Coins,
  Radio,
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

// ============================================================================
// PROBLEM POINTS
// ============================================================================

const problems = [
  {
    icon: Search,
    title: "Fragmented Booking",
    description: "Users must search multiple sites for flights, hotels, and cars separately.",
  },
  {
    icon: Eye,
    title: "Inconsistent Prices",
    description: "Price discrepancies and hidden fees create distrust and friction.",
  },
  {
    icon: Layers,
    title: "No Unified Experience",
    description: "Managing trips, alerts, and mobility across apps is frustrating.",
  },
  {
    icon: Ban,
    title: "Transaction-Focused",
    description: "Existing platforms focus on transactions, not user experience or ecosystem value.",
  },
];

// ============================================================================
// SOLUTION POINTS
// ============================================================================

const solutions = [
  {
    icon: Globe,
    title: "Compare Everything in One Place",
    description: "Flights, hotels, and car rentals unified in a single search experience.",
  },
  {
    icon: Shield,
    title: "Secure Partner Bookings",
    description: "Book securely through licensed travel providers with transparent pricing.",
  },
  {
    icon: Radio,
    title: "Smart Alerts & Management",
    description: "Price alerts, trip management, and smart recommendations in one ecosystem.",
  },
  {
    icon: Brain,
    title: "AI-Ready Infrastructure",
    description: "Built for future AI trip planning and personalized travel experiences.",
  },
];

// ============================================================================
// PRODUCT FEATURES
// ============================================================================

const productFeatures = [
  { icon: Plane, label: "Flight Comparison & Booking" },
  { icon: Building2, label: "Hotel Booking" },
  { icon: Car, label: "Car Rental Booking" },
  { icon: Radio, label: "Price Alerts & Recommendations" },
  { icon: Smartphone, label: "Mobile-Ready App" },
  { icon: Brain, label: "Future AI Trip Planning" },
];

// ============================================================================
// UNIT ECONOMICS
// ============================================================================

const unitEconomics = [
  {
    service: 'flights' as const,
    icon: Plane,
    model: 'Fixed',
    rate: '$3–$15',
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

// ============================================================================
// TRACTION & STATUS
// ============================================================================

const tractionPoints = [
  { icon: CheckCircle2, label: "Platform built and live (soft launch)", active: true },
  { icon: CheckCircle2, label: "Affiliate partnerships in progress", active: true },
  { icon: CheckCircle2, label: "Mobile app structure ready", active: true },
  { icon: CheckCircle2, label: "Monetization enabled", active: true },
  { icon: CheckCircle2, label: "Compliance and audit-ready", active: true },
];

// ============================================================================
// COMPETITIVE ADVANTAGE
// ============================================================================

const competitiveAdvantages = [
  {
    icon: Globe,
    title: "Unified Ecosystem",
    description: "Travel + Mobility in one platform (Flights, Hotels, Cars, Rides, Eats, Move)",
  },
  {
    icon: Eye,
    title: "Transparent Pricing",
    description: "No hidden fees. Clear partner disclosures.",
  },
  {
    icon: Brain,
    title: "AI-Ready",
    description: "Infrastructure designed for intelligent trip planning.",
  },
  {
    icon: Layers,
    title: "Multi-Vertical",
    description: "6 service verticals with cross-sell opportunities.",
  },
  {
    icon: Shield,
    title: "Low Operational Risk",
    description: "Commission-based model with no inventory or ticketing risk.",
  },
];

// ============================================================================
// MARKET OPPORTUNITY
// ============================================================================

const marketOpportunity = [
  { metric: "$800B+", label: "Global Online Travel Market" },
  { metric: "Mobile", label: "Primary Growth Driver" },
  { metric: "AI", label: "Technology Trend" },
  { metric: "Global", label: "Travel Demand" },
];

const targetSegments = [
  "Leisure travelers",
  "Business travelers",
  "International travelers",
  "Future mobility users",
];

// ============================================================================
// GROWTH STRATEGY
// ============================================================================

const growthStrategies = [
  { icon: Search, label: "SEO & Organic Traffic" },
  { icon: Users, label: "Affiliate Partnerships" },
  { icon: Smartphone, label: "Mobile App Launch" },
  { icon: Radio, label: "Price Alerts & Retention" },
  { icon: Building2, label: "Business & Corporate Travel" },
  { icon: Globe, label: "International Expansion" },
];

// ============================================================================
// INVESTMENT USE
// ============================================================================

const investmentUse = [
  { label: "Traffic Growth", icon: TrendingUp, priority: 1 },
  { label: "Mobile App Launch", icon: Smartphone, priority: 2 },
  { label: "AI Features", icon: Brain, priority: 3 },
  { label: "Partner Expansion", icon: Users, priority: 4 },
  { label: "Team Scaling", icon: Building2, priority: 5 },
];

// ============================================================================
// VISION
// ============================================================================

const visionStatement = "To become the platform that connects how the world moves — travel, mobility, and intelligent planning in one ecosystem.";

const InvestorRelations = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Investor Pitch | ZIVO Travel & Mobility Platform"
        description="ZIVO investor relations - scalable, commission-based travel and mobility platform built for global growth and long-term value."
        canonical="https://hizivo.com/investors"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* ================================================================ */}
          {/* HERO */}
          {/* ================================================================ */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              Investor Pitch
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              ZIVO Travel & Mobility Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A scalable, commission-based travel and mobility platform built for 
              global growth, low risk, and long-term value.
            </p>
          </div>

          {/* ================================================================ */}
          {/* 1. THE PROBLEM */}
          {/* ================================================================ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold">1. The Problem</h2>
            </div>
            <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
              <CardContent className="p-6">
                <p className="text-lg text-muted-foreground mb-6 font-medium">
                  Travel booking is fragmented. Users must:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {problems.map((problem) => (
                    <div key={problem.title} className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/50">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                        <problem.icon className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{problem.title}</h3>
                        <p className="text-sm text-muted-foreground">{problem.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* 2. THE SOLUTION */}
          {/* ================================================================ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold">2. The Solution</h2>
            </div>
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <CardContent className="p-6">
                <p className="text-lg text-muted-foreground mb-6 font-medium">
                  ZIVO is a unified travel and mobility platform. We help users:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {solutions.map((solution) => (
                    <div key={solution.title} className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/50">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <solution.icon className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{solution.title}</h3>
                        <p className="text-sm text-muted-foreground">{solution.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-sm font-medium">
                    ZIVO combines travel, mobility, and AI-ready infrastructure into one platform.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* 3. PRODUCT */}
          {/* ================================================================ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">3. Product</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">ZIVO offers:</p>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {productFeatures.map((feature) => (
                    <div key={feature.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                      <feature.icon className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">{feature.label}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-sm text-muted-foreground text-center">
                    All bookings are fulfilled by licensed providers. ZIVO acts as a booking facilitator and sub-agent.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* 4. MARKET OPPORTUNITY */}
          {/* ================================================================ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-sky-500" />
              </div>
              <h2 className="text-2xl font-bold">4. Market Opportunity</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {marketOpportunity.map((item) => (
                <div key={item.label} className="p-6 rounded-2xl bg-gradient-to-br from-sky-500/10 to-transparent border border-sky-500/20 text-center">
                  <p className="text-2xl font-bold text-sky-500 mb-1">{item.metric}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Global online travel market: <strong className="text-foreground">$800B+ annually</strong>, 
                  growing with mobile, AI, and global travel demand.
                </p>
                <p className="text-sm text-muted-foreground mb-2">ZIVO targets:</p>
                <div className="flex flex-wrap gap-2">
                  {targetSegments.map((segment) => (
                    <Badge key={segment} variant="secondary">{segment}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* 5. BUSINESS MODEL */}
          {/* ================================================================ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold">5. Business Model</h2>
            </div>
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="p-6 pb-4">
                  <p className="text-muted-foreground mb-4">Revenue is commission-based:</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-y border-border/50 bg-muted/30">
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
                      <tr className="bg-emerald-500/5">
                        <td className="p-4 font-bold" colSpan={3}>Conservative Monthly Total</td>
                        <td className="p-4 font-bold text-emerald-500">{formatPrice(MONTHLY_TOTALS.total)}/mo</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium">High-Margin</p>
                <p className="text-xs text-muted-foreground">Commission = pure profit</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                <Shield className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Asset-Light</p>
                <p className="text-xs text-muted-foreground">No inventory risk</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Scalable</p>
                <p className="text-xs text-muted-foreground">No ticket issuing risk</p>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 6. TRACTION & STATUS */}
          {/* ================================================================ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-violet-500" />
              </div>
              <h2 className="text-2xl font-bold">6. Traction & Status</h2>
            </div>
            <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {tractionPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="font-medium">{point.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* 7. COMPETITIVE ADVANTAGE */}
          {/* ================================================================ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold">7. Competitive Advantage</h2>
            </div>
            <p className="text-muted-foreground mb-6">ZIVO differentiates by:</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitiveAdvantages.map((advantage) => (
                <Card key={advantage.title} className="border-amber-500/10">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                      <advantage.icon className="w-5 h-5 text-amber-500" />
                    </div>
                    <h3 className="font-semibold mb-1">{advantage.title}</h3>
                    <p className="text-sm text-muted-foreground">{advantage.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ================================================================ */}
          {/* SCALE SCENARIOS */}
          {/* ================================================================ */}
          <section className="mb-16">
            <ScaleScenarioCard />
          </section>

          {/* ================================================================ */}
          {/* 8. GROWTH STRATEGY */}
          {/* ================================================================ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-teal-500" />
              </div>
              <h2 className="text-2xl font-bold">8. Growth Strategy</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {growthStrategies.map((strategy) => (
                <div key={strategy.label} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <strategy.icon className="w-5 h-5 text-teal-500" />
                  <span className="font-medium">{strategy.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ================================================================ */}
          {/* 9. VISION */}
          {/* ================================================================ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">9. Vision</h2>
            </div>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-8 text-center">
                <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed italic">
                  "{visionStatement}"
                </p>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* 10. INVESTMENT USE */}
          {/* ================================================================ */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold">10. Investment Use</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">Capital will be used for:</p>
                <div className="space-y-3">
                  {investmentUse.map((item, index) => (
                    <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-emerald-500">{item.priority}</span>
                      </div>
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* SUMMARY BANNER */}
          {/* ================================================================ */}
          <section className="mb-16">
            <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Summary</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  ZIVO is a scalable, commission-based travel and mobility platform 
                  built for global growth, low risk, and long-term value.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Why ZIVO Scales */}
          <section className="mb-16">
            <BusinessModelAdvantages />
          </section>

          {/* ================================================================ */}
          {/* CONTACT */}
          {/* ================================================================ */}
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
