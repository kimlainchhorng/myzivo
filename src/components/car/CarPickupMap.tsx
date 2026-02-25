import { MapPin, Clock, Phone, Navigation, Car, Plane, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const locations = [
  { 
    id: 1, 
    name: "LAX Airport Terminal", 
    address: "1 World Way, Los Angeles, CA 90045",
    hours: "24/7",
    type: "airport",
    distance: "0 mi",
    phone: "(310) 555-0100"
  },
  { 
    id: 2, 
    name: "Downtown LA", 
    address: "350 S Figueroa St, Los Angeles, CA 90071",
    hours: "6am - 11pm",
    type: "city",
    distance: "18 mi",
    phone: "(213) 555-0200"
  },
  { 
    id: 3, 
    name: "Santa Monica", 
    address: "1515 4th St, Santa Monica, CA 90401",
    hours: "7am - 9pm",
    type: "city",
    distance: "12 mi",
    phone: "(310) 555-0300"
  },
];

const CarPickupMap = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-blue-500/20 text-blue-400 border-blue-500/30">
            <MapPin className="w-3 h-3 mr-1" /> Pickup Locations
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Convenient Pickup Points
          </h2>
          <p className="text-muted-foreground">Choose from multiple locations near you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Map Placeholder */}
          <div className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-6 min-h-[350px] flex items-center justify-center relative overflow-hidden hover:border-primary/20 hover:shadow-sm transition-all duration-200">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5" />
            <div className="text-center z-10">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-bold mb-2">Interactive Map</h3>
              <p className="text-sm text-muted-foreground mb-4">Los Angeles Area</p>
              <Button variant="outline" size="sm">
                <Navigation className="w-4 h-4 mr-2" /> Get Directions
              </Button>
            </div>
            
            {/* Floating location pins */}
            <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="absolute top-1/2 right-1/3 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse delay-100">
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <div className="absolute bottom-1/3 left-1/2 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse delay-200">
              <MapPin className="w-4 h-4 text-green-400" />
            </div>
          </div>

          {/* Locations List */}
          <div className="space-y-4">
            {locations.map((location) => (
              <div 
                key={location.id}
                className="bg-card/60 backdrop-blur-xl rounded-xl border border-border/50 p-4 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    location.type === 'airport' ? 'bg-blue-500/20' : 'bg-primary/20'
                  }`}>
                    {location.type === 'airport' ? (
                      <Plane className="w-6 h-6 text-blue-400" />
                    ) : (
                      <Building className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold">{location.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {location.distance}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{location.address}</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" /> {location.hours}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-3 h-3" /> {location.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              <Car className="w-4 h-4 mr-2" /> View All 12 Locations
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarPickupMap;
