import { Badge } from "@/components/ui/badge";
import { Globe, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAirlineLogo } from "@/data/airlines";

const airlines = [
  { name: "United", code: "UA", alliance: "Star Alliance", featured: true },
  { name: "Delta", code: "DL", alliance: "SkyTeam", featured: true },
  { name: "American", code: "AA", alliance: "Oneworld", featured: true },
  { name: "British Airways", code: "BA", alliance: "Oneworld", featured: false },
  { name: "Lufthansa", code: "LH", alliance: "Star Alliance", featured: false },
  { name: "Air France", code: "AF", alliance: "SkyTeam", featured: false },
  { name: "Emirates", code: "EK", alliance: "None", featured: true },
  { name: "Qatar Airways", code: "QR", alliance: "Oneworld", featured: false },
  { name: "Singapore", code: "SQ", alliance: "Star Alliance", featured: true },
  { name: "ANA", code: "NH", alliance: "Star Alliance", featured: false },
  { name: "KLM", code: "KL", alliance: "SkyTeam", featured: false },
  { name: "Qantas", code: "QF", alliance: "Oneworld", featured: false },
];

const FlightAirlinePartners = () => {
  return (
    <section className="py-12 sm:py-16 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-blue-500/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            Global Partners
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            500+ <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Airline Partners</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Compare prices across all major airlines worldwide
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {airlines.map((airline, index) => (
            <div
              key={airline.code}
              className={cn(
                "group relative p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                "hover:border-sky-500/50 hover:-translate-y-1 transition-all duration-300",
                "cursor-pointer touch-manipulation active:scale-[0.95] text-center",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {airline.featured && (
                <Star className="absolute top-2 right-2 w-3 h-3 fill-amber-400 text-amber-400" />
              )}
              <div className="flex justify-center mb-2">
                <img
                  src={getAirlineLogo(airline.code, 48)}
                  alt={`${airline.name} logo`}
                  className="w-12 h-12 object-contain transition-transform group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <h3 className="font-semibold text-sm mb-1 group-hover:text-sky-400 transition-colors truncate">
                {airline.name}
              </h3>
              <p className="text-xs text-muted-foreground">{airline.code}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-8">
          {["Star Alliance", "SkyTeam", "Oneworld"].map((alliance) => (
            <Badge key={alliance} variant="outline" className="text-xs">
              {alliance}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlightAirlinePartners;
