import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Star, Users, Heart, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const spaServices = [
  {
    id: 1,
    name: "Signature Massage",
    category: "Massage",
    duration: 60,
    price: 150,
    rating: 4.9,
    description: "Full body relaxation with aromatic oils",
    icon: "💆",
    popular: true
  },
  {
    id: 2,
    name: "Couples Retreat",
    category: "Couples",
    duration: 90,
    price: 280,
    rating: 4.8,
    description: "Side-by-side massage for two",
    icon: "💑",
    popular: true
  },
  {
    id: 3,
    name: "Deep Tissue Therapy",
    category: "Massage",
    duration: 75,
    price: 175,
    rating: 4.7,
    description: "Intensive muscle tension relief",
    icon: "💪"
  },
  {
    id: 4,
    name: "Organic Facial",
    category: "Facial",
    duration: 45,
    price: 120,
    rating: 4.8,
    description: "Revitalizing skin treatment",
    icon: "✨"
  },
  {
    id: 5,
    name: "Hot Stone Therapy",
    category: "Massage",
    duration: 90,
    price: 195,
    rating: 4.9,
    description: "Heated volcanic stones relaxation",
    icon: "🪨"
  }
];

const categories = ["All", "Massage", "Facial", "Couples"];

export default function HotelSpaServices() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const filteredServices = selectedCategory === "All" 
    ? spaServices 
    : spaServices.filter(s => s.category === selectedCategory);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Spa & Wellness</CardTitle>
              <p className="text-sm text-muted-foreground">Rejuvenate during your stay</p>
            </div>
          </div>
          <Badge className="bg-pink-500/20 text-pink-400 border-0">
            <Leaf className="w-3 h-3 mr-1" />
            Eco-Friendly
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all",
                selectedService === service.id
                  ? "border-pink-500/50 bg-pink-500/10"
                  : "border-border/50 bg-muted/20 hover:border-border"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {service.name}
                      {service.popular && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">
                          <Heart className="w-3 h-3 mr-0.5" />
                          Popular
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${service.price}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {service.duration} min
                  </div>
                </div>
              </div>

              {selectedService === service.id && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium">{service.rating}</span>
                      <span className="text-xs text-muted-foreground">(120+ reviews)</span>
                    </div>
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                      Book Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
          <p className="text-sm text-center">
            <Users className="w-4 h-4 inline mr-1" />
            Book 2+ treatments & get <span className="text-pink-400 font-medium">15% off</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
