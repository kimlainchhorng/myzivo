import { premiumAirlines, fullServiceAirlines, lowCostAirlines, type Airline } from "@/data/airlines";
import { Badge } from "@/components/ui/badge";
import { Crown, Plane, Sparkles } from "lucide-react";
import { useState } from "react";

// Logo.clearbit CDN for airline logos (reliable, free)
const getAirlineLogo = (code: string) => {
  // Use pics.avs.io which is a free airline logo API
  return `https://pics.avs.io/200/80/${code}.png`;
};

interface AirlineLogoProps {
  airline: Airline;
  size?: 'sm' | 'md' | 'lg';
}

const AirlineLogo = ({ airline, size = 'md' }: AirlineLogoProps) => {
  const [imgError, setImgError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const bgColor = airline.category === 'premium' 
    ? 'from-amber-500/10 to-yellow-600/5 border-amber-500/20 hover:border-amber-500/40' 
    : airline.category === 'full-service'
    ? 'from-sky-500/10 to-blue-600/5 border-sky-500/20 hover:border-sky-500/40'
    : 'from-emerald-500/10 to-green-600/5 border-emerald-500/20 hover:border-emerald-500/40';

  const accentColor = airline.category === 'premium' 
    ? 'text-amber-400' 
    : airline.category === 'full-service'
    ? 'text-sky-400'
    : 'text-emerald-400';

  return (
    <div className="group flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 flex-shrink-0">
      <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${bgColor} border backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all overflow-hidden p-2`}>
        {!imgError ? (
          <img 
            src={getAirlineLogo(airline.code)}
            alt={`${airline.name} logo`}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          // Fallback: Show styled airline code with emoji flag
          <div className="flex flex-col items-center justify-center gap-0.5">
            <span className="text-lg">{airline.logo}</span>
            <span className={`text-xs font-bold ${accentColor}`}>{airline.code}</span>
          </div>
        )}
      </div>
      <div className="text-center opacity-80 group-hover:opacity-100 transition-opacity">
        <p className="text-xs font-medium text-foreground truncate max-w-[90px]">{airline.name}</p>
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
  direction?: 'left' | 'right';
}

const AirlineCarouselSection = ({ 
  title, 
  airlines, 
  icon, 
  badgeText, 
  badgeClass,
  direction = 'left'
}: AirlineCarouselSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 px-4">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
      <Badge className={badgeClass}>{badgeText}</Badge>
    </div>
    <div className="relative overflow-hidden">
      {/* Gradient masks for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div 
        className={`flex gap-8 py-2 ${direction === 'left' ? 'animate-scroll-slow' : 'animate-scroll-slow-reverse'}`}
        style={{ width: 'max-content' }}
      >
        {/* Double the airlines for seamless loop */}
        {[...airlines, ...airlines].map((airline, i) => (
          <AirlineLogo key={`${airline.code}-${i}`} airline={airline} size="md" />
        ))}
      </div>
    </div>
  </div>
);

export default function AirlineLogosCarousel() {
  return (
    <div className="py-12 space-y-10 overflow-hidden">
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
          badgeClass="bg-amber-500/10 text-amber-500 border-amber-500/20"
          direction="left"
        />

        <AirlineCarouselSection
          title="Full-Service Carriers"
          airlines={fullServiceAirlines.slice(0, 16)}
          icon={<Plane className="h-5 w-5 text-sky-500" />}
          badgeText="Global Network"
          badgeClass="bg-sky-500/10 text-sky-500 border-sky-500/20"
          direction="right"
        />

        <AirlineCarouselSection
          title="Low-Cost Airlines"
          airlines={lowCostAirlines}
          icon={<Sparkles className="h-5 w-5 text-emerald-500" />}
          badgeText="Best Value"
          badgeClass="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          direction="left"
        />
      </div>
    </div>
  );
}
