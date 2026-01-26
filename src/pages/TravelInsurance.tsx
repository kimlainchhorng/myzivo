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
  Star, 
  Heart, 
  Clock, 
  DollarSign,
  Globe,
  Users,
  Award,
  ArrowRight
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
      color: "border-muted-foreground",
      bgColor: "bg-muted",
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
      color: "border-primary",
      bgColor: "gradient-rides",
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
      color: "border-amber-500",
      bgColor: "bg-gradient-to-br from-amber-500 to-amber-600",
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
    { icon: Plane, label: "Flights", description: "Flight delays & cancellations" },
    { icon: Hotel, label: "Hotels", description: "Booking protection" },
    { icon: Car, label: "Car Rentals", description: "Rental car coverage" },
    { icon: Package, label: "Luggage", description: "Lost luggage protection" },
  ];

  const stats = [
    { icon: Users, value: "2M+", label: "Customers Protected" },
    { icon: Globe, value: "195", label: "Countries Covered" },
    { icon: Star, value: "4.9", label: "Customer Rating" },
    { icon: Award, value: "A+", label: "Insurance Rating" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <Badge className="mb-4 bg-primary/10 text-primary">New Service</Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Travel with <span className="text-gradient-rides">Confidence</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Comprehensive travel insurance that covers trip cancellations, medical emergencies, 
                lost luggage, and more. Peace of mind for every journey.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="hero" size="lg" className="gap-2">
                  Get Protected Now
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  Compare Plans
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl gradient-rides flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Coverage Types */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">What We Cover</h2>
              <p className="text-muted-foreground">Comprehensive protection for all aspects of your trip</p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {coverageTypes.map((type, index) => (
                <motion.div
                  key={type.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center h-full hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="pt-6">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-rides flex items-center justify-center group-hover:scale-110 transition-transform">
                        <type.icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
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
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-muted-foreground">Select the coverage that fits your travel needs</p>
            </motion.div>
            
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid lg:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Label htmlFor={plan.id} className="cursor-pointer block h-full">
                    <Card className={`relative h-full transition-all ${
                      selectedPlan === plan.id 
                        ? `${plan.color} border-2 shadow-xl` 
                        : "border hover:border-muted-foreground"
                    }`}>
                      {plan.recommended && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                          Most Popular
                        </Badge>
                      )}
                      <CardHeader className="text-center pb-4">
                        <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <div className="mt-4">
                          <span className="text-5xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">/{plan.period}</span>
                        </div>
                        <CardDescription className="mt-3">{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-success" />
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
                      <CardFooter className="pt-4">
                        <Button 
                          variant={selectedPlan === plan.id ? "hero" : "outline"} 
                          className="w-full h-12"
                        >
                          {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 bg-gradient-to-r from-primary/10 via-rides/5 to-eats/10">
                <CardContent className="p-8">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    <div>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-rides flex items-center justify-center">
                        <Clock className="h-7 w-7 text-white" />
                      </div>
                      <h4 className="font-semibold text-lg mb-1">Instant Coverage</h4>
                      <p className="text-sm text-muted-foreground">Protection starts immediately</p>
                    </div>
                    <div>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-rides flex items-center justify-center">
                        <Phone className="h-7 w-7 text-white" />
                      </div>
                      <h4 className="font-semibold text-lg mb-1">24/7 Support</h4>
                      <p className="text-sm text-muted-foreground">Help when you need it</p>
                    </div>
                    <div>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-rides flex items-center justify-center">
                        <DollarSign className="h-7 w-7 text-white" />
                      </div>
                      <h4 className="font-semibold text-lg mb-1">Fast Claims</h4>
                      <p className="text-sm text-muted-foreground">Get paid within 48 hours</p>
                    </div>
                    <div>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-rides flex items-center justify-center">
                        <Star className="h-7 w-7 text-white" />
                      </div>
                      <h4 className="font-semibold text-lg mb-1">4.9 Rating</h4>
                      <p className="text-sm text-muted-foreground">Trusted by millions</p>
                    </div>
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
              <h2 className="font-display text-3xl font-bold mb-4">Ready to Travel Worry-Free?</h2>
              <p className="text-muted-foreground mb-8">Get instant coverage and peace of mind for your next trip</p>
              
              <Button variant="hero" size="lg" className="h-14 px-8 text-lg gap-2 mb-8">
                Get Insured Now
                <ArrowRight className="w-5 h-5" />
              </Button>
              
              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card className="cursor-pointer hover:border-primary transition-colors group" onClick={() => navigate("/insurance")}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold">Full Policy Details</h4>
                      <p className="text-sm text-muted-foreground">Read complete terms</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary transition-colors group" onClick={() => navigate("/help#insurance")}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Heart className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold">Claims & Support</h4>
                      <p className="text-sm text-muted-foreground">How to file a claim</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </CardContent>
                </Card>
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
