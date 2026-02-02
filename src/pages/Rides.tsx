import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, CheckCircle2, Clock, MapPin, Shield, Star, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RideRequestForm from "@/components/rides/RideRequestForm";
import UserTestimonials from "@/components/shared/UserTestimonials";
import VehicleTypeGallery from "@/components/shared/VehicleTypeGallery";
import PhotoDestinationGrid from "@/components/shared/PhotoDestinationGrid";
import ImageHero from "@/components/shared/ImageHero";
import { cn } from "@/lib/utils";
import ServiceDisclaimer from "@/components/shared/ServiceDisclaimer";

export default function Rides() {
  const [submitted, setSubmitted] = useState(false);

  const features = [
    {
      icon: Clock,
      title: "Quick Response",
      description: "Get matched with available drivers in your area",
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
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero Section with ImageHero component */}
        <ImageHero service="rides" icon={Car}>
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Left Content - Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden lg:grid gap-4"
              >
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <feature.icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-white/70">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Right - Form Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-2 shadow-xl bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                      {!submitted ? (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2">Request a Ride</h2>
                            <p className="text-muted-foreground">
                              Fill in your details and we'll find you a driver.
                            </p>
                          </div>
                          <RideRequestForm onSuccess={() => setSubmitted(true)} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="py-12 text-center space-y-6"
                        >
                          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                          </div>
                          <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Request Received!</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                              We're matching you with available drivers in your area. 
                              You'll receive a confirmation message shortly.
                            </p>
                          </div>
                          <div className="pt-4 space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Check your email and phone for updates.
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => setSubmitted(false)}
                              className="mt-4"
                            >
                              Request Another Ride
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </ImageHero>

        {/* Vehicle Type Gallery */}
        <VehicleTypeGallery 
          service="rides" 
          title="Choose Your Ride"
          subtitle="Select the vehicle type that suits your needs"
          className="bg-muted/30"
        />

        {/* Popular Cities */}
        <PhotoDestinationGrid
          service="cars"
          title="Available Cities"
          subtitle="Request rides in these popular destinations"
          limit={8}
        />

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                How It <span className="text-emerald-400">Works</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Getting a ride with ZIVO is simple and straightforward
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Submit Request",
                  description: "Enter your pickup and drop-off locations along with your contact info",
                  image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&q=75&fm=webp",
                },
                {
                  step: "2",
                  title: "Get Matched",
                  description: "We'll find available drivers in your area and connect you",
                  image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop&q=75&fm=webp",
                },
                {
                  step: "3",
                  title: "Enjoy Your Ride",
                  description: "Your driver will contact you to confirm and complete the ride",
                  image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop&q=75&fm=webp",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group"
                >
                  {/* Step Photo */}
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-border/50">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <UserTestimonials />

        {/* Service Disclaimer */}
        <ServiceDisclaimer type="local" />
      </main>

      <Footer />
    </div>
  );
}
