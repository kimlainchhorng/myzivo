import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, 
  MapPin, 
  Clock, 
  Shield, 
  Zap, 
  ChevronRight, 
  Scale, 
  Truck, 
  Box, 
  Gift, 
  FileText,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Phone,
  Timer,
  Star,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PackageDelivery = () => {
  const navigate = useNavigate();
  const [packageType, setPackageType] = useState("standard");

  const packageOptions = [
    {
      id: "express",
      name: "Express",
      time: "1-2 hours",
      price: "From $15",
      icon: Zap,
      description: "Fastest delivery within city",
      color: "text-eats",
      bgColor: "bg-gradient-to-br from-eats/20 to-orange-500/10",
      gradient: "from-eats to-orange-500",
      glow: "shadow-eats/30",
      popular: true,
    },
    {
      id: "standard",
      name: "Standard",
      time: "Same day",
      price: "From $8",
      icon: Truck,
      description: "Reliable same-day delivery",
      color: "text-primary",
      bgColor: "bg-gradient-to-br from-primary/20 to-teal-500/10",
      gradient: "from-primary to-teal-400",
      glow: "shadow-primary/30",
      popular: false,
    },
    {
      id: "economy",
      name: "Economy",
      time: "Next day",
      price: "From $5",
      icon: Box,
      description: "Budget-friendly option",
      color: "text-muted-foreground",
      bgColor: "bg-gradient-to-br from-muted/40 to-muted/20",
      gradient: "from-slate-500 to-slate-400",
      glow: "shadow-slate-500/20",
      popular: false,
    },
  ];

  const features = [
    { icon: Shield, title: "Insurance Included", description: "Up to $500 coverage on all packages", color: "from-emerald-500 to-green-400" },
    { icon: MapPin, title: "Real-time Tracking", description: "Track every step of the journey", color: "from-sky-500 to-blue-400" },
    { icon: Clock, title: "Flexible Scheduling", description: "Pick your preferred time slot", color: "from-violet-500 to-purple-400" },
    { icon: Scale, title: "Any Size", description: "From envelopes to large boxes", color: "from-amber-500 to-orange-400" },
  ];

  const stats = [
    { value: "50K+", label: "Deliveries", icon: Package },
    { value: "4.9", label: "Rating", icon: Star },
    { value: "15min", label: "Avg Pickup", icon: Timer },
    { value: "99%", label: "On Time", icon: TrendingUp },
  ];

  const faqs = [
    { q: "What can I send?", a: "Documents, retail items, gifts, food (non-perishable), and more." },
    { q: "Is my package insured?", a: "Yes! All packages include up to $500 insurance coverage." },
    { q: "How do I track my package?", a: "Real-time tracking via SMS, email, or the ZIVO app." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-radial from-eats/10 via-transparent to-transparent opacity-60" />
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-eats/20 to-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-teal-500/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge className="mb-6 bg-gradient-to-r from-eats/20 to-orange-500/20 text-eats border-eats/30 px-4 py-2 text-sm font-semibold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  New Service
                </Badge>
              </motion.div>
              
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Send Packages{" "}
                <span className="bg-gradient-to-r from-eats to-orange-500 bg-clip-text text-transparent">
                  Anywhere
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                From documents to large boxes, we deliver it all with real-time tracking, 
                insurance included, and flexible delivery options.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg font-bold rounded-2xl bg-gradient-to-r from-eats to-orange-500 text-white shadow-xl shadow-eats/30 hover:opacity-90 gap-2"
                  >
                    Schedule Pickup
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold rounded-2xl border-2 gap-2">
                    Get a Quote
                  </Button>
                </motion.div>
              </div>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-eats/20 to-orange-500/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-eats" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gradient-to-b from-muted/30 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Why Choose ZIVO Delivery?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Premium features for every package</p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <Card className="h-full text-center border-0 bg-gradient-to-br from-card/90 to-card shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    <CardContent className="pt-8 pb-6 relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
                      >
                        <feature.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card/95 to-card">
                <CardHeader className="bg-gradient-to-r from-eats/10 to-orange-500/5 border-b border-border/50 p-6">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-eats to-orange-500 flex items-center justify-center shadow-lg shadow-eats/30"
                    >
                      <Package className="h-7 w-7 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl font-bold">Schedule a Pickup</CardTitle>
                      <CardDescription>Enter pickup and delivery details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Locations */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Pickup Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Enter pickup location" className="pl-12 h-14 rounded-xl text-base bg-muted/30 border-border/50 focus:border-eats/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Delivery Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-eats" />
                        <Input placeholder="Enter delivery location" className="pl-12 h-14 rounded-xl text-base bg-muted/30 border-border/50 focus:border-eats/50" />
                      </div>
                    </div>
                  </div>

                  {/* Package Type Selection */}
                  <div className="space-y-4">
                    <Label className="font-semibold text-sm">Delivery Speed</Label>
                    <RadioGroup value={packageType} onValueChange={setPackageType} className="grid md:grid-cols-3 gap-4">
                      {packageOptions.map((option) => (
                        <Label
                          key={option.id}
                          htmlFor={option.id}
                          className="relative cursor-pointer"
                        >
                          <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                          <motion.div
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                              packageType === option.id 
                                ? `border-eats ${option.bgColor} shadow-xl ${option.glow}` 
                                : "border-border/50 hover:border-muted-foreground/50 bg-muted/20"
                            }`}
                          >
                            {option.popular && (
                              <Badge className="absolute -top-2 right-3 bg-gradient-to-r from-eats to-orange-500 text-white border-0 text-xs px-2">
                                Popular
                              </Badge>
                            )}
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg ${option.glow}`}>
                              <option.icon className="h-7 w-7 text-white" />
                            </div>
                            <span className="font-bold text-lg">{option.name}</span>
                            <span className="text-sm text-muted-foreground">{option.time}</span>
                            <span className="font-bold text-eats text-xl">{option.price}</span>
                          </motion.div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Package Details */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Package Size</Label>
                      <Input placeholder="e.g., Small box" className="h-12 rounded-xl bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Weight (kg)</Label>
                      <Input type="number" placeholder="0.5" className="h-12 rounded-xl bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Contents</Label>
                      <Input placeholder="e.g., Documents" className="h-12 rounded-xl bg-muted/30 border-border/50" />
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">Special Instructions (Optional)</Label>
                    <Textarea placeholder="Any special handling instructions..." className="min-h-[100px] rounded-xl bg-muted/30 border-border/50 resize-none" />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-eats to-orange-500 text-white shadow-xl shadow-eats/30 hover:opacity-90 gap-2">
                      <Sparkles className="w-5 h-5" />
                      Get Quote & Schedule
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </motion.div>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-8 pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>Insured</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Verified Drivers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-gradient-to-b from-muted/30 to-transparent">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Quick answers to common questions</p>
            </motion.div>
            
            <div className="grid gap-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-eats/20 to-orange-500/10 flex items-center justify-center">
                          <span className="text-eats font-bold text-sm">Q</span>
                        </div>
                        {faq.q}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed pl-11">{faq.a}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Policy Links */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Card 
                  className="cursor-pointer border-0 bg-gradient-to-br from-card/90 to-card shadow-lg hover:shadow-xl transition-all group" 
                  onClick={() => navigate("/terms-of-service#delivery")}
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center group-hover:from-eats/20 group-hover:to-orange-500/10 transition-all">
                      <FileText className="h-7 w-7 text-muted-foreground group-hover:text-eats transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base">Delivery Terms & Conditions</h4>
                      <p className="text-sm text-muted-foreground">View our package delivery policies</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-eats transition-colors" />
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Card 
                  className="cursor-pointer border-0 bg-gradient-to-br from-card/90 to-card shadow-lg hover:shadow-xl transition-all group" 
                  onClick={() => navigate("/help#delivery")}
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center group-hover:from-eats/20 group-hover:to-orange-500/10 transition-all">
                      <Gift className="h-7 w-7 text-muted-foreground group-hover:text-eats transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base">Prohibited Items Guide</h4>
                      <p className="text-sm text-muted-foreground">What we can and can't deliver</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-eats transition-colors" />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PackageDelivery;
