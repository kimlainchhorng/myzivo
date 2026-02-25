import { Baby, Navigation, Wifi, Snowflake, Bike, Briefcase, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const addons = [
  {
    id: "gps",
    name: "GPS Navigation",
    description: "Never get lost with turn-by-turn directions",
    icon: Navigation,
    price: 12,
    popular: true,
  },
  {
    id: "wifi",
    name: "Mobile WiFi",
    description: "Stay connected with portable hotspot",
    icon: Wifi,
    price: 15,
    popular: true,
  },
  {
    id: "child-seat",
    name: "Child Seat",
    description: "Safe travel for your little ones",
    icon: Baby,
    price: 10,
    popular: false,
  },
  {
    id: "ski-rack",
    name: "Ski/Snowboard Rack",
    description: "Secure your winter gear on the roof",
    icon: Snowflake,
    price: 18,
    popular: false,
  },
  {
    id: "bike-rack",
    name: "Bike Rack",
    description: "Transport up to 4 bikes safely",
    icon: Bike,
    price: 20,
    popular: false,
  },
  {
    id: "extra-driver",
    name: "Additional Driver",
    description: "Share the driving with someone else",
    icon: Briefcase,
    price: 8,
    popular: true,
  },
];

const CarAccessoriesAddons = () => {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const totalDaily = addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Extras</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Enhance Your Rental
          </h2>
          <p className="text-muted-foreground">Add-ons to make your trip even better</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map((addon, index) => {
              const Icon = addon.icon;
              const isSelected = selectedAddons.includes(addon.id);

              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={cn(
                    "relative p-4 rounded-2xl border text-left transition-all duration-200",
                    "touch-manipulation active:scale-[0.98]",
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/50"
                      : "bg-card/50 border-border/50 hover:border-emerald-500/30",
                    "animate-in fade-in slide-in-from-bottom-4"
                  )}
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  {addon.popular && (
                    <div className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                      Popular
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isSelected ? "bg-emerald-500" : "bg-emerald-500/10"
                    )}>
                      {isSelected ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{addon.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{addon.description}</p>
                      <p className="text-emerald-400 font-bold">${addon.price}/day</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedAddons.length > 0 && (
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selected add-ons</p>
                  <p className="font-bold text-lg">
                    {selectedAddons.length} item{selectedAddons.length > 1 ? "s" : ""} • 
                    <span className="text-emerald-400"> ${totalDaily}/day extra</span>
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:opacity-90 rounded-xl">
                  Add to Rental
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CarAccessoriesAddons;
