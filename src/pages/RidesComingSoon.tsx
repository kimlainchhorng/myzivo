/**
 * ZIVO Rides — Coming Soon
 * 
 * Placeholder page for the planned ride discovery service.
 * No booking buttons, no pricing, no checkout.
 */

import { Car, Clock, Bell, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const RidesComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="ZIVO Rides — Coming Soon"
        description="ZIVO Rides is a planned ride discovery and transportation platform. Coming soon to help you explore transportation options."
      />
      
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")} 
            className="mb-8 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          {/* Hero Section */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              Coming Soon
            </div>

            {/* Icon */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-teal-400/10 flex items-center justify-center mx-auto mb-8">
              <Car className="w-12 h-12 text-primary" />
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              ZIVO <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">Rides</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
              ZIVO Rides is a planned ride discovery and transportation platform.
            </p>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              In the future, ZIVO Rides aims to help users explore transportation options 
              such as airport rides and local transport services through trusted partners.
            </p>

            {/* Status Card */}
            <Card className="max-w-md mx-auto bg-muted/30 border-border/50">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">We're Building Something Great</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  ZIVO Rides is not currently accepting bookings or payments.
                </p>
                <p className="text-xs text-muted-foreground">
                  Stay tuned for updates on our ride discovery service.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="max-w-xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-6">
              In the meantime, explore our active travel services:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => navigate("/book-flight")} variant="outline" className="gap-2">
                Search Flights
              </Button>
              <Button onClick={() => navigate("/book-hotel")} variant="outline" className="gap-2">
                Find Hotels
              </Button>
              <Button onClick={() => navigate("/rent-car")} variant="outline" className="gap-2">
                Rent a Car
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RidesComingSoon;
