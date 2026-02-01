import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, CheckCircle2, Clock, MapPin, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RideRequestForm from "@/components/rides/RideRequestForm";
import { cn } from "@/lib/utils";

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

      <main className="flex-1 pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-teal-500/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Content */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Car className="h-4 w-4" />
                    ZIVO Rides
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    Your Ride,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">
                      On Demand
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                    Request a ride and we'll connect you with available drivers in your area. 
                    No upfront payment required.
                  </p>
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="grid gap-4"
                >
                  {features.map((feature, index) => (
                    <div
                      key={feature.title}
                      className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right - Form Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-2 shadow-xl bg-card/80 backdrop-blur-sm">
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
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
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
                },
                {
                  step: "2",
                  title: "Get Matched",
                  description: "We'll find available drivers in your area and connect you",
                },
                {
                  step: "3",
                  title: "Enjoy Your Ride",
                  description: "Your driver will contact you to confirm and complete the ride",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
