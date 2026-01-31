import { useState } from "react";
import { Navigation, Wifi, Baby, Snowflake, Bike, Accessibility, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const addons = [
  {
    id: "gps",
    icon: Navigation,
    name: "GPS Navigation",
    description: "Latest maps with live traffic updates",
    pricePerDay: 8,
    popular: true,
    color: "sky"
  },
  {
    id: "wifi",
    icon: Wifi,
    name: "Mobile WiFi Hotspot",
    description: "4G LTE connection for up to 5 devices",
    pricePerDay: 12,
    color: "violet"
  },
  {
    id: "childseat",
    icon: Baby,
    name: "Child Safety Seat",
    description: "Rear-facing, forward-facing, or booster",
    pricePerDay: 10,
    color: "pink"
  },
  {
    id: "ski",
    icon: Snowflake,
    name: "Ski Rack",
    description: "Fits up to 6 pairs of skis or 4 snowboards",
    pricePerDay: 15,
    color: "cyan"
  },
  {
    id: "bike",
    icon: Bike,
    name: "Bike Rack",
    description: "Secure carrier for up to 3 bikes",
    pricePerDay: 12,
    color: "emerald"
  },
  {
    id: "mobility",
    icon: Accessibility,
    name: "Mobility Equipment",
    description: "Hand controls and accessibility aids",
    pricePerDay: 0,
    free: true,
    color: "amber"
  },
];

const CarGPSAddons = () => {
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["gps"]);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  const totalPerDay = addons
    .filter(a => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.pricePerDay, 0);

  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-sky-500/20 text-sky-400 border-sky-500/30">
            <Plus className="w-3 h-3 mr-1" /> Equipment Add-ons
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Customize Your Rental
          </h2>
          <p className="text-muted-foreground">Add equipment to enhance your journey</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {addons.map((addon) => {
            const Icon = addon.icon;
            const isSelected = selectedAddons.includes(addon.id);

            return (
              <button
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={cn(
                  "relative text-left p-5 rounded-2xl border transition-all",
                  isSelected
                    ? `bg-${addon.color}-500/10 border-${addon.color}-500/30`
                    : "bg-card/60 border-border/50 hover:border-border"
                )}
              >
                {addon.popular && (
                  <Badge className="absolute -top-2 right-4 bg-sky-500 text-white border-0 text-xs">
                    Popular
                  </Badge>
                )}

                {addon.free && (
                  <Badge className="absolute -top-2 right-4 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    Free
                  </Badge>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isSelected ? `bg-${addon.color}-500/20` : "bg-muted/50"
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      isSelected ? `text-${addon.color}-400` : "text-muted-foreground"
                    )} />
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected 
                      ? `bg-${addon.color}-500 border-${addon.color}-500` 
                      : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>

                <h3 className="font-bold mb-1">{addon.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{addon.description}</p>

                <div className="pt-3 border-t border-border/50">
                  {addon.free ? (
                    <span className="font-bold text-green-400">Complimentary</span>
                  ) : (
                    <span className={cn("font-bold", isSelected && `text-${addon.color}-400`)}>
                      ${addon.pricePerDay}/day
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-sky-500/10 via-card/50 to-violet-500/10 rounded-2xl border border-sky-500/20 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg mb-1">Your Selected Add-ons</p>
              <div className="flex flex-wrap gap-2">
                {selectedAddons.length > 0 ? (
                  selectedAddons.map(id => {
                    const addon = addons.find(a => a.id === id);
                    return addon ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {addon.name}
                      </Badge>
                    ) : null;
                  })
                ) : (
                  <span className="text-sm text-muted-foreground">No add-ons selected</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Additional cost</p>
                <p className="text-2xl font-display font-bold text-sky-400">
                  +${totalPerDay}/day
                </p>
              </div>
              <Button className="bg-gradient-to-r from-sky-500 to-blue-500">
                Add to Booking
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarGPSAddons;
