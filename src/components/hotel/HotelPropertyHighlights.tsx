import { 
  Utensils, 
  Dumbbell, 
  Waves, 
  Wifi, 
  Car, 
  Sparkles, 
  Coffee, 
  Wine,
  TreePalm,
  Flower2,
  Baby,
  Dog
} from "lucide-react";
import { cn } from "@/lib/utils";

const highlights = [
  {
    category: "Dining",
    icon: Utensils,
    color: "from-orange-500 to-red-500",
    items: [
      { name: "Fine Dining Restaurant", desc: "Michelin-starred cuisine" },
      { name: "Rooftop Bar", desc: "Panoramic city views" },
      { name: "24/7 Room Service", desc: "Always available" },
    ]
  },
  {
    category: "Wellness",
    icon: Sparkles,
    color: "from-violet-500 to-purple-500",
    items: [
      { name: "Full-Service Spa", desc: "Relaxation therapies" },
      { name: "Fitness Center", desc: "State-of-the-art equipment" },
      { name: "Yoga Classes", desc: "Daily sessions" },
    ]
  },
  {
    category: "Recreation",
    icon: Waves,
    color: "from-blue-500 to-cyan-500",
    items: [
      { name: "Infinity Pool", desc: "Heated year-round" },
      { name: "Private Beach", desc: "Exclusive access" },
      { name: "Water Sports", desc: "Equipment available" },
    ]
  },
  {
    category: "Services",
    icon: Coffee,
    color: "from-amber-500 to-yellow-500",
    items: [
      { name: "Concierge", desc: "24/7 assistance" },
      { name: "Valet Parking", desc: "Complimentary" },
      { name: "Airport Transfer", desc: "Luxury vehicles" },
    ]
  },
];

const quickFeatures = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: Car, label: "Free Parking" },
  { icon: Baby, label: "Kids Club" },
  { icon: Dog, label: "Pet Friendly" },
  { icon: Wine, label: "Mini Bar" },
  { icon: TreePalm, label: "Garden" },
  { icon: Dumbbell, label: "Gym" },
  { icon: Flower2, label: "Spa" },
];

const HotelPropertyHighlights = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Property Highlights</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Exceptional Amenities
          </h2>
          <p className="text-muted-foreground">Everything you need for a perfect stay</p>
        </div>

        {/* Quick Features */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {quickFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50",
                  "animate-in fade-in zoom-in-95"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            );
          })}
        </div>

        {/* Detailed Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.category}
                className={cn(
                  "p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                  "animate-in fade-in slide-in-from-bottom-4"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  "bg-gradient-to-br", category.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="font-bold text-lg mb-4">{category.category}</h3>

                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div key={item.name} className="pb-3 border-b border-border/50 last:border-0 last:pb-0">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HotelPropertyHighlights;
