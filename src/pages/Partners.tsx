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

const partnerBenefits = [
  {
    icon: Users,
    title: "Qualified Traffic",
    description: "ZIVO sends travel-intent users actively searching for flights, hotels, and car rentals to your platform.",
  },
  {
    icon: Target,
    title: "Comparison Focus",
    description: "We focus on search and comparison — we never compete with your checkout or booking flow.",
  },
  {
    icon: BarChart3,
    title: "Performance Tracking",
    description: "Track conversions, clicks, and revenue with transparent reporting and analytics.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Access travelers from around the world through our growing international platform.",
  },
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

const howItWorks = [
  {
    step: 1,
    title: "User Searches",
    description: "Travelers enter their trip details on ZIVO",
  },
  {
    step: 2,
    title: "We Compare",
    description: "ZIVO displays options from multiple partners",
  },
  {
    step: 3,
    title: "User Clicks",
    description: "When ready, users click through to your site",
  },
  {
    step: 4,
    title: "You Convert",
    description: "Booking happens entirely on your platform",
  },
];

export default function Partners() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Partner with ZIVO – Travel Affiliate & Partnership Program"
        description="Partner with ZIVO to reach qualified travel shoppers. We send ready-to-book traffic to airlines, hotels, car rental companies, and travel services."
      />
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Handshake className="w-3 h-3 mr-1" />
              Partnerships
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Partner with ZIVO
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join our growing network of travel partners and connect with millions of travelers 
              actively searching for flights, hotels, and travel services.
            </p>
          </div>

          {/* Value Proposition */}
          <Card className="mb-16 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-teal-500/10">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">What ZIVO Offers Partners</h2>
                  <div className="space-y-4 text-muted-foreground text-lg">
                    <p>
                      ZIVO is a travel search and comparison platform that sends <strong>qualified, high-intent traffic</strong> to 
                      our travel partners.
                    </p>
                    <p>
                      We focus entirely on <strong>discovery and comparison</strong> — we never compete with your 
                      checkout process or booking flow.
                    </p>
                    <p>
                      When users are ready to book, they're redirected directly to your platform to complete the transaction.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    "High-intent travel shoppers",
                    "No checkout competition",
                    "Transparent performance tracking",
                    "Global audience reach",
                    "Mobile-optimized experience",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How Partnership Works */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-violet-500/20 text-violet-500 border-violet-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Simple Process
              </Badge>
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A clear, performance-based partnership model
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, index) => (
                <div key={item.step} className="relative">
                  <Card className="h-full text-center">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl font-bold text-primary">{item.step}</span>
                      </div>
                      <h3 className="font-bold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                  {index < howItWorks.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Partner Benefits */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                Benefits
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Why Partner with ZIVO</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {partnerBenefits.map((benefit) => (
                <Card key={benefit.title} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <benefit.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Partner Types */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-sky-500/20 text-sky-500 border-sky-500/30">
                <Building2 className="w-3 h-3 mr-1" />
                Who We Work With
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Partnership Opportunities</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're open to partnerships with airlines, OTAs, hotels, car rental companies, and travel service providers.
              </p>
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

          {/* Transparency Note */}
          <Card className="mb-12 border-muted bg-muted/30">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Our Commitment</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      We never compete with your checkout or booking process
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      All bookings and payments are handled on your platform
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Transparent tracking and performance reporting
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Partner logos displayed only with explicit approval
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-primary/10 via-background to-teal-500/10 rounded-3xl p-10 border border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Interested in Partnering?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              We're growing our partner network and would love to hear from you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-gradient-to-r from-primary to-teal-400 gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Us
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="gap-2">
                  Learn About ZIVO
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
