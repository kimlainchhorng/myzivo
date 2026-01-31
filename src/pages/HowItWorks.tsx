import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ArrowRight, 
  ExternalLink,
  CheckCircle2,
  Zap,
  Shield,
  DollarSign,
  Clock,
  Globe,
  Plane,
  Hotel,
  Car,
  MousePointerClick,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: 1,
    title: "Search",
    description: "Enter your travel details — destination, dates, and preferences. ZIVO searches across hundreds of airlines, hotels, and car rental providers to find available options.",
    icon: Search,
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
  },
  {
    step: 2,
    title: "Compare",
    description: "Review and compare prices, times, amenities, and options side-by-side. Use filters to narrow down by price, stops, ratings, and more.",
    icon: MousePointerClick,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
  },
  {
    step: 3,
    title: "Book",
    description: "When you find the right option, click to book. You'll be redirected to our trusted travel partner's website to complete your reservation securely.",
    icon: ExternalLink,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: "Free to Use",
    description: "No fees or charges for using ZIVO's comparison service",
    color: "text-emerald-500",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Compare multiple providers in one place instead of visiting each site",
    color: "text-sky-500",
  },
  {
    icon: Shield,
    title: "Trusted Partners",
    description: "We only work with reputable airlines and booking platforms",
    color: "text-violet-500",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Search flights, hotels, and cars worldwide",
    color: "text-amber-500",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="How ZIVO Works – Search, Compare & Book Travel"
        description="Learn how ZIVO helps you find and compare flights, hotels, and car rentals from trusted partners. Search, compare, and book in three simple steps."
      />
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Zap className="w-3 h-3 mr-1" />
              Simple Process
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              How ZIVO Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Finding and comparing travel options is easy. Just search, compare, and book with our trusted partners.
            </p>
          </div>

          {/* 3-Step Process */}
          <div className="mb-20">
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((item, index) => (
                <div key={item.step} className="relative">
                  <Card className={cn("h-full border-2", item.borderColor)}>
                    <CardContent className="p-8">
                      {/* Step Number */}
                      <div className={cn(
                        "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-lg",
                        item.color
                      )}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Step Badge */}
                      <Badge className={cn("mb-4", item.bgColor, "border-0")}>
                        Step {item.step}
                      </Badge>
                      
                      <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                  
                  {/* Arrow between steps (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Visual Flow */}
          <Card className="mb-16 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-teal-500/5 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Your Journey with ZIVO</h2>
                <p className="text-muted-foreground">From search to booking in minutes</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
                    <Search className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-semibold">You Search</p>
                    <p className="text-xs text-muted-foreground">Enter travel details</p>
                  </div>
                </div>
                
                <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
                
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-semibold">ZIVO Compares</p>
                    <p className="text-xs text-muted-foreground">Multiple partners</p>
                  </div>
                </div>
                
                <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
                
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold">You Book</p>
                    <p className="text-xs text-muted-foreground">On partner site</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Benefits
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Why Use ZIVO</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="text-center border-border/50">
                  <CardContent className="p-6">
                    <benefit.icon className={cn("w-10 h-10 mx-auto mb-4", benefit.color)} />
                    <h3 className="font-bold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Important Clarification */}
          <Card className="mb-12 border-muted bg-muted/30">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Important to Know</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    ZIVO is a search and comparison platform. <strong>We don't sell tickets directly</strong> — 
                    we help you find the best prices and redirect you to trusted booking partners. 
                    All bookings, payments, and customer service are handled by the partner you choose to book with.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-primary/10 via-background to-teal-500/10 rounded-3xl p-10 border border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Search and compare travel options from trusted partners worldwide.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/book-flight">
                <Button size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600 gap-2">
                  <Plane className="w-4 h-4" />
                  Search Flights
                </Button>
              </Link>
              <Link to="/book-hotel">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 gap-2">
                  <Hotel className="w-4 h-4" />
                  Find Hotels
                </Button>
              </Link>
              <Link to="/rent-car">
                <Button size="lg" className="bg-gradient-to-r from-violet-500 to-purple-500 gap-2">
                  <Car className="w-4 h-4" />
                  Rent a Car
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
