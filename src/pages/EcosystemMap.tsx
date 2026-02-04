/**
 * Ecosystem Map Page
 * Visual representation of ZIVO's platform ecosystem
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Layers,
  Plane,
  Hotel,
  Car,
  MapPin,
  Utensils,
  Package,
  Brain,
  Wallet,
  Star,
  CreditCard,
  Plug,
  BarChart3,
  ArrowDown,
  ArrowRight,
} from "lucide-react";

const travelCore = [
  { name: "ZIVO Flights", icon: Plane, description: "Global flight search & booking", color: "bg-sky-500" },
  { name: "ZIVO Hotels", icon: Hotel, description: "Accommodation worldwide", color: "bg-amber-500" },
  { name: "ZIVO Cars", icon: Car, description: "Car rental comparison", color: "bg-violet-500" },
];

const mobilityServices = [
  { name: "ZIVO Rides", icon: MapPin, description: "On-demand transportation", color: "bg-rose-500" },
  { name: "ZIVO Eats", icon: Utensils, description: "Food delivery", color: "bg-orange-500" },
  { name: "ZIVO Move", icon: Package, description: "Package logistics", color: "bg-teal-500" },
];

const platformLayer = [
  { name: "AI Intelligence", icon: Brain, description: "Smart recommendations & personalization" },
  { name: "ZIVO Miles", icon: Star, description: "Unified loyalty rewards program" },
  { name: "ZIVO Wallet", icon: Wallet, description: "Earnings, credits & payments" },
];

const infrastructure = [
  { name: "Payment Processing", icon: CreditCard, description: "Secure, PCI-compliant transactions" },
  { name: "Partner Integrations", icon: Plug, description: "500+ travel & mobility partners" },
  { name: "Data & Analytics", icon: BarChart3, description: "Real-time insights & optimization" },
];

const EcosystemMap = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Platform Ecosystem | ZIVO"
        description="Explore ZIVO's unified travel and mobility ecosystem - flights, hotels, cars, rides, eats, and logistics in one platform."
        canonical="https://hizivo.com/ecosystem"
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Layers className="w-3 h-3 mr-1" />
              Platform Ecosystem
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              One Platform, Infinite Possibilities
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ZIVO unifies global travel and local mobility into a single, 
              intelligent ecosystem powered by AI and connected by data.
            </p>
          </div>

          {/* Ecosystem Diagram */}
          <div className="space-y-8">
            {/* Travel Core */}
            <section>
              <div className="text-center mb-6">
                <Badge className="bg-sky-500/20 text-sky-500 border-sky-500/30">
                  Global Travel
                </Badge>
                <h2 className="text-2xl font-bold mt-2">Travel Core</h2>
                <p className="text-muted-foreground">Book travel anywhere in the world</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {travelCore.map((service) => (
                  <Card key={service.name} className="border-border/50 hover:border-sky-500/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center`}>
                          <service.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Connection Arrow */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-border relative">
                <ArrowDown className="w-4 h-4 text-muted-foreground absolute -bottom-2 left-1/2 -translate-x-1/2" />
              </div>
            </div>

            {/* Mobility Services */}
            <section>
              <div className="text-center mb-6">
                <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/30">
                  Local Mobility
                </Badge>
                <h2 className="text-2xl font-bold mt-2">Mobility Services</h2>
                <p className="text-muted-foreground">Move locally, eat locally, ship locally</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {mobilityServices.map((service) => (
                  <Card key={service.name} className="border-border/50 hover:border-rose-500/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center`}>
                          <service.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Connection Arrow */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-border relative">
                <ArrowDown className="w-4 h-4 text-muted-foreground absolute -bottom-2 left-1/2 -translate-x-1/2" />
              </div>
            </div>

            {/* Platform Layer */}
            <section>
              <div className="text-center mb-6">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Platform Layer
                </Badge>
                <h2 className="text-2xl font-bold mt-2">Unified Experience</h2>
                <p className="text-muted-foreground">Intelligence and rewards across all services</p>
              </div>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {platformLayer.map((item) => (
                      <div key={item.name} className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <item.icon className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Connection Arrow */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-border relative">
                <ArrowDown className="w-4 h-4 text-muted-foreground absolute -bottom-2 left-1/2 -translate-x-1/2" />
              </div>
            </div>

            {/* Infrastructure */}
            <section>
              <div className="text-center mb-6">
                <Badge variant="secondary">
                  Infrastructure
                </Badge>
                <h2 className="text-2xl font-bold mt-2">Foundation</h2>
                <p className="text-muted-foreground">Secure, scalable, and integrated</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {infrastructure.map((item) => (
                  <div key={item.name} className="p-6 rounded-xl bg-muted/30 border border-border/50 text-center">
                    <item.icon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Value Proposition */}
          <section className="mt-20">
            <Card className="border-border/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">The ZIVO Advantage</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">For Travelers</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-primary mt-1" />
                        <span className="text-muted-foreground">One account for all travel and mobility needs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-primary mt-1" />
                        <span className="text-muted-foreground">Earn rewards across every service</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-primary mt-1" />
                        <span className="text-muted-foreground">AI-powered personalization and recommendations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-primary mt-1" />
                        <span className="text-muted-foreground">Seamless transitions between services</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-4">For Partners</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-primary mt-1" />
                        <span className="text-muted-foreground">Access to a unified user base</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-primary mt-1" />
                        <span className="text-muted-foreground">Cross-service promotion opportunities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-primary mt-1" />
                        <span className="text-muted-foreground">Rich data insights for optimization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-primary mt-1" />
                        <span className="text-muted-foreground">Reduced customer acquisition costs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EcosystemMap;
