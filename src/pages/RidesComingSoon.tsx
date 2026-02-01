/**
 * ZIVO Rides — Coming Soon
 * 
 * Placeholder page for the planned transportation service.
 * NO booking buttons, NO pricing, NO checkout, NO affiliate redirects.
 */

import { Car, Clock, ArrowLeft, Sparkles, ArrowRight } from "lucide-react";
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
        description="ZIVO Rides is a planned transportation service. It is not currently available for booking or payment."
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
              <span className="block text-2xl md:text-3xl mt-2 text-muted-foreground font-normal">
                — Coming Soon
              </span>
            </h1>

            {/* Description */}
            <div className="bg-muted/30 rounded-2xl p-6 mb-8 max-w-2xl mx-auto border border-border/50">
              <p className="text-lg text-foreground mb-4">
                ZIVO Rides is a planned transportation service.
              </p>
              <p className="text-muted-foreground">
                It is not currently available for booking or payment.
              </p>
            </div>

            {/* Status Card */}
            <Card className="max-w-md mx-auto bg-card border-border/50">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-3">Need Airport Transfers Today?</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  For airport transfers right now, explore ZIVO Extras.
                </p>
                <Button 
                  onClick={() => navigate("/extras")}
                  className="gap-2 bg-gradient-to-r from-primary to-teal-400 text-white"
                >
                  Explore Airport Transfers
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Explore Active Services */}
          <div className="max-w-xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Explore our active travel services:
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
