import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Hotel, 
  Car, 
  ArrowRight, 
  MapPin, 
  Calendar,
  Fuel,
  Sparkles,
  Shield,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HotelToCarBridgeProps {
  hotelLocation?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  className?: string;
}

const suggestedCars = [
  { id: "1", name: "Economy", type: "Toyota Corolla", price: 45, feature: "Best Value" },
  { id: "2", name: "SUV", type: "Honda CR-V", price: 75, feature: "Family Pick" },
  { id: "3", name: "Luxury", type: "BMW 5 Series", price: 120, feature: "Premium" },
];

const HotelToCarBridge = ({ 
  hotelLocation = "Paris",
  checkInDate,
  checkOutDate,
  className 
}: HotelToCarBridgeProps) => {
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState<string | null>(null);

  const handleContinueToCars = () => {
    navigate("/rent-car");
  };

  return (
    <Card className={cn(
      "overflow-hidden border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-card to-teal-500/5",
      className
    )}>
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Hotel className="w-5 h-5 text-amber-500" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <Car className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Need a Ride?</h3>
            <p className="text-sm text-muted-foreground">
              Add a car rental & save up to 15%
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Bundle Deal
          </Badge>
        </div>

        {/* Trip Context */}
        <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-muted/30">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Pickup: {hotelLocation} Airport</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span>4 days rental</span>
          </div>
        </div>

        {/* Suggested Cars */}
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-muted-foreground">Available vehicles:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {suggestedCars.map((car) => (
              <button
                key={car.id}
                onClick={() => setSelectedCar(car.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  selectedCar === car.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-border hover:border-emerald-500/30"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Car className="w-6 h-6 text-emerald-500" /></div>
                <div className="text-center">
                  <p className="font-medium text-sm">{car.name}</p>
                  <p className="text-xs text-muted-foreground">{car.type}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="font-bold">${car.price}<span className="text-xs font-normal">/day</span></p>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {car.feature}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            Free cancellation
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Fuel className="w-3.5 h-3.5 text-emerald-500" />
            Full-to-full fuel
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            Unlimited miles
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {}}
          >
            Skip for now
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500"
            onClick={handleContinueToCars}
          >
            Browse All Cars
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelToCarBridge;
