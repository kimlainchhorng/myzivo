import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
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
  CheckCircle,
  Car,
  Hotel,
  MapPin,
  Smartphone,
  Zap,
  DollarSign,
  Building2,
  Wifi,
  Ticket,
  Luggage
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="About ZIVO – Global Travel Search & Comparison Platform"
        description="ZIVO is a global travel search and comparison platform helping users find and compare flights, hotels, car rentals, and travel services from trusted partners worldwide."
      />
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Globe className="w-3 h-3 mr-1" />
              About Us
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              About ZIVO
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              ZIVO is a global travel search and comparison platform that helps users find and compare 
              flights, hotels, car rentals, and travel services from trusted partners worldwide.
            </p>
          </div>

          {/* What We Do - Hero Card */}
          <Card className="mb-12 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-teal-500/10 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">What We Do</h2>
                  <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                    <p>
                      ZIVO aggregates and compares travel options from multiple trusted partners, 
                      helping travelers find the best flights, hotels, car rentals, and travel services 
                      in one place.
                    </p>
                    <p className="font-medium text-foreground">
                      ZIVO does not sell tickets or process payments.
                    </p>
                    <p>
                      When users are ready to book, they are redirected to our travel partners to 
                      complete their reservation securely.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-card/80 border border-border/50 text-center">
                    <Plane className="w-8 h-8 text-sky-500 mx-auto mb-3" />
                    <p className="font-semibold">Flights</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card/80 border border-border/50 text-center">
                    <Hotel className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                    <p className="font-semibold">Hotels</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card/80 border border-border/50 text-center">
                    <Car className="w-8 h-8 text-violet-500 mx-auto mb-3" />
                    <p className="font-semibold">Car Rentals</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-card/80 border border-border/50 text-center">
                    <Ticket className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                    <p className="font-semibold">Activities</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Model - How We Make Money */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                <DollarSign className="w-3 h-3 mr-1" />
                Transparent Model
              </Badge>
              <h2 className="text-3xl font-bold mb-4">How ZIVO Makes Money</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We believe in full transparency about our business model.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Users,
                  title: "Free for Users",
                  description: "ZIVO is completely free for travelers to use",
                  color: "text-sky-500",
                  bgColor: "bg-sky-500/10"
                },
                {
                  icon: DollarSign,
                  title: "No Booking Fees",
                  description: "We never charge fees for using our platform",
                  color: "text-emerald-500",
                  bgColor: "bg-emerald-500/10"
                },
                {
                  icon: Building2,
                  title: "Affiliate Revenue",
                  description: "We earn commissions when users book through partner links",
                  color: "text-violet-500",
                  bgColor: "bg-violet-500/10"
                },
                {
                  icon: CheckCircle,
                  title: "No Price Impact",
                  description: "Our commission has no impact on the price you pay",
                  color: "text-amber-500",
                  bgColor: "bg-amber-500/10"
                }
              ].map((item) => (
                <Card key={item.title} className="text-center border-border/50">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl ${item.bgColor} flex items-center justify-center mx-auto mb-4`}>
                      <item.icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform Scale */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-violet-500/20 text-violet-500 border-violet-500/30">
                <Globe className="w-3 h-3 mr-1" />
                Global Platform
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Built for Scale</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                ZIVO is a growing travel platform with global coverage and expanding services.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-border/50">
                <CardContent className="p-6 text-center">
                  <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-xl mb-2">Global Coverage</h3>
                  <p className="text-muted-foreground text-sm">
                    Access to flights, hotels, and services across 195+ countries worldwide
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6 text-center">
                  <Building2 className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-xl mb-2">Multiple Partners</h3>
                  <p className="text-muted-foreground text-sm">
                    Connected to trusted travel partners, airlines, and booking platforms
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6 text-center">
                  <Smartphone className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-xl mb-2">Mobile-First</h3>
                  <p className="text-muted-foreground text-sm">
                    Optimized for seamless experience on any device
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Expanding Services */}
            <Card className="border-border/50 bg-muted/30">
              <CardContent className="p-8">
                <h3 className="font-bold text-xl mb-6 text-center">Expanding Travel Ecosystem</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    { icon: Plane, label: "Flights", color: "text-sky-500" },
                    { icon: Hotel, label: "Hotels", color: "text-amber-500" },
                    { icon: Car, label: "Car Rentals", color: "text-violet-500" },
                    { icon: MapPin, label: "Transfers", color: "text-orange-500" },
                    { icon: Ticket, label: "Activities", color: "text-emerald-500" },
                    { icon: Wifi, label: "eSIM", color: "text-cyan-500" },
                    { icon: Luggage, label: "Luggage Storage", color: "text-pink-500" },
                  ].map((service) => (
                    <div key={service.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50">
                      <service.icon className={`w-4 h-4 ${service.color}`} />
                      <span className="text-sm font-medium">{service.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Notice */}
          <Card className="mb-12 border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-amber-500">Important Notice</h3>
                  <p className="text-muted-foreground">
                    <strong>ZIVO does not sell airline tickets, hotel rooms, or car rentals directly.</strong> We are a 
                    search and comparison platform. When you select an option, you will be redirected to our 
                    trusted travel partners to complete your purchase. All bookings, payments, and customer 
                    service are handled by the respective partner.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-primary/10 via-background to-teal-500/10 rounded-3xl p-10 border border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Start Your Journey</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Compare flights, hotels, and car rentals from trusted partners worldwide.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/book-flight">
                <Button size="lg" className="bg-gradient-to-r from-primary to-teal-400 gap-2">
                  <Plane className="w-4 h-4" />
                  Search Flights
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="gap-2">
                  <Zap className="w-4 h-4" />
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
