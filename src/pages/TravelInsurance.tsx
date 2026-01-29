import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, 
  Check, 
  Plane, 
  Hotel, 
  Car, 
  Package, 
  AlertTriangle, 
  FileText, 
  Phone, 
  ChevronRight,
  ChevronLeft,
  Star, 
  Heart, 
  Clock, 
  DollarSign,
  Globe,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TravelInsurance = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("standard");

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: 29,
      period: "per trip",
      description: "Essential coverage for peace of mind",
      gradient: "from-slate-500 to-slate-600",
      glow: "shadow-slate-500/20",
      features: [
        "Trip cancellation up to $2,500",
        "Medical expenses up to $10,000",
        "Baggage loss up to $500",
        "24/7 emergency hotline",
      ],
      excluded: [
        "Adventure sports",
        "Pre-existing conditions",
        "Cancel for any reason",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      price: 59,
      period: "per trip",
      description: "Our most popular comprehensive coverage",
      recommended: true,
      gradient: "from-primary to-teal-400",
      glow: "shadow-primary/30",
      features: [
        "Trip cancellation up to $10,000",
        "Medical expenses up to $50,000",
        "Baggage loss up to $2,000",
        "Trip delay coverage",
        "Emergency evacuation",
        "24/7 emergency hotline",
      ],
      excluded: [
        "Pre-existing conditions",
        "Cancel for any reason",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 99,
      period: "per trip",
      description: "Maximum protection for worry-free travel",
      gradient: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/30",
      features: [
        "Trip cancellation up to $25,000",
        "Medical expenses up to $150,000",
        "Baggage loss up to $5,000",
        "Trip delay coverage",
        "Emergency evacuation",
        "Cancel for any reason (75% refund)",
        "Adventure sports covered",
        "Pre-existing conditions covered",
        "Concierge service",
        "24/7 emergency hotline",
      ],
      excluded: [],
    },
  ];

  const coverageTypes = [
    { icon: Plane, label: "Flights", description: "Flight delays & cancellations", gradient: "from-sky-500 to-blue-500" },
    { icon: Hotel, label: "Hotels", description: "Booking protection", gradient: "from-amber-500 to-orange-500" },
    { icon: Car, label: "Car Rentals", description: "Rental car coverage", gradient: "from-violet-500 to-purple-500" },
    { icon: Package, label: "Luggage", description: "Lost luggage protection", gradient: "from-emerald-500 to-green-500" },
  ];

  const stats = [
    { icon: Users, value: "2M+", label: "Customers Protected" },
    { icon: Globe, value: "195", label: "Countries Covered" },
    { icon: Star, value: "4.9", label: "Customer Rating" },
    { icon: Award, value: "A+", label: "Insurance Rating" },
  ];

  const benefits = [
    { icon: Clock, title: "Instant Coverage", description: "Protection starts immediately" },
    { icon: Phone, title: "24/7 Support", description: "Help when you need it" },
    { icon: DollarSign, title: "Fast Claims", description: "Get paid within 48 hours" },
    { icon: Star, title: "4.9 Rating", description: "Trusted by millions" },
  ];

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <Header />

      <main className="pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden">
          {/* Enhanced background effects */}
          <div className="absolute inset-0 bg-gradient-radial from-cyan-500/20 via-transparent to-transparent opacity-70" />
          <div className="absolute top-1/3 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-bl from-cyan-500/25 to-teal-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-gradient-to-tr from-primary/15 to-cyan-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Back Navigation */}
            <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-left-2 duration-300">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-2 text-muted-foreground hover:text-foreground touch-manipulation active:scale-95 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <Badge className="mb-6 bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0 px-5 py-2.5 text-sm font-bold shadow-xl shadow-cyan-500/40">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="w-4 h-4 mr-2" />
                  </motion.div>
                  New Service
                </Badge>
              </motion.div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight">
                Travel with{" "}
                <span className="bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                  Confidence
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
                Comprehensive travel insurance that covers <span className="text-foreground font-medium">trip cancellations</span>, medical emergencies, 
                lost luggage, and more. Peace of mind for every journey.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-xl shadow-cyan-500/40 hover:opacity-90 gap-2">
                    Get Protected Now
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl border-2 gap-2">
                    Compare Plans
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Coverage Types */}
        <section className="py-16 lg:py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                What We <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Cover</span>
              </h2>
              <p className="text-lg text-muted-foreground">Comprehensive protection for all aspects of your trip</p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {coverageTypes.map((type, index) => (
                <motion.div
                  key={type.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="text-center h-full border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="pt-8 pb-6 relative">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center shadow-lg`}
                      >
                        <type.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      <h3 className="font-bold text-xl mb-2">{type.label}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Choose Your <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Plan</span>
              </h2>
              <p className="text-lg text-muted-foreground">Select the coverage that fits your travel needs</p>
            </motion.div>
            
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid lg:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Label htmlFor={plan.id} className="cursor-pointer block h-full">
                    <Card className={`relative h-full transition-all overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card ${
                      selectedPlan === plan.id 
                        ? "ring-2 ring-primary shadow-2xl shadow-primary/20" 
                        : "shadow-xl hover:shadow-2xl"
                    }`}>
                      {plan.recommended && (
                        <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-teal-400 text-white border-0 px-4 py-1.5 font-semibold shadow-lg">
                          <Zap className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      )}
                      <CardHeader className="text-center pb-4 pt-8">
                        <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg ${plan.glow}`}>
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                        <div className="mt-4">
                          <span className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">${plan.price}</span>
                          <span className="text-muted-foreground">/{plan.period}</span>
                        </div>
                        <CardDescription className="mt-3 text-base">{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-emerald-500" />
                            </div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                        {plan.excluded.map((item) => (
                          <div key={item} className="flex items-start gap-3 text-muted-foreground">
                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                              <AlertTriangle className="h-3 w-3" />
                            </div>
                            <span className="text-sm line-through">{item}</span>
                          </div>
                        ))}
                      </CardContent>
                      <CardFooter className="pt-4 pb-6">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                          <Button 
                            className={`w-full h-12 font-bold rounded-xl ${
                              selectedPlan === plan.id 
                                ? "bg-gradient-to-r from-primary to-teal-400 text-white shadow-lg shadow-primary/30" 
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            {selectedPlan === plan.id ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Selected
                              </>
                            ) : "Select Plan"}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 lg:py-24 bg-muted/20">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5" />
                <CardContent className="p-8 lg:p-12 relative">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={benefit.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center"
                      >
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                        >
                          <benefit.icon className="h-8 w-8 text-white" />
                        </motion.div>
                        <h4 className="font-bold text-lg mb-1">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Ready to Travel <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Worry-Free?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10">Get instant coverage and peace of mind for your next trip</p>
              
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-block mb-10">
                <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-xl shadow-cyan-500/30 hover:opacity-90 gap-3">
                  Get Insured Now
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </motion.div>
              
              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <motion.div whileHover={{ y: -4 }}>
                  <Card className="cursor-pointer border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl transition-all group" onClick={() => navigate("/insurance")}>
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="h-7 w-7 text-cyan-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-bold text-lg">Full Policy Details</h4>
                        <p className="text-sm text-muted-foreground">Read complete terms</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-cyan-500 transition-colors" />
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div whileHover={{ y: -4 }}>
                  <Card className="cursor-pointer border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl transition-all group" onClick={() => navigate("/help#insurance")}>
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Heart className="h-7 w-7 text-cyan-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-bold text-lg">Claims & Support</h4>
                        <p className="text-sm text-muted-foreground">How to file a claim</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-cyan-500 transition-colors" />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TravelInsurance;