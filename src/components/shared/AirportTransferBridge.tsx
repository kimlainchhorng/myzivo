import { useState } from "react";
import { 
  Plane, 
  Car, 
  ArrowRight, 
  MapPin, 
  Clock,
  Users,
  Luggage,
  Shield
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AirportTransferBridgeProps {
  airport?: string;
  destination?: string;
  arrivalTime?: string;
  passengers?: number;
  className?: string;
}

const transferOptions = [
  { 
    id: "shared", 
    name: "Shared Shuttle", 
    price: 25, 
    time: "45-60 min",
    capacity: "8 passengers",
    savings: "Best Value"
  },
  { 
    id: "private", 
    name: "Private Transfer", 
    price: 65, 
    time: "30-40 min",
    capacity: "4 passengers",
    savings: "Most Popular"
  },
  { 
    id: "luxury", 
    name: "Luxury Sedan", 
    price: 120, 
    time: "30-40 min",
    capacity: "3 passengers",
    savings: "Premium"
  },
];

const AirportTransferBridge = ({ 
  airport = "CDG Airport",
  destination = "Paris City Center",
  arrivalTime = "2:30 PM",
  passengers = 2,
  className 
}: AirportTransferBridgeProps) => {
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);

  const handleBook = () => {
    if (selectedTransfer) {
      console.log("Booking transfer:", selectedTransfer);
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden border-2 border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-card to-blue-500/5",
      className
    )}>
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20">
              <Plane className="w-5 h-5 text-sky-500" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Car className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Airport Transfer</h3>
            <p className="text-sm text-muted-foreground">
              Pre-book your ride to {destination}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-sky-500 to-blue-500 text-primary-foreground">
            <Shield className="w-3 h-3 mr-1" />
            Meet & Greet
          </Badge>
        </div>

        {/* Route Info */}
        <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-muted/30">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{airport} → {destination}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span>Arrival: {arrivalTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span>{passengers} passengers</span>
          </div>
        </div>

        {/* Transfer Options */}
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-muted-foreground">Select transfer type:</p>
          <div className="space-y-2">
            {transferOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedTransfer(option.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                  selectedTransfer === option.id
                    ? "border-sky-500 bg-sky-500/10"
                    : "border-border hover:border-sky-500/30"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center"><Car className="w-5 h-5 text-sky-500" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{option.name}</p>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {option.savings}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {option.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {option.capacity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${option.price}</p>
                  <p className="text-xs text-muted-foreground">per vehicle</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-sky-500" />
            Free cancellation
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Luggage className="w-3.5 h-3.5 text-sky-500" />
            Luggage included
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            Flight monitoring
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Skip for now
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-sky-500 to-blue-500"
            onClick={handleBook}
            disabled={!selectedTransfer}
          >
            Add Transfer
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AirportTransferBridge;
