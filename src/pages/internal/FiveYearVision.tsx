/**
 * 5-YEAR VISION & ROADMAP
 * Long-term strategic plan for investors, partners, and acquirers
 */

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Crown,
  Globe,
  Landmark,
  Layers,
  Rocket,
  Scale,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FIVE_YEAR_PLAN = [
  {
    year: 1,
    label: "Year 1",
    title: "Foundation & Profitability",
    period: "2025",
    status: "current",
    icon: Rocket,
    color: "emerald",
    focus: [
      "Flights, Hotels, Cars fully live",
      "SEO-driven growth",
      "Affiliate revenue stability",
      "Clean compliance record",
    ],
    milestones: [
      { metric: "Monthly Users", value: "100K+", icon: Users },
      { metric: "Unit Economics", value: "Profitable", icon: TrendingUp },
      { metric: "Mobile Apps", value: "Launched", icon: Zap },
      { metric: "Core Automation", value: "In Place", icon: Scale },
    ],
    kpis: {
      users: 100000,
      revenue: 1200000,
      bookings: 180000,
    },
  },
  {
    year: 2,
    label: "Year 2",
    title: "Scale & Optimization",
    period: "2026",
    status: "planned",
    icon: TrendingUp,
    color: "blue",
    focus: [
      "International expansion",
      "AI-powered personalization",
      "Loyalty & rewards adoption",
      "B2B travel growth",
    ],
    milestones: [
      { metric: "Monthly Users", value: "500K+", icon: Users },
      { metric: "Revenue Streams", value: "Multiple", icon: Layers },
      { metric: "Enterprise Clients", value: "Onboarded", icon: Building2 },
      { metric: "Sponsored Listings", value: "Live", icon: Target },
    ],
    kpis: {
      users: 500000,
      revenue: 3000000,
      bookings: 450000,
    },
  },
  {
    year: 3,
    label: "Year 3",
    title: "Ecosystem Expansion",
    period: "2027",
    status: "planned",
    icon: Globe,
    color: "violet",
    focus: [
      "AI trip planning",
      "Bundled travel experiences",
      "Deeper data intelligence",
      "White-label & API partnerships",
    ],
    milestones: [
      { metric: "Monthly Users", value: "1M+", icon: Users },
      { metric: "Brand Recognition", value: "Strong", icon: Crown },
      { metric: "Partner Integrations", value: "At Scale", icon: Layers },
      { metric: "Data Monetization", value: "Active", icon: TrendingUp },
    ],
    kpis: {
      users: 1000000,
      revenue: 7500000,
      bookings: 1100000,
    },
  },
  {
    year: 4,
    label: "Year 4",
    title: "Super-App Strategy",
    period: "2028",
    status: "planned",
    icon: Layers,
    color: "amber",
    focus: [
      "Travel + mobility unification",
      "ZIVO Flights, Hotels, Cars, Rides, Eats, Move",
      "Personalized travel lifecycle",
      "Cross-vertical user journeys",
    ],
    milestones: [
      { metric: "Multi-Vertical Usage", value: "High", icon: Layers },
      { metric: "Retention Rates", value: "Industry-Leading", icon: Users },
      { metric: "User Lock-in", value: "Strong", icon: Target },
      { metric: "International Presence", value: "Established", icon: Globe },
    ],
    kpis: {
      users: 2500000,
      revenue: 15000000,
      bookings: 2200000,
    },
  },
  {
    year: 5,
    label: "Year 5",
    title: "Market Leadership & Exit Options",
    period: "2029-2030",
    status: "vision",
    icon: Crown,
    color: "rose",
    focus: [
      "Market leadership positioning",
      "Strategic partnerships",
      "Acquisition or IPO readiness",
      "Global brand recognition",
    ],
    milestones: [
      { metric: "Market Position", value: "Leader", icon: Crown },
      { metric: "Strategic Partners", value: "Secured", icon: Building2 },
      { metric: "Exit Readiness", value: "Complete", icon: Landmark },
      { metric: "Global Reach", value: "Achieved", icon: Globe },
    ],
    kpis: {
      users: 5000000,
      revenue: 30000000,
      bookings: 5000000,
    },
  },
];

const EXIT_OPTIONS = [
  {
    type: "Acquisition",
    description: "Strategic acquisition by OTA, airline, or super-app company",
    probability: "High",
    valuation: "$50M - $150M",
    timeline: "Year 4-5",
  },
  {
    type: "Strategic Partnership",
    description: "Minority investment from travel or tech giant",
    probability: "Medium-High",
    valuation: "$30M - $80M",
    timeline: "Year 3-4",
  },
  {
    type: "IPO Track",
    description: "Continue growth for potential public offering",
    probability: "Medium",
    valuation: "$100M+",
    timeline: "Year 6+",
  },
  {
    type: "Independent Growth",
    description: "Profitable independent operation with dividends",
    probability: "Baseline",
    valuation: "Ongoing value creation",
    timeline: "Continuous",
  },
];

const CORE_VISION = {
  statement:
    "ZIVO's vision is to become the platform that connects how the world moves — from planning a trip to moving through cities — intelligently, transparently, and globally.",
  pillars: [
    {
      title: "Global Reach",
      description: "Multi-market presence across continents",
      icon: Globe,
    },
    {
      title: "Intelligent Platform",
      description: "AI-driven personalization at scale",
      icon: Zap,
    },
    {
      title: "Unified Experience",
      description: "Seamless travel and mobility ecosystem",
      icon: Layers,
    },
    {
      title: "Trust & Transparency",
      description: "Industry-leading compliance and user trust",
      icon: Scale,
    },
  ],
};

function getColorClasses(color: string) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      border: "border-emerald-500/20",
    },
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      border: "border-blue-500/20",
    },
    violet: {
      bg: "bg-violet-500/10",
      text: "text-violet-500",
      border: "border-violet-500/20",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      border: "border-amber-500/20",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-500",
      border: "border-rose-500/20",
    },
  };
  return colors[color] || colors.emerald;
}

export default function FiveYearVision() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">5-Year Vision</h1>
                <p className="text-xs text-muted-foreground">
                  Long-Term Strategic Roadmap
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              CONFIDENTIAL
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Core Vision Statement */}
        <section className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary border-0">
            2025-2030 Vision
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Connecting How The World Moves
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {CORE_VISION.statement}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CORE_VISION.pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="p-4 rounded-xl bg-card border border-border/50 text-center"
              >
                <pillar.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-1">{pillar.title}</h4>
                <p className="text-xs text-muted-foreground">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5-Year Timeline */}
        <section>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Strategic Roadmap
          </h3>

          <div className="space-y-6">
            {FIVE_YEAR_PLAN.map((year, index) => {
              const colorClasses = getColorClasses(year.color);
              const Icon = year.icon;

              return (
                <Card
                  key={year.year}
                  className={cn(
                    "border-border/50 overflow-hidden",
                    year.status === "current" && "ring-2 ring-primary/20"
                  )}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Year Header */}
                      <div
                        className={cn(
                          "p-6 lg:w-64 shrink-0 flex flex-col items-center justify-center text-center",
                          colorClasses.bg
                        )}
                      >
                        <Icon className={cn("w-10 h-10 mb-2", colorClasses.text)} />
                        <span className={cn("text-sm font-medium", colorClasses.text)}>
                          {year.label}
                        </span>
                        <h4 className="font-display text-xl font-bold mt-1">
                          {year.title}
                        </h4>
                        <span className="text-xs text-muted-foreground mt-1">
                          {year.period}
                        </span>
                        {year.status === "current" && (
                          <Badge className="mt-3 bg-primary text-primary-foreground">
                            Current Phase
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Focus Areas */}
                          <div>
                            <h5 className="text-sm font-medium text-muted-foreground mb-3">
                              Focus Areas
                            </h5>
                            <ul className="space-y-2">
                              {year.focus.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2
                                    className={cn("w-4 h-4 mt-0.5 shrink-0", colorClasses.text)}
                                  />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Key Milestones */}
                          <div>
                            <h5 className="text-sm font-medium text-muted-foreground mb-3">
                              Key Milestones
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              {year.milestones.map((milestone, i) => (
                                <div
                                  key={i}
                                  className="p-3 rounded-lg bg-muted/30 text-center"
                                >
                                  <milestone.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                                  <div className={cn("font-semibold text-sm", colorClasses.text)}>
                                    {milestone.value}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {milestone.metric}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* KPIs */}
                        <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Users: </span>
                            <span className="font-semibold">
                              {(year.kpis.users / 1000000).toFixed(1)}M
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Revenue: </span>
                            <span className="font-semibold">
                              ${(year.kpis.revenue / 1000000).toFixed(1)}M
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Bookings: </span>
                            <span className="font-semibold">
                              {(year.kpis.bookings / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow connector */}
                    {index < FIVE_YEAR_PLAN.length - 1 && (
                      <div className="flex justify-center py-2 bg-muted/20">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Exit Options */}
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            Exit Pathways
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {EXIT_OPTIONS.map((option) => (
              <Card key={option.type} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold">{option.type}</h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        option.probability === "High" && "text-emerald-500 border-emerald-500/30",
                        option.probability === "Medium-High" &&
                          "text-blue-500 border-blue-500/30",
                        option.probability === "Medium" &&
                          "text-amber-500 border-amber-500/30",
                        option.probability === "Baseline" &&
                          "text-muted-foreground border-border"
                      )}
                    >
                      {option.probability}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valuation Range</span>
                    <span className="font-semibold">{option.valuation}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Timeline</span>
                    <span>{option.timeline}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-center">
              <strong>Long-Term Positioning:</strong> ZIVO is not built for short-term
              wins, but for long-term global impact.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Strategic vision for authorized stakeholders only.
            <br />
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </footer>
      </main>
    </div>
  );
}
