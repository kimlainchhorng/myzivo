import { Armchair, Wifi, Utensils, Film, Plug, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const seatMaps = {
  economy: {
    rows: 6,
    cols: 6,
    available: [1, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32],
    selected: [],
    price: 0,
  },
  premium: {
    rows: 4,
    cols: 4,
    available: [1, 3, 5, 7, 9, 11, 13, 15],
    selected: [],
    price: 49,
  },
  business: {
    rows: 3,
    cols: 4,
    available: [1, 2, 4, 5, 7, 8, 10, 11],
    selected: [],
    price: 199,
  },
};

const seatFeatures = {
  economy: ["Standard legroom", "Personal screen", "USB power"],
  premium: ["Extra legroom", "Priority boarding", "Larger screen", "Power outlet"],
  business: ["Lie-flat seats", "Lounge access", "Premium dining", "WiFi included", "Amenity kit"],
};

const FlightSeatSelection = () => {
  const [selectedClass, setSelectedClass] = useState<"economy" | "premium" | "business">("economy");
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const toggleSeat = (seatNum: number) => {
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNum));
    } else if (selectedSeats.length < 4) {
      setSelectedSeats([...selectedSeats, seatNum]);
    }
  };

  const currentMap = seatMaps[selectedClass];
  const totalCost = selectedSeats.length * currentMap.price;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 text-sky-400 text-sm font-medium mb-4">
              <Armchair className="w-4 h-4" />
              Seat Selection
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Choose Your <span className="text-primary">Perfect Seat</span>
            </h2>
            <p className="text-muted-foreground">
              Preview and select your preferred seats before booking
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Seat Map */}
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              {/* Class Selector */}
              <div className="flex gap-2 mb-6">
                {(["economy", "premium", "business"] as const).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => {
                      setSelectedClass(cls);
                      setSelectedSeats([]);
                    }}
                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] touch-manipulation ${
                      selectedClass === cls
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cls.charAt(0).toUpperCase() + cls.slice(1)}
                  </button>
                ))}
              </div>

              {/* Aircraft Preview */}
              <div className="relative p-6 rounded-xl bg-gradient-to-b from-muted/50 to-transparent border border-border/30">
                {/* Nose */}
                <div className="w-20 h-10 mx-auto mb-4 bg-muted/50 rounded-t-full" />
                
                {/* Seat Grid */}
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${currentMap.cols}, 1fr)` }}>
                  {Array.from({ length: currentMap.rows * currentMap.cols }, (_, i) => {
                    const seatNum = i + 1;
                    const isAvailable = currentMap.available.includes(seatNum);
                    const isSelected = selectedSeats.includes(seatNum);
                    const isAisle = (seatNum % currentMap.cols === currentMap.cols / 2) || 
                                   (seatNum % currentMap.cols === (currentMap.cols / 2) + 1);
                    
                    return (
                      <button
                        key={i}
                        onClick={() => isAvailable && toggleSeat(seatNum)}
                        disabled={!isAvailable}
                        className={`aspect-square rounded-xl text-xs font-medium transition-all duration-200 active:scale-[0.90] touch-manipulation ${
                          isSelected
                            ? "bg-primary text-primary-foreground scale-105"
                            : isAvailable
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-muted/30 text-muted-foreground cursor-not-allowed"
                        } ${isAisle ? "ml-2" : ""}`}
                      >
                        {seatNum}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500/20" />
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary" />
                    <span className="text-muted-foreground">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted/30" />
                    <span className="text-muted-foreground">Taken</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Details */}
            <div className="space-y-6">
              {/* Class Info */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-sky-500/10 border border-primary/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize">{selectedClass} Class</h3>
                  {currentMap.price > 0 && (
                    <span className="text-2xl font-bold text-primary">+${currentMap.price}</span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {seatFeatures[selectedClass].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities Icons */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Wifi, label: "WiFi", available: selectedClass !== "economy" },
                  { icon: Utensils, label: "Meals", available: true },
                  { icon: Film, label: "Entertainment", available: true },
                  { icon: Plug, label: "Power", available: selectedClass !== "economy" },
                ].map((amenity, index) => {
                  const Icon = amenity.icon;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-xl text-center ${
                        amenity.available
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">{amenity.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Selection Summary */}
              <div className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Selected Seats</span>
                  <span className="font-medium">
                    {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Upgrade Cost</span>
                  <span className="text-xl font-bold text-primary">
                    {totalCost > 0 ? `+$${totalCost}` : "Included"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightSeatSelection;
