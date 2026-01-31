import { Accessibility, Check, Car, Users, HandMetal, Armchair } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const accessibleVehicles = [
  {
    type: "Wheelchair Accessible Van",
    description: "Side-entry ramp, lowered floor, and tie-downs",
    capacity: "Up to 2 wheelchairs + 4 passengers",
    pricePerDay: 95,
    features: ["Power ramp", "Tie-down systems", "Lowered floor", "Extra headroom"],
    image: "🚐",
    available: 3,
  },
  {
    type: "Hand Controls Vehicle",
    description: "Equipped with push/pull hand controls for acceleration and braking",
    capacity: "5 passengers",
    pricePerDay: 55,
    features: ["Push/pull controls", "Spinner knob", "Standard sedan", "Automatic transmission"],
    image: "🚗",
    available: 5,
  },
  {
    type: "Swivel Seat Vehicle",
    description: "Power rotating seats for easier entry and exit",
    capacity: "5 passengers",
    pricePerDay: 65,
    features: ["Power swivel seat", "Extra legroom", "Low step-in height", "Lumbar support"],
    image: "🚙",
    available: 4,
  },
];

const additionalEquipment = [
  { name: "Portable Ramp", price: "Free", description: "Lightweight aluminum ramp" },
  { name: "Transfer Board", price: "Free", description: "Assists with seat transfers" },
  { name: "Wheelchair Carrier", price: "$15/day", description: "Roof or hitch mounted" },
  { name: "Scooter Lift", price: "$25/day", description: "Electric lift for mobility scooters" },
];

const CarAccessibility = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-card/50 to-violet-500/10 border border-blue-500/20 rounded-3xl p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Accessibility className="w-3 h-3 mr-1" /> Accessible Rentals
              </Badge>
              <h2 className="text-2xl md:text-4xl font-display font-bold mb-3">
                Mobility Solutions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We offer a range of accessible vehicles and adaptive equipment to ensure comfortable travel for everyone.
              </p>
            </div>

            {/* Accessible Vehicles */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {accessibleVehicles.map((vehicle) => (
                <div
                  key={vehicle.type}
                  className="bg-card/60 backdrop-blur-xl rounded-xl p-5 border border-border/30 hover:border-blue-500/50 transition-colors"
                >
                  <div className="text-5xl mb-4">{vehicle.image}</div>
                  <Badge className="mb-2 bg-green-500/20 text-green-400 border-green-500/30">
                    {vehicle.available} Available
                  </Badge>
                  <h3 className="font-bold text-lg mb-1">{vehicle.type}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{vehicle.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Users className="w-4 h-4" />
                    {vehicle.capacity}
                  </div>

                  <ul className="space-y-1 mb-4">
                    {vehicle.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3 h-3 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-xl font-bold text-primary">${vehicle.pricePerDay}</span>
                    <span className="text-sm text-muted-foreground">/day</span>
                  </div>

                  <Button className="w-full bg-blue-500 hover:bg-blue-600">
                    Reserve Now
                  </Button>
                </div>
              ))}
            </div>

            {/* Additional Equipment */}
            <div className="bg-card/60 backdrop-blur-xl rounded-xl p-6 border border-border/30">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <HandMetal className="w-5 h-5 text-blue-400" />
                Additional Adaptive Equipment
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {additionalEquipment.map((item) => (
                  <div key={item.name} className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground mb-1">{item.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {item.price}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Need assistance? Our accessibility specialists are available 24/7 at 1-800-ZIVO-ACCESS
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarAccessibility;
