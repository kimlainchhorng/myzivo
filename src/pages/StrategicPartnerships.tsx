/**
 * Strategic Partnerships Page
 * Positioning for potential acquirers and strategic partners
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Handshake,
  Globe,
  Database,
  Layers,
  Zap,
  Code,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  Mail,
  Building2,
  Plug,
  Gift,
} from "lucide-react";
import { Link } from "react-router-dom";

const whyPartner = [
  {
    icon: Layers,
    title: "Unified Travel + Mobility Platform",
    description: "Single platform covering flights, hotels, cars, rides, food, and logistics—ready for integration.",
  },
  {
    icon: Code,
    title: "Modern Tech Stack",
    description: "React, TypeScript, Supabase, and edge functions. API-first architecture for easy integration.",
  },
  {
    icon: Users,
    title: "Growing User Base",
    description: "Active travelers seeking simplified booking experiences across multiple service categories.",
  },
  {
    icon: Zap,
    title: "AI-First Architecture",
    description: "Built-in AI capabilities for personalization, recommendations, and smart pricing insights.",
  },
];

const whiteLabelOptions = [
  {
    title: "Flight Search as a Service",
    description: "Embed our flight search and comparison engine into your platform with custom branding.",
    features: ["Real-time pricing", "Multi-carrier support", "Custom UI themes", "API access"],
  },
  {
    title: "Hotel Booking Integration",
    description: "Access our hotel inventory and booking capabilities through a simple API integration.",
    features: ["Global inventory", "Rate comparison", "Instant confirmation", "Affiliate tracking"],
  },
  {
    title: "Complete Travel Stack",
    description: "License the entire ZIVO travel platform for your own branded travel portal.",
    features: ["Full platform access", "Custom domain", "Dedicated support", "Revenue sharing"],
  },
];

const dataValue = [
  {
    icon: BarChart3,
    title: "Travel Demand Data",
    description: "Aggregated, anonymized data on travel search patterns, popular routes, and booking trends.",
  },
  {
    icon: Users,
    title: "User Behavior Insights",
    description: "Understanding of how travelers search, compare, and make booking decisions.",
  },
  {
    icon: Globe,
    title: "Multi-Channel Distribution",
    description: "Reach travelers across web, mobile, and partner channels with unified tracking.",
  },
];

const ecosystemAdvantages = [
  {
    title: "Cross-Service Synergies",
    description: "Users who book flights also need hotels, cars, and airport transfers—all in one place.",
  },
  {
    title: "Unified Loyalty Program",
    description: "ZIVO Miles rewards program encourages repeat bookings across all verticals.",
  },
  {
    title: "Single Customer View",
    description: "Complete travel profile enables personalized recommendations and targeted marketing.",
  },
  {
    title: "Reduced Acquisition Costs",
    description: "Cross-sell opportunities lower customer acquisition costs across service lines.",
  },
];

const StrategicPartnerships = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Strategic Partnerships | ZIVO"
        description="Partner with ZIVO - white-label opportunities, data partnerships, and strategic integration options."
        canonical="https://hizivo.com/strategic-partnerships"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-500/20 text-violet-500 border-violet-500/30">
              <Handshake className="w-3 h-3 mr-1" />
              Strategic Partnerships
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Partner with ZIVO
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Strategic integration, white-label licensing, and acquisition opportunities 
              for travel and technology companies.
            </p>
          </div>

          {/* Why Partner */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Why Partner with ZIVO</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyPartner.map((item) => (
                <Card key={item.title} className="border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-violet-500" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* White-Label Opportunities */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">White-Label Opportunities</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {whiteLabelOptions.map((option) => (
                <Card key={option.title} className="border-border/50 hover:border-violet-500/30 transition-colors">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-2">
                      <Plug className="w-5 h-5 text-violet-500" />
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                    <ul className="space-y-2">
                      {option.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-3 h-3 text-violet-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Data & Distribution Value */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Data & Distribution Value</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {dataValue.map((item) => (
                <Card key={item.title} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Ecosystem Advantage */}
          <section className="mb-16">
            <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Ecosystem Advantage</CardTitle>
                <p className="text-center text-muted-foreground">
                  The ZIVO platform creates unique value through service integration.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  {ecosystemAdvantages.map((advantage) => (
                    <div key={advantage.title} className="p-4 rounded-xl bg-background border border-border/50">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-violet-500" />
                        {advantage.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{advantage.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Partnership Types */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Partnership Types</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6 text-center">
                  <Building2 className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Strategic Investment</h3>
                  <p className="text-sm text-muted-foreground">
                    Growth capital with strategic value-add from industry partners.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6 text-center">
                  <Handshake className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Acquisition</h3>
                  <p className="text-sm text-muted-foreground">
                    Full or partial acquisition for companies building travel ecosystems.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6 text-center">
                  <Plug className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Technology Licensing</h3>
                  <p className="text-sm text-muted-foreground">
                    White-label or API licensing for travel technology stack.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Contact Section */}
          <section className="text-center p-12 rounded-3xl bg-gradient-to-br from-violet-500/10 via-transparent to-primary/10 border border-violet-500/20">
            <Mail className="w-12 h-12 text-violet-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Strategic Discussions</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Interested in partnership opportunities? Contact our business 
              development team for confidential discussions.
            </p>
            <Button size="lg" className="gap-2" asChild>
              <a href="mailto:kimlain@hizivo.com">
                <Mail className="w-4 h-4" />
                kimlain@hizivo.com
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              NDA and confidentiality agreements available upon request.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StrategicPartnerships;
