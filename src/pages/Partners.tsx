import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Handshake,
  Users,
  TrendingUp,
  Globe,
  Shield,
  CheckCircle2,
  ArrowRight,
  Plane,
  Hotel,
  Car,
  Ticket,
  Building2,
  Zap,
  Target,
  BarChart3,
  Mail
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const services = [
  { icon: Plane, label: "Flights" },
  { icon: Hotel, label: "Hotels & Accommodations" },
  { icon: Car, label: "Car Rentals" },
  { icon: Ticket, label: "Airport Transfers" },
  { icon: Globe, label: "Activities & Travel Services" },
];

const howWeWork = [
  "We send high-intent users who are actively searching and comparing",
  "We do not interfere with partner checkout or pricing",
  "We focus on transparency and compliance",
  "We clearly disclose affiliate relationships",
];

const trafficSources = [
  { label: "Organic Search (SEO)", description: "High-quality, intent-driven traffic" },
  { label: "Educational Content Creators", description: "Travel tips and comparisons" },
  { label: "Social Media Discovery", description: "Authentic travel inspiration" },
  { label: "Paid Ads", description: "Search & compare messaging only" },
];

const partnerTypes = [
  {
    icon: Plane,
    title: "Airlines",
    description: "Direct partnerships with carriers to offer real-time availability and pricing",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    icon: Hotel,
    title: "Hotels & OTAs",
    description: "Connect hotel inventory and online travel agencies with active bookers",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Car,
    title: "Car Rental Companies",
    description: "Reach travelers looking for vehicle rentals at destinations worldwide",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Ticket,
    title: "Activity Providers",
    description: "Promote tours, experiences, and attractions to engaged travelers",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
];

export default function Partners() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Partner with ZIVO – Travel Affiliate & Partnership Program"
        description="Partner with ZIVO to reach qualified travel shoppers. We send ready-to-book traffic to airlines, hotels, car rental companies, and travel services."
        canonical="https://hizivo.com/partners"
      />
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Handshake className="w-3 h-3 mr-1" />
              Partner Program
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Partner with ZIVO
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              ZIVO is a travel search and comparison platform that connects users 
              with trusted travel partners worldwide.
            </p>
          </div>

          {/* What We Help Travelers Discover */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              We help travelers discover and compare
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {services.map((service) => (
                <div
                  key={service.label}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-center">{service.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Disclosure */}
          <Card className="mb-16 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Important</h3>
                  <p className="text-muted-foreground">
                    ZIVO does not sell travel products, issue tickets, or process payments.
                    All bookings are completed securely on our partners' websites.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Work With Partners */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Our Approach
              </Badge>
              <h2 className="text-2xl font-bold mb-4">How we work with partners</h2>
            </div>
            <div className="space-y-4 max-w-2xl mx-auto">
              {howWeWork.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border/50"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-sky-500/20 text-sky-500 border-sky-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                Quality Traffic
              </Badge>
              <h2 className="text-2xl font-bold mb-4">Traffic sources</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {trafficSources.map((source) => (
                <Card key={source.label} className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">{source.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-8">{source.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Partner Types */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-violet-500/20 text-violet-500 border-violet-500/30">
                <Building2 className="w-3 h-3 mr-1" />
                Who We Work With
              </Badge>
              <h2 className="text-2xl font-bold mb-4">Partnership Opportunities</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {partnerTypes.map((type) => (
                <Card key={type.title} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", type.bgColor)}>
                        <type.icon className={cn("w-6 h-6", type.color)} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">{type.title}</h3>
                        <p className="text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center bg-gradient-to-r from-primary/10 via-background to-teal-500/10 rounded-3xl p-10 border border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Interested in partnering with ZIVO?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              We'd love to hear from you. Reach out to discuss partnership opportunities.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-teal-400 gap-2"
              onClick={() => window.location.href = "mailto:kimlain@hizivo.com"}
            >
              <Mail className="w-4 h-4" />
              kimlain@hizivo.com
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
