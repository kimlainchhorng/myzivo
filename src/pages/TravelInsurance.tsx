import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Check, Plane, Hotel, Car, Package, AlertTriangle, FileText, Phone, ChevronRight, Star, Heart, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
      color: "border-muted",
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
    { icon: Plane, label: "Flights", description: "Flight delays, cancellations" },
    { icon: Hotel, label: "Hotels", description: "Booking protection" },
    { icon: Car, label: "Car Rentals", description: "Rental car coverage" },
    { icon: Package, label: "Packages", description: "Lost luggage protection" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-rides flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Travel Insurance</h1>
              <p className="text-sm text-muted-foreground">Protect your journey</p>
            </div>
          </div>
          <Badge className="ml-auto bg-primary/10 text-primary">New Service</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl font-bold mb-4">
            Travel with <span className="text-gradient-rides">Confidence</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive travel insurance that covers trip cancellations, medical emergencies, 
            lost luggage, and more. Peace of mind for every journey.
          </p>
        </motion.div>

        {/* Coverage Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {coverageTypes.map((type) => (
            <Card key={type.label} className="text-center hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <type.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold">{type.label}</h3>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="font-display text-2xl font-bold text-center mb-6">Choose Your Plan</h3>
          
          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Label key={plan.id} htmlFor={plan.id} className="cursor-pointer">
                <Card className={`relative h-full transition-all ${
                  selectedPlan === plan.id 
                    ? `${plan.color} border-2 shadow-lg` 
                    : "border hover:border-muted-foreground"
                }`}>
                  {plan.recommended && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2">
                    <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.excluded.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="text-sm line-through">{item}</span>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={selectedPlan === plan.id ? "hero" : "outline"} 
                      className="w-full"
                    >
                      {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                    </Button>
                  </CardFooter>
                </Card>
              </Label>
            ))}
          </RadioGroup>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-rides/5 border-0">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">Instant Coverage</h4>
                  <p className="text-sm text-muted-foreground">Protection starts immediately</p>
                </div>
                <div>
                  <Phone className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">24/7 Support</h4>
                  <p className="text-sm text-muted-foreground">Help when you need it</p>
                </div>
                <div>
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">Fast Claims</h4>
                  <p className="text-sm text-muted-foreground">Get paid within 48 hours</p>
                </div>
                <div>
                  <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">4.9 Rating</h4>
                  <p className="text-sm text-muted-foreground">Trusted by millions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA & Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-4"
        >
          <Button variant="hero" size="lg" className="w-full">
            Get Insured Now
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/insurance")}>
              <CardContent className="flex items-center gap-4 py-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold text-sm">Full Policy Details</h4>
                  <p className="text-xs text-muted-foreground">Read complete terms & conditions</p>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/help#insurance")}>
              <CardContent className="flex items-center gap-4 py-4">
                <Heart className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold text-sm">Claims & Support</h4>
                  <p className="text-xs text-muted-foreground">How to file a claim</p>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TravelInsurance;
