/**
 * ZIVO Move — Package & Moving Service Marketing Page
 * 
 * Marketing-only page that redirects to zivodriver.com
 * NO booking functionality on hizovo.com
 */

import { ArrowRight, Package, Truck, Clock, Shield, MapPin, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import heroMove from "@/assets/hero-move.jpg";
import serviceMove from "@/assets/service-move.jpg";
import { MobilityFeaturesGrid, MobilityComplianceFooter } from "@/components/mobility";

const ZIVO_DRIVER_URL = "https://zivo-driver-app.rork.app";

const features = [
  {
    icon: Package,
    title: "Package Delivery",
    description: "Send packages across town quickly and reliably",
  },
  {
    icon: Truck,
    title: "Moving Services",
    description: "Help with moving furniture and large items",
  },
  {
    icon: Clock,
    title: "Same-Day Service",
    description: "Fast delivery when you need it most",
  },
  {
    icon: Shield,
    title: "Insured & Tracked",
    description: "Your items are protected during transit",
  },
];

const benefits = [
  "Real-time tracking",
  "Verified drivers",
  "Secure handling",
  "Affordable pricing",
  "Multiple vehicle sizes",
  "Photo confirmation",
];

const howItWorks = [
  {
    step: 1,
    title: "Describe Your Delivery",
    description: "Tell us what you need moved and where it's going",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop&q=75&fm=webp",
  },
  {
    step: 2,
    title: "Get Matched",
    description: "We connect you with a qualified driver in your area",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=300&fit=crop&q=75&fm=webp",
  },
  {
    step: 3,
    title: "Track & Receive",
    description: "Follow your delivery in real-time until it arrives",
    image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&h=300&fit=crop&q=75&fm=webp",
  },
];

export default function Move() {
  const handleOpenZivoDriver = () => {
    window.open(ZIVO_DRIVER_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="ZIVO Move — Package Delivery & Moving Services"
        description="Send packages and get moving help with ZIVO Move. Fast, reliable, and insured delivery services through our driver network."
      />

      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroMove}
              alt="ZIVO Move - Package delivery and moving services"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 py-16">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">ZIVO Move</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Send Packages.
                <br />
                <span className="text-primary">Move Things.</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Fast and reliable delivery services for packages of all sizes. 
                From small parcels to furniture moving — ZIVO drivers have you covered.
              </p>

              {/* CTA Button */}
              <Button
                onClick={handleOpenZivoDriver}
                size="lg"
                className="h-14 px-8 text-lg rounded-2xl font-bold gap-3 shadow-lg"
              >
                Open ZIVO Driver
                <ExternalLink className="w-5 h-5" />
              </Button>

              <p className="mt-4 text-sm text-muted-foreground">
                You'll be redirected to zivodriver.com to request delivery
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why Choose <span className="text-primary">ZIVO Move</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Professional delivery services powered by our trusted driver network
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <Card 
                  key={feature.title}
                  className="border-2 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Service Image + Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={serviceMove}
                  alt="ZIVO Move delivery van"
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
              </div>

              {/* Benefits */}
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Delivery Made <span className="text-primary">Simple</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Our network of verified drivers provides reliable delivery services 
                  for packages of all sizes. Whether you're sending a small parcel across 
                  town or need help moving furniture, ZIVO Move connects you with the 
                  right driver for the job.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleOpenZivoDriver}
                  size="lg"
                  className="rounded-2xl font-bold gap-2"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                How It <span className="text-primary">Works</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Request a delivery in just a few simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {howItWorks.map((item, index) => (
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
                    <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
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

        {/* Mobility Services Grid */}
        <MobilityFeaturesGrid className="bg-muted/20" showDriverCTA={true} />

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <Package className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Send a Package?
              </h2>
              <p className="text-muted-foreground mb-8">
                Open ZIVO Driver to request delivery services in your area. 
                Fast, reliable, and tracked.
              </p>
              <Button
                onClick={handleOpenZivoDriver}
                size="lg"
                className="h-14 px-10 text-lg rounded-2xl font-bold gap-3 shadow-lg"
              >
                Open ZIVO Driver
                <ExternalLink className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Compliance Footer */}
        <MobilityComplianceFooter />
      </main>

      <Footer />
    </div>
  );
}
