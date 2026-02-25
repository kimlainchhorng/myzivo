import { Accessibility, Check, Phone, Ear, Eye, Dog, Bed, Armchair } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const accessibilityFeatures = [
  {
    category: "Mobility",
    icon: Armchair,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    features: [
      "Wheelchair accessible entrance",
      "Roll-in showers",
      "Grab bars in bathroom",
      "Accessible parking",
      "Elevator access to all floors",
    ],
  },
  {
    category: "Visual",
    icon: Eye,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    features: [
      "Braille signage",
      "Large print materials",
      "Audible elevator signals",
      "High contrast lighting",
      "Guide dog friendly",
    ],
  },
  {
    category: "Hearing",
    icon: Ear,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    features: [
      "Visual door/phone alerts",
      "TTY/TDD equipment",
      "Closed captioning TV",
      "Vibrating alarm clocks",
      "Written communication aids",
    ],
  },
  {
    category: "Room Features",
    icon: Bed,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    features: [
      "Lowered beds available",
      "Accessible light switches",
      "Wide doorways (32\"+)",
      "Lever door handles",
      "Adjustable showerheads",
    ],
  },
];

const HotelAccessibility = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-card/50 to-purple-500/10 border border-blue-500/20 rounded-3xl p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Accessibility className="w-3 h-3 mr-1" /> Inclusive Travel
              </Badge>
              <h2 className="text-2xl md:text-4xl font-display font-bold mb-3">
                Accessibility Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're committed to providing comfortable stays for all guests. Filter hotels by specific accessibility needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {accessibilityFeatures.map((category) => (
                <div
                  key={category.category}
                  className="bg-card/60 backdrop-blur-xl rounded-xl p-5 border border-border/30 hover:border-blue-500/30 hover:shadow-sm transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${category.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <h3 className="font-bold mb-3">{category.category}</h3>
                  <ul className="space-y-2">
                    {category.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Service Animals */}
            <div className="bg-card/60 backdrop-blur-xl rounded-xl p-6 border border-border/30 mb-6 hover:border-amber-500/30 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Dog className="w-7 h-7 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Service Animals Welcome</h3>
                  <p className="text-sm text-muted-foreground">
                    All our partner hotels welcome certified service animals at no additional charge. Please notify the hotel in advance for any special accommodations.
                  </p>
                </div>
                <Button variant="outline">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500">
                <Phone className="w-4 h-4 mr-2" />
                Contact Accessibility Support
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Available 24/7 to assist with special requirements
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelAccessibility;
