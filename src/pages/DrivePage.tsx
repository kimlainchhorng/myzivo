/**
 * Drive with ZIVO - Internal driver signup/info page
 */
import { motion } from "framer-motion";
import { Car, DollarSign, Clock, Shield, MapPin, ChevronRight, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const benefits = [
  { icon: DollarSign, title: "Earn on your schedule", description: "Drive when you want, earn what you need. Weekly payouts directly to your account." },
  { icon: Clock, title: "Flexible hours", description: "No minimum hours required. Drive full-time or part-time — it's your call." },
  { icon: Shield, title: "Insurance coverage", description: "Comprehensive coverage while you're on a trip, giving you peace of mind." },
  { icon: MapPin, title: "Drive in your city", description: "Available in hundreds of cities. Sign up and start earning in your area." },
];

const stats = [
  { value: "500K+", label: "Active Drivers" },
  { value: "$25/hr", label: "Avg. Earnings" },
  { value: "4.9★", label: "Driver Rating" },
  { value: "50+", label: "Cities" },
];

export default function DrivePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-emerald-500/5 to-background py-20 lg:py-32">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-[20%] w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-[10%] w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Car className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Drive with ZIVO</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Turn your car into a{" "}
                <span className="text-primary">money machine</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of drivers earning on their own schedule. Sign up in minutes and start driving today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="h-14 px-8 text-base font-bold rounded-2xl shadow-xl shadow-primary/25">
                  Apply to Drive
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-2xl" asChild>
                  <Link to="/rides">Book a Ride Instead</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl lg:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why drive with ZIVO?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Everything you need to succeed as a driver, all in one platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-emerald-500/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start earning?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sign up takes just a few minutes. Start driving and earning this week.
          </p>
          <Button size="lg" className="h-14 px-10 text-base font-bold rounded-2xl shadow-xl shadow-primary/25">
            Get Started Now
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>
    </div>
  );
}
