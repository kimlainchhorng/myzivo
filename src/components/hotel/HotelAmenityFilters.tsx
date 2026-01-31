import { Wifi, Coffee, Dumbbell, Waves, ParkingCircle, Utensils, Sparkles, Wind, Tv, Bath, Mountain, Sun } from "lucide-react";
import { useState } from "react";

const amenityCategories = [
  {
    name: "Essential",
    amenities: [
      { icon: Wifi, label: "Free WiFi", popular: true },
      { icon: ParkingCircle, label: "Free Parking", popular: true },
      { icon: Coffee, label: "Breakfast Included", popular: true },
      { icon: Wind, label: "Air Conditioning", popular: false },
    ],
  },
  {
    name: "Wellness",
    amenities: [
      { icon: Waves, label: "Swimming Pool", popular: true },
      { icon: Dumbbell, label: "Fitness Center", popular: true },
      { icon: Bath, label: "Spa Services", popular: false },
      { icon: Sparkles, label: "Sauna", popular: false },
    ],
  },
  {
    name: "Dining",
    amenities: [
      { icon: Utensils, label: "Restaurant", popular: true },
      { icon: Coffee, label: "Bar/Lounge", popular: false },
      { icon: Utensils, label: "Room Service", popular: true },
      { icon: Coffee, label: "Mini Bar", popular: false },
    ],
  },
  {
    name: "Views & Location",
    amenities: [
      { icon: Mountain, label: "Mountain View", popular: true },
      { icon: Sun, label: "Ocean View", popular: true },
      { icon: Tv, label: "City View", popular: false },
      { icon: Sun, label: "Garden View", popular: false },
    ],
  },
];

const HotelAmenityFilters = () => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleAmenity = (label: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Filter by <span className="text-primary">Amenities</span>
            </h2>
            <p className="text-muted-foreground">
              Find hotels with the features that matter most to you
            </p>
          </div>

          {/* Category Grids */}
          <div className="space-y-8">
            {amenityCategories.map((category) => (
              <div key={category.name}>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  {category.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {category.amenities.map((amenity) => {
                    const Icon = amenity.icon;
                    const isSelected = selectedAmenities.includes(amenity.label);
                    
                    return (
                      <button
                        key={amenity.label}
                        onClick={() => toggleAmenity(amenity.label)}
                        className={`group relative flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-card/50 border-border/50 hover:border-primary/30"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium">{amenity.label}</span>
                        
                        {amenity.popular && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                            Popular
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Count */}
          {selectedAmenities.length > 0 && (
            <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
              <span className="text-sm">
                <span className="font-bold text-primary">{selectedAmenities.length}</span> amenities selected
              </span>
              <button
                onClick={() => setSelectedAmenities([])}
                className="text-sm text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HotelAmenityFilters;
