/**
 * ZIVO Rides — Marketing Landing Page
 * 
 * Marketing-only page that redirects to zivodriver.com
 * NO ride request functionality on hizovo.com
 */

import { ArrowRight, Car, Clock, Shield, MapPin, CheckCircle, ExternalLink, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import heroRides from "@/assets/hero-rides.jpg";
import serviceRides from "@/assets/service-rides.jpg";

const ZIVO_DRIVER_URL = "https://zivo-driver-app.rork.app";

const features = [
  {
    icon: Clock,
    title: "Quick Pickup",
    description: "Get matched with drivers in your area fast",
  },
  {
    icon: Shield,
    title: "Safe & Reliable",
    description: "Verified drivers with quality vehicles",
  },
  {
    icon: Star,
    title: "Top-Rated Service",
    description: "Professional drivers committed to quality",
  },
  {
    icon: MapPin,
    title: "Airport Transfers",
    description: "Reliable pickup and drop-off at airports",
  },
];

const benefits = [
  "Real-time tracking",
  "Verified drivers",
  "Upfront pricing",
  "Multiple vehicle options",
  "24/7 availability",
  "Easy payment",
];

const vehicleTypes = [
  {
    name: "Standard",
    description: "Affordable everyday rides",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&q=75&fm=webp",
  },
  {
    name: "Comfort",
    description: "More space and comfort",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&q=75&fm=webp",
  },
  {
    name: "Premium",
    description: "Luxury vehicles for special occasions",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop&q=75&fm=webp",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Set Your Pickup",
    description: "Enter your pickup location and destination",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&q=75&fm=webp",
  },
  {
    step: 2,
    title: "Choose Your Ride",
    description: "Select from available vehicle options",
    image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop&q=75&fm=webp",
  },
  {
    step: 3,
    title: "Enjoy Your Trip",
    description: "Track your driver and enjoy the ride",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop&q=75&fm=webp",
  },
];

export default function Rides() {
  const handleOpenZivoDriver = () => {
    window.open(ZIVO_DRIVER_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="ZIVO Rides — Request a Ride"
        description="Get a ride anywhere with ZIVO. Fast, reliable, and safe rides with verified drivers. Airport transfers and city rides."
      />

      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroRides}
              alt="ZIVO Rides - Request a ride anywhere"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 py-16">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rides/10 border border-rides/20 mb-6">
                <Car className="w-4 h-4 text-rides" />
                <span className="text-sm font-medium text-rides">ZIVO Rides</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Get a Ride.
                <br />
                <span className="text-rides">Anytime.</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Fast, reliable rides at the tap of a button. From airport transfers 
                to city trips — our verified drivers are ready to take you there.
              </p>

              {/* CTA Button */}
              <Button
                onClick={handleOpenZivoDriver}
                size="lg"
                className="h-14 px-8 text-lg rounded-2xl font-bold gap-3 bg-rides hover:bg-rides/90 shadow-lg"
              >
                Open ZIVO Driver
                <ExternalLink className="w-5 h-5" />
              </Button>

              <p className="mt-4 text-sm text-muted-foreground">
                You'll be redirected to zivodriver.com to request a ride
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why Choose <span className="text-rides">ZIVO Rides</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Safe, reliable transportation when you need it
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {features.map((feature) => (
                <Card 
                  key={feature.title}
                  className="border-2 hover:border-rides/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-rides/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-rides" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Vehicle Types */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Choose Your <span className="text-rides">Ride</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Multiple vehicle options to suit your needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {vehicleTypes.map((vehicle) => (
                <Card 
                  key={vehicle.name}
                  className="overflow-hidden border-2 hover:border-rides/30 transition-all duration-300 group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-bold text-xl">{vehicle.name}</h3>
                      <p className="text-sm text-white/80">{vehicle.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Service Image + Benefits */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={serviceRides}
                  alt="ZIVO Rides service"
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
              </div>

              {/* Benefits */}
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Rides Made <span className="text-rides">Simple</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Our network of verified drivers provides reliable transportation 
                  whenever you need it. Whether you're heading to the airport, 
                  running errands, or going out for the night — ZIVO Rides has 
                  you covered.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-rides/10 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-rides" />
                      </div>
                      <span className="text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleOpenZivoDriver}
                  size="lg"
                  className="rounded-2xl font-bold gap-2 bg-rides hover:bg-rides/90"
                >
                  Request a Ride
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                How It <span className="text-rides">Works</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Getting a ride is easy
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {howItWorks.map((item) => (
                <div key={item.step} className="group">
                  {/* Step Photo */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-border shadow-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-rides flex items-center justify-center text-white font-bold text-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-rides/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <Car className="w-16 h-16 text-rides mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Ride?
              </h2>
              <p className="text-muted-foreground mb-8">
                Open ZIVO Driver to request a ride in your area. 
                Fast, reliable, and safe.
              </p>
              <Button
                onClick={handleOpenZivoDriver}
                size="lg"
                className="h-14 px-10 text-lg rounded-2xl font-bold gap-3 bg-rides hover:bg-rides/90 shadow-lg"
              >
                Open ZIVO Driver
                <ExternalLink className="w-5 h-5" />
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">
                Transportation services are provided by independent drivers using the ZIVO platform.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
