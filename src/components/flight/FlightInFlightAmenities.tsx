import { Wifi, Utensils, Film, Headphones, Coffee, Sparkles, Wine, Bed, ShowerHead } from "lucide-react";

const amenityCategories = [
  {
    title: "Entertainment",
    icon: Film,
    color: "text-purple-400",
    items: [
      "1000+ Movies & TV Shows",
      "Live TV Streaming",
      "Music Library",
      "Games & Apps",
      "Noise-canceling headphones",
    ],
  },
  {
    title: "Connectivity",
    icon: Wifi,
    color: "text-sky-400",
    items: [
      "High-speed WiFi",
      "USB & Power outlets",
      "Bluetooth connectivity",
      "Mobile app control",
    ],
  },
  {
    title: "Dining",
    icon: Utensils,
    color: "text-amber-400",
    items: [
      "Chef-curated menus",
      "Special dietary options",
      "Premium beverages",
      "On-demand dining",
      "Fresh bakery items",
    ],
  },
  {
    title: "Comfort",
    icon: Bed,
    color: "text-emerald-400",
    items: [
      "Lie-flat seats (Business+)",
      "Premium bedding",
      "Amenity kits",
      "Extra legroom options",
      "Temperature control",
    ],
  },
];

const premiumFeatures = [
  { icon: Wine, label: "Premium Bar", description: "Curated wine & spirits selection" },
  { icon: ShowerHead, label: "Spa Services", description: "Onboard shower (A380)" },
  { icon: Coffee, label: "Barista Coffee", description: "Fresh espresso drinks" },
  { icon: Headphones, label: "Bose Audio", description: "Noise-canceling headsets" },
];

const FlightInFlightAmenities = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Onboard Experience
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              In-Flight <span className="text-primary">Amenities</span>
            </h2>
            <p className="text-muted-foreground">
              Discover the comfort and entertainment awaiting you in the sky
            </p>
          </div>

          {/* Amenity Categories */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {amenityCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-${category.color.split('-')[1]}-500/10 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg">{category.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Premium Features Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-sky-500/20 border border-primary/30">
            <h3 className="text-lg font-semibold mb-6 text-center">Premium Class Exclusives</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {premiumFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-card/50 border border-border/30">
                    <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-medium text-sm mb-1">{feature.label}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Airline Comparison Note */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            * Amenities vary by airline and aircraft. Check specific flight details when booking.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FlightInFlightAmenities;
