import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
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
  CheckCircle,
  Phone,
  Mail,
  ArrowUpRight
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
      bgColor: "bg-eats/10",
    },
    {
      id: "standard",
      name: "Standard",
      time: "Same day",
      price: "From $8",
      icon: Truck,
      description: "Reliable same-day delivery",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: "economy",
      name: "Economy",
      time: "Next day",
      price: "From $5",
      icon: Box,
      description: "Budget-friendly option",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  const features = [
    { icon: Shield, title: "Insurance Included", description: "Up to $500 coverage on all packages" },
    { icon: MapPin, title: "Real-time Tracking", description: "Track every step of the journey" },
    { icon: Clock, title: "Flexible Scheduling", description: "Pick your preferred time slot" },
    { icon: Scale, title: "Any Size", description: "From envelopes to large boxes" },
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
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-eats/10 via-transparent to-transparent opacity-50" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-eats/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge className="mb-4 bg-eats/10 text-eats">New Service</Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Send Packages <span className="text-gradient-eats">Anywhere</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                From documents to large boxes, we deliver it all with real-time tracking, 
                insurance included, and flexible delivery options.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="eats" size="lg" className="gap-2">
                  Schedule Pickup
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  Get a Quote
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center hover:border-eats/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-eats flex items-center justify-center">
                        <feature.icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-eats flex items-center justify-center">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Schedule a Pickup</CardTitle>
                      <CardDescription>Enter pickup and delivery details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Locations */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-semibold">Pickup Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Enter pickup location" className="pl-11 h-12" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Delivery Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-eats" />
                        <Input placeholder="Enter delivery location" className="pl-11 h-12" />
                      </div>
                    </div>
                  </div>

                  {/* Package Type Selection */}
                  <div className="space-y-3">
                    <Label className="font-semibold">Delivery Speed</Label>
                    <RadioGroup value={packageType} onValueChange={setPackageType} className="grid md:grid-cols-3 gap-4">
                      {packageOptions.map((option) => (
                        <Label
                          key={option.id}
                          htmlFor={option.id}
                          className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                            packageType === option.id 
                              ? "border-eats bg-eats/5 shadow-lg" 
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                          <div className={`w-12 h-12 rounded-xl ${option.bgColor} flex items-center justify-center`}>
                            <option.icon className={`h-6 w-6 ${option.color}`} />
                          </div>
                          <span className="font-semibold text-lg">{option.name}</span>
                          <span className="text-sm text-muted-foreground">{option.time}</span>
                          <span className="font-bold text-eats text-lg">{option.price}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Package Details */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Package Size</Label>
                      <Input placeholder="e.g., Small box" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Weight (kg)</Label>
                      <Input type="number" placeholder="0.5" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Contents</Label>
                      <Input placeholder="e.g., Documents" className="h-12" />
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Special Instructions (Optional)</Label>
                    <Textarea placeholder="Any special handling instructions..." className="min-h-[100px]" />
                  </div>

                  <Button variant="eats" className="w-full h-14 text-lg" size="lg">
                    Get Quote & Schedule
                    <ChevronRight className="ml-2 h-6 w-6" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Quick answers to common questions</p>
            </motion.div>
            
            <div className="grid gap-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                      <p className="text-muted-foreground">{faq.a}</p>
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
              <Card className="cursor-pointer hover:border-eats transition-colors group" onClick={() => navigate("/terms-of-service#delivery")}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-eats/10 transition-colors">
                    <FileText className="h-6 w-6 text-muted-foreground group-hover:text-eats" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Delivery Terms & Conditions</h4>
                    <p className="text-sm text-muted-foreground">View our package delivery policies</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-eats" />
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-eats transition-colors group" onClick={() => navigate("/help#delivery")}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-eats/10 transition-colors">
                    <Gift className="h-6 w-6 text-muted-foreground group-hover:text-eats" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Prohibited Items Guide</h4>
                    <p className="text-sm text-muted-foreground">What we can and can't deliver</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-eats" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PackageDelivery;
