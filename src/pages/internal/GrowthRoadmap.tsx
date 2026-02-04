/**
 * GROWTH ROADMAP PAGE
 * Strategic growth plan for investors and partners
 */

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  Rocket,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ROADMAP_PHASES = [
  {
    id: "phase1",
    name: "Foundation",
    status: "completed",
    timeline: "Q1-Q2 2025",
    progress: 100,
    milestones: [
      { name: "Core platform launch", completed: true },
      { name: "Flight search integration", completed: true },
      { name: "Hotel search integration", completed: true },
      { name: "Car rental integration", completed: true },
      { name: "Affiliate partner onboarding", completed: true },
    ],
  },
  {
    id: "phase2",
    name: "Growth",
    status: "in-progress",
    timeline: "Q3-Q4 2025",
    progress: 65,
    milestones: [
      { name: "SEO content expansion (1000+ pages)", completed: true },
      { name: "Activities & tours integration", completed: true },
      { name: "Price alerts system", completed: true },
      { name: "Mobile app optimization", completed: false },
      { name: "Email marketing automation", completed: false },
    ],
  },
  {
    id: "phase3",
    name: "Scale",
    status: "planned",
    timeline: "Q1-Q2 2026",
    progress: 0,
    milestones: [
      { name: "International market expansion", completed: false },
      { name: "Multi-language support", completed: false },
      { name: "AI-powered recommendations", completed: false },
      { name: "Loyalty program launch", completed: false },
      { name: "B2B travel portal", completed: false },
    ],
  },
  {
    id: "phase4",
    name: "Dominate",
    status: "planned",
    timeline: "Q3-Q4 2026",
    progress: 0,
    milestones: [
      { name: "Premium subscription tier", completed: false },
      { name: "Trip planning AI assistant", completed: false },
      { name: "Strategic partnerships", completed: false },
      { name: "Market leadership position", completed: false },
      { name: "Exit readiness certification", completed: false },
    ],
  },
];

const GROWTH_LEVERS = [
  {
    title: "SEO Expansion",
    description: "Scale to 10,000+ programmatic landing pages",
    impact: "High",
    effort: "Medium",
    timeline: "6 months",
    metrics: ["Organic traffic +200%", "Indexed pages 10x"],
  },
  {
    title: "Paid Acquisition",
    description: "Optimize paid channels with positive ROAS",
    impact: "High",
    effort: "Medium",
    timeline: "Ongoing",
    metrics: ["CAC < $5", "ROAS > 3x"],
  },
  {
    title: "Email Automation",
    description: "Price alerts, abandoned cart, and re-engagement",
    impact: "Medium",
    effort: "Low",
    timeline: "3 months",
    metrics: ["Email revenue +50%", "Repeat users +30%"],
  },
  {
    title: "Partner Expansion",
    description: "Add premium travel partners and exclusive deals",
    impact: "Medium",
    effort: "Medium",
    timeline: "Ongoing",
    metrics: ["Partner count 2x", "Commission rate +15%"],
  },
  {
    title: "International Markets",
    description: "Expand to UK, EU, and APAC markets",
    impact: "High",
    effort: "High",
    timeline: "12 months",
    metrics: ["Revenue +100%", "Market reach 5x"],
  },
  {
    title: "Product Features",
    description: "AI recommendations, loyalty, and subscriptions",
    impact: "High",
    effort: "High",
    timeline: "12 months",
    metrics: ["LTV +40%", "Retention +25%"],
  },
];

const FINANCIAL_PROJECTIONS = {
  current: {
    year: "2025",
    arr: 1200000,
    mau: 250000,
    bookings: 180000,
  },
  projections: [
    { year: "2026", arr: 3000000, mau: 600000, bookings: 450000, growth: "150%" },
    { year: "2027", arr: 7500000, mau: 1500000, bookings: 1100000, growth: "150%" },
    { year: "2028", arr: 15000000, mau: 3000000, bookings: 2200000, growth: "100%" },
  ],
};

export default function GrowthRoadmap() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">Growth Roadmap</h1>
                <p className="text-xs text-muted-foreground">
                  Strategic Plan & Projections
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              CONFIDENTIAL
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Vision */}
        <section className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4 bg-primary/10 text-primary border-0">
            2025-2028 Strategy
          </Badge>
          <h2 className="font-display text-3xl font-bold mb-4">
            Path to Market Leadership
          </h2>
          <p className="text-muted-foreground">
            ZIVO's growth strategy focuses on scalable organic acquisition, 
            strategic partner expansion, and product innovation to become 
            the leading travel demand platform.
          </p>
        </section>

        {/* Roadmap Timeline */}
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Product Roadmap
          </h3>
          
          <div className="space-y-4">
            {ROADMAP_PHASES.map((phase, index) => (
              <Card
                key={phase.id}
                className={cn(
                  "border-border/50",
                  phase.status === "completed" && "bg-emerald-500/5",
                  phase.status === "in-progress" && "bg-amber-500/5 border-amber-500/20"
                )}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Phase indicator */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      phase.status === "completed" && "bg-emerald-500/20 text-emerald-500",
                      phase.status === "in-progress" && "bg-amber-500/20 text-amber-500",
                      phase.status === "planned" && "bg-muted text-muted-foreground"
                    )}>
                      <span className="text-lg font-bold">{index + 1}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">{phase.name}</h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            phase.status === "completed" && "text-emerald-500 border-emerald-500/30",
                            phase.status === "in-progress" && "text-amber-500 border-amber-500/30",
                            phase.status === "planned" && "text-muted-foreground"
                          )}
                        >
                          {phase.status === "completed" && "✓ Completed"}
                          {phase.status === "in-progress" && "In Progress"}
                          {phase.status === "planned" && "Planned"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {phase.timeline}
                        </span>
                      </div>

                      <Progress value={phase.progress} className="h-2 mb-3" />

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {phase.milestones.map((milestone, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex items-center gap-2 text-sm p-2 rounded-lg",
                              milestone.completed
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-muted/30 text-muted-foreground"
                            )}
                          >
                            {milestone.completed ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                            {milestone.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Growth Levers */}
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Growth Levers
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GROWTH_LEVERS.map((lever) => (
              <Card key={lever.title} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold">{lever.title}</h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        lever.impact === "High"
                          ? "text-emerald-500 border-emerald-500/30"
                          : "text-amber-500 border-amber-500/30"
                      )}
                    >
                      {lever.impact} Impact
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {lever.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Clock className="w-3 h-3" />
                    {lever.timeline}
                    <span className="mx-1">•</span>
                    <Target className="w-3 h-3" />
                    {lever.effort} effort
                  </div>

                  <div className="space-y-1">
                    {lever.metrics.map((metric, i) => (
                      <div
                        key={i}
                        className="text-xs flex items-center gap-1 text-primary"
                      >
                        <ChevronRight className="w-3 h-3" />
                        {metric}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Financial Projections */}
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Financial Projections
          </h3>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Metric
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        2025 (Current)
                      </th>
                      {FINANCIAL_PROJECTIONS.projections.map((p) => (
                        <th
                          key={p.year}
                          className="text-right py-3 px-4 text-sm font-medium text-muted-foreground"
                        >
                          {p.year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">Annual Revenue</td>
                      <td className="text-right py-3 px-4">
                        ${(FINANCIAL_PROJECTIONS.current.arr / 1000000).toFixed(1)}M
                      </td>
                      {FINANCIAL_PROJECTIONS.projections.map((p) => (
                        <td key={p.year} className="text-right py-3 px-4">
                          <span className="font-semibold">
                            ${(p.arr / 1000000).toFixed(1)}M
                          </span>
                          <span className="text-xs text-emerald-500 ml-1">
                            +{p.growth}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">Monthly Users</td>
                      <td className="text-right py-3 px-4">
                        {(FINANCIAL_PROJECTIONS.current.mau / 1000).toFixed(0)}K
                      </td>
                      {FINANCIAL_PROJECTIONS.projections.map((p) => (
                        <td key={p.year} className="text-right py-3 px-4 font-semibold">
                          {(p.mau / 1000000).toFixed(1)}M
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Annual Bookings</td>
                      <td className="text-right py-3 px-4">
                        {(FINANCIAL_PROJECTIONS.current.bookings / 1000).toFixed(0)}K
                      </td>
                      {FINANCIAL_PROJECTIONS.projections.map((p) => (
                        <td key={p.year} className="text-right py-3 px-4 font-semibold">
                          {(p.bookings / 1000000).toFixed(1)}M
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                <p>
                  <strong>Assumptions:</strong> Projections based on current growth 
                  trajectory, planned marketing investments, and successful execution 
                  of product roadmap. Actual results may vary based on market conditions 
                  and competitive dynamics.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Key Initiatives */}
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            2026 Key Initiatives
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <InitiativeCard
              icon={Globe}
              title="International Expansion"
              description="Launch in UK, Germany, and Australia with localized content and partnerships"
              status="Q1-Q2"
            />
            <InitiativeCard
              icon={Users}
              title="Loyalty Program"
              description="Launch ZIVO Miles program to increase retention and lifetime value"
              status="Q2"
            />
            <InitiativeCard
              icon={Rocket}
              title="AI Trip Planner"
              description="Introduce AI-powered itinerary builder and personalized recommendations"
              status="Q3-Q4"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Strategic roadmap for authorized parties only.
            <br />
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </footer>
      </main>
    </div>
  );
}

function InitiativeCard({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: any;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-6">
        <Icon className="w-8 h-8 text-primary mb-3" />
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold">{title}</h4>
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
