import { MapPin, Clock, Building, Plane, Train, CheckCircle2, Navigation } from "lucide-react";
import { useState } from "react";

const locations = [
  {
    id: 1,
    name: "LAX Airport",
    type: "Airport",
    icon: Plane,
    address: "1 World Way, Los Angeles, CA 90045",
    hours: "24/7",
    services: ["Counter Pickup", "Express Return", "After-Hours Drop"],
    popular: true,
  },
  {
    id: 2,
    name: "Downtown LA",
    type: "City Center",
    icon: Building,
    address: "700 S Flower St, Los Angeles, CA 90017",
    hours: "6:00 AM - 11:00 PM",
    services: ["Valet Pickup", "Home Delivery", "Express Service"],
    popular: true,
  },
  {
    id: 3,
    name: "Union Station",
    type: "Train Station",
    icon: Train,
    address: "800 N Alameda St, Los Angeles, CA 90012",
    hours: "5:00 AM - 12:00 AM",
    services: ["Counter Pickup", "Platform Delivery", "Luggage Assist"],
    popular: false,
  },
  {
    id: 4,
    name: "Santa Monica",
    type: "Beach Location",
    icon: MapPin,
    address: "1550 Pacific Coast Hwy, Santa Monica, CA 90401",
    hours: "7:00 AM - 10:00 PM",
    services: ["Beach Gear", "Convertibles Available", "Surf Racks"],
    popular: false,
  },
];

const CarPickupLocations = () => {
  const [selectedLocation, setSelectedLocation] = useState(1);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <MapPin className="w-4 h-4" />
              Pickup Locations
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Convenient <span className="text-primary">Pickup Points</span>
            </h2>
            <p className="text-muted-foreground">
              Choose from our network of convenient locations across the city
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map Placeholder */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-teal-500/10 aspect-square lg:aspect-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Navigation className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Interactive map view</p>
                </div>
              </div>

              {/* Location Pins */}
              {locations.map((loc, index) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id)}
                  className={`absolute w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    selectedLocation === loc.id
                      ? "bg-primary text-primary-foreground scale-125 z-10"
                      : "bg-card text-foreground border border-border hover:scale-110"
                  }`}
                  style={{
                    top: `${20 + index * 20}%`,
                    left: `${15 + index * 20}%`,
                  }}
                >
                  <loc.icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            {/* Location List */}
            <div className="space-y-4">
              {locations.map((location) => {
                const Icon = location.icon;
                const isSelected = selectedLocation === location.id;
                
                return (
                  <button
                    key={location.id}
                    onClick={() => setSelectedLocation(location.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary"
                        : "bg-card/50 border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{location.name}</h3>
                          {location.popular && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{location.address}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {location.hours}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground uppercase mb-2">Available Services</p>
                            <div className="flex flex-wrap gap-2">
                              {location.services.map((service, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-primary" />
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarPickupLocations;
