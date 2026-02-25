import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Baby, Gamepad2, UtensilsCrossed, Bed, Waves, TreePine, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const amenities = [
  {
    id: 1,
    name: "Kids' Club",
    description: "Supervised activities for ages 4-12",
    icon: Gamepad2,
    hours: "9 AM - 6 PM",
    included: true,
    color: "text-purple-400"
  },
  {
    id: 2,
    name: "Children's Pool",
    description: "Shallow pool with water features",
    icon: Waves,
    hours: "8 AM - 8 PM",
    included: true,
    color: "text-blue-400"
  },
  {
    id: 3,
    name: "Kids' Menu",
    description: "Healthy, kid-friendly options",
    icon: UtensilsCrossed,
    hours: "All day dining",
    included: true,
    color: "text-amber-400"
  },
  {
    id: 4,
    name: "Babysitting Service",
    description: "Certified caregivers available",
    icon: Baby,
    hours: "On request",
    included: false,
    price: "$25/hour",
    color: "text-pink-400"
  },
  {
    id: 5,
    name: "Playground",
    description: "Safe outdoor play area",
    icon: TreePine,
    hours: "Dawn to Dusk",
    included: true,
    color: "text-emerald-400"
  },
  {
    id: 6,
    name: "Cribs & Rollaway Beds",
    description: "Complimentary upon request",
    icon: Bed,
    hours: "24/7",
    included: true,
    color: "text-sky-400"
  }
];

export default function HotelKidsAmenities() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center">
              <Baby className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Family Friendly</CardTitle>
              <p className="text-sm text-muted-foreground">Kids' amenities & services</p>
            </div>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 border-0">
            <Star className="w-3 h-3 mr-1" />
            Family Certified
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-muted/20 border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                "bg-gradient-to-br from-current/10 to-current/5",
                amenity.color
              )}>
                <amenity.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{amenity.name}</h4>
                  {amenity.included ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                      <Check className="w-3 h-3 mr-0.5" />
                      Included
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {amenity.price}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{amenity.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">⏰ {amenity.hours}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            🎁 Kids Stay & Eat Free
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Children under 12 stay free when sharing a room with parents. Free meals from the kids' menu included!
          </p>
          <Button size="sm" variant="outline" className="w-full">
            View Family Packages
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
