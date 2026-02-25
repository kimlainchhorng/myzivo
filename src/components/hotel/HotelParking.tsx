import { Car, ParkingCircle, Clock, Zap, Shield, MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const parkingOptions = [
  {
    type: "Self Parking",
    price: "Free",
    priceNote: "Included with stay",
    icon: ParkingCircle,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    features: ["Covered garage", "24/7 access", "Security cameras", "Unlimited in/out"],
    available: true,
  },
  {
    type: "Valet Parking",
    price: "$35",
    priceNote: "per night",
    icon: Car,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    features: ["Door-to-door service", "Priority retrieval", "Climate controlled", "Car wash included"],
    available: true,
  },
  {
    type: "EV Charging",
    price: "$15",
    priceNote: "per charge",
    icon: Zap,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    features: ["Level 2 chargers", "8 stations available", "Tesla compatible", "Charge monitoring app"],
    available: true,
  },
];

const HotelParking = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-violet-500/20 text-violet-400 border-violet-500/20">
            <ParkingCircle className="w-3 h-3 mr-1" /> Parking Options
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Convenient Parking Solutions
          </h2>
          <p className="text-muted-foreground">
            Multiple options to suit your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {parkingOptions.map((option) => (
            <div
              key={option.type}
              className="group bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-violet-500/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${option.bgColor} rounded-xl flex items-center justify-center`}>
                  <option.icon className={`w-6 h-6 ${option.color}`} />
                </div>
                {option.available && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Available
                  </Badge>
                )}
              </div>

              <h3 className="text-xl font-bold mb-1">{option.type}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-primary">{option.price}</span>
                <span className="text-sm text-muted-foreground">{option.priceNote}</span>
              </div>

              <ul className="space-y-2 mb-6">
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="w-full" variant={option.price === "Free" ? "default" : "outline"}>
                {option.price === "Free" ? "Included" : "Add to Booking"}
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-violet-500/10 transition-all duration-150">
              <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="font-medium text-sm">24/7 Access</p>
                <p className="text-xs text-muted-foreground">Come and go anytime</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-violet-500/10 transition-all duration-150">
              <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Fully Secured</p>
                <p className="text-xs text-muted-foreground">Security patrol & CCTV</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-violet-500/10 transition-all duration-150">
              <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Prime Location</p>
                <p className="text-xs text-muted-foreground">Steps from hotel entrance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelParking;
