import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, Clock, Shield, Zap, ChevronRight, Scale, Truck, Box, Gift, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

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
    },
    {
      id: "standard",
      name: "Standard",
      time: "Same day",
      price: "From $8",
      icon: Truck,
      description: "Reliable same-day delivery",
      color: "text-primary",
    },
    {
      id: "economy",
      name: "Economy",
      time: "Next day",
      price: "From $5",
      icon: Box,
      description: "Budget-friendly option",
      color: "text-muted-foreground",
    },
  ];

  const features = [
    { icon: Shield, title: "Insurance Included", description: "Up to $500 coverage" },
    { icon: MapPin, title: "Real-time Tracking", description: "Track every step" },
    { icon: Clock, title: "Flexible Scheduling", description: "Pick your time slot" },
    { icon: Scale, title: "Any Size", description: "Small to large packages" },
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
            <div className="w-10 h-10 rounded-xl gradient-eats flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Package Delivery</h1>
              <p className="text-sm text-muted-foreground">Send packages across the city</p>
            </div>
          </div>
          <Badge className="ml-auto bg-primary/10 text-primary">New Service</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl font-bold mb-4">
            Send Packages <span className="text-gradient-eats">Anywhere</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From documents to large boxes, we deliver it all. Real-time tracking, 
            insurance included, and flexible delivery options.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardContent className="pt-6">
                <feature.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Schedule a Pickup</CardTitle>
              <CardDescription>Enter pickup and delivery details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Locations */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pickup Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Enter pickup location" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-eats" />
                    <Input placeholder="Enter delivery location" className="pl-10" />
                  </div>
                </div>
              </div>

              {/* Package Type Selection */}
              <div className="space-y-3">
                <Label>Delivery Speed</Label>
                <RadioGroup value={packageType} onValueChange={setPackageType} className="grid md:grid-cols-3 gap-4">
                  {packageOptions.map((option) => (
                    <Label
                      key={option.id}
                      htmlFor={option.id}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        packageType === option.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                      <option.icon className={`h-6 w-6 ${option.color}`} />
                      <span className="font-semibold">{option.name}</span>
                      <span className="text-xs text-muted-foreground">{option.time}</span>
                      <span className="font-bold text-primary">{option.price}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Package Details */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Package Size</Label>
                  <Input placeholder="e.g., Small box" />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" placeholder="0.5" />
                </div>
                <div className="space-y-2">
                  <Label>Contents</Label>
                  <Input placeholder="e.g., Documents" />
                </div>
              </div>

              <Button variant="hero" className="w-full" size="lg">
                Get Quote & Schedule
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4 mt-8"
        >
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/terms-of-service#delivery")}>
            <CardContent className="flex items-center gap-4 py-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <h4 className="font-semibold">Delivery Terms</h4>
                <p className="text-sm text-muted-foreground">View our package delivery policies</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/help#delivery")}>
            <CardContent className="flex items-center gap-4 py-4">
              <Gift className="h-8 w-8 text-muted-foreground" />
              <div>
                <h4 className="font-semibold">Prohibited Items</h4>
                <p className="text-sm text-muted-foreground">What we can and can't deliver</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default PackageDelivery;
