/**
 * Strategic Roadmap Page
 * 5-Year vision for investors and partners
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Rocket,
  Target,
  Globe,
  Zap,
  Crown,
  TrendingUp,
  Plane,
  Hotel,
  Car,
  MapPin,
  Smartphone,
  Brain,
  Building2,
  Users,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

const roadmapPhases = [
  {
    year: "2024-2025",
    title: "Foundation",
    status: "Active",
    icon: Target,
    color: "bg-sky-500",
    description: "Establish core travel platform and US market presence",
    milestones: [
      { text: "Core travel platform (Flights, Hotels, Cars)", done: true },
      { text: "ZIVO Miles loyalty program", done: true },
      { text: "AI Trip Planner launch", done: false },
      { text: "US market focus", done: true },
      { text: "Partner network expansion", done: true },
      { text: "Mobile PWA optimization", done: true },
    ],
  },
  {
    year: "2025-2026",
    title: "Expansion",
    status: "Planned",
    icon: Globe,
    color: "bg-emerald-500",
    description: "Geographic and service expansion",
    milestones: [
      { text: "Native mobile apps (iOS, Android)", done: false },
      { text: "ZIVO Rides launch", done: false },
      { text: "ZIVO Eats launch", done: false },
      { text: "LATAM market expansion", done: false },
      { text: "Corporate travel portal", done: false },
      { text: "ZIVO Plus premium tier", done: false },
    ],
  },
  {
    year: "2026-2027",
    title: "Scale",
    status: "Roadmap",
    icon: Zap,
    color: "bg-violet-500",
    description: "Super-app consolidation and global growth",
    milestones: [
      { text: "Super-app unification", done: false },
      { text: "APAC market entry", done: false },
      { text: "B2B platform launch", done: false },
      { text: "ZIVO Move logistics", done: false },
      { text: "White-label solutions", done: false },
      { text: "Advanced AI features", done: false },
    ],
  },
  {
    year: "2027-2028",
    title: "Leadership",
    status: "Vision",
    icon: TrendingUp,
    color: "bg-amber-500",
    description: "Market leadership and data monetization",
    milestones: [
      { text: "AI-first travel experience", done: false },
      { text: "Global market presence", done: false },
      { text: "Premium tier growth", done: false },
      { text: "Data insights platform", done: false },
      { text: "Strategic partnerships", done: false },
      { text: "Enterprise solutions", done: false },
    ],
  },
  {
    year: "2028-2029",
    title: "Dominance",
    status: "Vision",
    icon: Crown,
    color: "bg-rose-500",
    description: "Market leadership and IPO readiness",
    milestones: [
      { text: "Market leadership position", done: false },
      { text: "Full super-app ecosystem", done: false },
      { text: "Cross-border payments", done: false },
      { text: "Acquisition integration", done: false },
      { text: "IPO readiness", done: false },
      { text: "Global brand recognition", done: false },
    ],
  },
];

const strategicPillars = [
  {
    icon: Globe,
    title: "Geographic Expansion",
    description: "Systematic expansion from US to LATAM, Europe, and APAC markets.",
  },
  {
    icon: Smartphone,
    title: "Super-App Strategy",
    description: "Unified mobile experience across all travel and mobility services.",
  },
  {
    icon: Brain,
    title: "AI-First Approach",
    description: "Deep learning for personalization, pricing, and recommendations.",
  },
  {
    icon: Building2,
    title: "B2B + B2C Growth",
    description: "Parallel focus on consumer and enterprise travel markets.",
  },
];

const StrategicRoadmap = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Strategic Roadmap | ZIVO"
        description="ZIVO's 5-year strategic vision - from foundation to market leadership in global travel and mobility."
        canonical="https://hizivo.com/strategic-roadmap"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Rocket className="w-3 h-3 mr-1" />
              Strategic Roadmap
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              5-Year Strategic Vision
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our journey from travel search platform to global travel and 
              mobility ecosystem leader.
            </p>
          </div>

          {/* Strategic Pillars */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Strategic Pillars</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {strategicPillars.map((pillar) => (
                <Card key={pillar.title} className="border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <pillar.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground">{pillar.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Roadmap Timeline */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Roadmap Timeline</h2>
            <div className="space-y-6">
              {roadmapPhases.map((phase, index) => (
                <Card 
                  key={phase.year} 
                  className={`border-border/50 ${index === 0 ? 'border-primary/30' : ''}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${phase.color} flex items-center justify-center`}>
                        <phase.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <CardTitle>{phase.year}: {phase.title}</CardTitle>
                          <Badge variant={phase.status === "Active" ? "default" : "secondary"}>
                            {phase.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{phase.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {phase.milestones.map((milestone) => (
                        <div 
                          key={milestone.text} 
                          className={`flex items-center gap-2 p-3 rounded-lg ${
                            milestone.done 
                              ? 'bg-emerald-500/10 border border-emerald-500/20' 
                              : 'bg-muted/30 border border-border/50'
                          }`}
                        >
                          <CheckCircle2 className={`w-4 h-4 ${
                            milestone.done ? 'text-emerald-500' : 'text-muted-foreground'
                          }`} />
                          <span className={`text-sm ${
                            milestone.done ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {milestone.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-16">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-sky-500/5">
              <CardHeader>
                <CardTitle className="text-center">Target Outcomes (2029)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">50+</p>
                    <p className="text-sm text-muted-foreground">Countries</p>
                  </div>
                  <div>
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">10M+</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                  <div>
                    <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">1000+</p>
                    <p className="text-sm text-muted-foreground">Partners</p>
                  </div>
                  <div>
                    <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">$1B+</p>
                    <p className="text-sm text-muted-foreground">GMV</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Disclaimer */}
          <div className="p-6 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Forward-Looking Statements:</strong> This roadmap represents 
              ZIVO's current strategic planning and is subject to change based on 
              market conditions, funding, and business priorities. The metrics and 
              timelines are targets, not guarantees. Actual results may differ 
              materially from the projections presented.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StrategicRoadmap;
