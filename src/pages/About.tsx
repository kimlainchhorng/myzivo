import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Search, 
  ExternalLink, 
  Shield, 
  Users, 
  Globe,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-sky-500/20 text-sky-500 border-sky-500/30">
              <Plane className="w-3 h-3 mr-1" />
              About Us
            </Badge>
            <h1 className="font-display text-4xl font-bold mb-4">
              About ZIVO Flights
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your trusted flight search and comparison platform
            </p>
          </div>

          {/* Hero Card */}
          <Card className="mb-8 border-sky-500/30 bg-gradient-to-r from-sky-500/10 to-blue-500/5">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">What We Do</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    ZIVO Flights helps travelers search and compare flights from over 500 airlines 
                    worldwide. We aggregate pricing data from multiple sources to help you find the 
                    best options for your journey. <strong>We then redirect you to our trusted travel 
                    partners to complete your booking.</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-amber-500">Important Notice</h3>
                  <p className="text-muted-foreground">
                    <strong>ZIVO does not sell airline tickets directly.</strong> We are a flight search 
                    and comparison platform. When you select a flight, you will be redirected to our 
                    trusted travel partners (such as Skyscanner, airlines, or online travel agencies) 
                    to complete your purchase. All bookings, payments, and customer service are handled 
                    by the respective partner or airline.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <h2 className="text-2xl font-bold mb-6 text-center">How ZIVO Flights Works</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-sky-500">1</span>
                </div>
                <h3 className="font-bold mb-2">Search</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your travel details and we'll search hundreds of airlines and travel sites
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-sky-500">2</span>
                </div>
                <h3 className="font-bold mb-2">Compare</h3>
                <p className="text-sm text-muted-foreground">
                  Review prices, schedules, and amenities side-by-side to find your best option
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-sky-500">3</span>
                </div>
                <h3 className="font-bold mb-2">Book with Partner</h3>
                <p className="text-sm text-muted-foreground">
                  Click through to our partner site to complete your booking securely
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-center">Why Choose ZIVO Flights</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  icon: Globe,
                  title: "500+ Airlines",
                  description: "Compare prices from major carriers and budget airlines worldwide",
                  color: "text-sky-500"
                },
                {
                  icon: TrendingUp,
                  title: "Live Prices",
                  description: "Real-time pricing from multiple booking platforms",
                  color: "text-emerald-500"
                },
                {
                  icon: Shield,
                  title: "Trusted Partners",
                  description: "We only work with reputable travel booking platforms",
                  color: "text-purple-500"
                },
                {
                  icon: Users,
                  title: "Free to Use",
                  description: "No fees or charges for using our comparison service",
                  color: "text-amber-500"
                }
              ].map((feature) => (
                <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What We Don't Do */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">What We Don't Do</h3>
              <ul className="space-y-3">
                {[
                  "We do not sell airline tickets or issue boarding passes",
                  "We do not process payments for flight bookings",
                  "We do not provide customer service for completed bookings",
                  "We do not guarantee prices shown (final price determined by booking partner)"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-red-400 mt-0.5">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                For booking inquiries, changes, or cancellations, please contact the airline or 
                travel agency where you completed your purchase.
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Find Your Flight?</h2>
            <p className="text-muted-foreground mb-6">
              Start comparing prices from 500+ airlines today
            </p>
            <Link to="/book-flight">
              <Button size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600">
                <Search className="w-4 h-4 mr-2" />
                Search Flights
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
