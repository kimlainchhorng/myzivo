import { premiumAirlines, fullServiceAirlines, lowCostAirlines, type Airline } from "@/data/airlines";
import { Badge } from "@/components/ui/badge";
import { Crown, Plane, Sparkles } from "lucide-react";

interface AirlineLogoProps {
  airline: Airline;
  size?: 'sm' | 'md' | 'lg';
}

const AirlineLogo = ({ airline, size = 'md' }: AirlineLogoProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  const bgColor = airline.category === 'premium' 
    ? 'from-amber-500/20 to-yellow-600/10 border-amber-500/30' 
    : airline.category === 'full-service'
    ? 'from-sky-500/20 to-blue-600/10 border-sky-500/30'
    : 'from-emerald-500/20 to-green-600/10 border-emerald-500/30';

  return (
    <div className="group flex flex-col items-center gap-2 transition-transform hover:scale-105">
      <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${bgColor} border flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all`}>
        <span>{airline.logo}</span>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-foreground truncate max-w-[80px]">{airline.name}</p>
        {airline.alliance && airline.alliance !== 'Independent' && (
          <p className="text-[10px] text-muted-foreground">{airline.alliance}</p>
        )}
      </div>
    </div>
  );
};

interface AirlineCarouselSectionProps {
  title: string;
  airlines: Airline[];
  icon: React.ReactNode;
  badgeText: string;
  badgeClass: string;
}

const AirlineCarouselSection = ({ title, airlines, icon, badgeText, badgeClass }: AirlineCarouselSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
      <Badge className={badgeClass}>{badgeText}</Badge>
    </div>
    <div className="relative overflow-hidden">
      <div className="flex gap-6 animate-scroll-slow hover:pause-animation">
        {[...airlines, ...airlines].map((airline, i) => (
          <AirlineLogo key={`${airline.code}-${i}`} airline={airline} size="md" />
        ))}
      </div>
    </div>
  </div>
);

export default function AirlineLogosCarousel() {
  return (
    <div className="py-12 space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold font-display">
          Fly with the <span className="text-primary">World's Best</span> Airlines
        </h2>
        <p className="text-muted-foreground">Compare and book flights from 60+ airlines worldwide</p>
      </div>

      <div className="space-y-8">
        <AirlineCarouselSection
          title="Premium Airlines"
          airlines={premiumAirlines}
          icon={<Crown className="h-5 w-5 text-amber-500" />}
          badgeText="5-Star Service"
          badgeClass="bg-amber-500/10 text-amber-500"
        />

        <AirlineCarouselSection
          title="Full-Service Carriers"
          airlines={fullServiceAirlines.slice(0, 16)}
          icon={<Plane className="h-5 w-5 text-sky-500" />}
          badgeText="Global Network"
          badgeClass="bg-sky-500/10 text-sky-500"
        />

        <AirlineCarouselSection
          title="Low-Cost Airlines"
          airlines={lowCostAirlines}
          icon={<Sparkles className="h-5 w-5 text-emerald-500" />}
          badgeText="Best Value"
          badgeClass="bg-emerald-500/10 text-emerald-500"
        />
      </div>
    </div>
  );
}
