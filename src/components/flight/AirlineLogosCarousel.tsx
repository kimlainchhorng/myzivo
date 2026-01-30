import { premiumAirlines, fullServiceAirlines, lowCostAirlines, type Airline } from "@/data/airlines";
import { Badge } from "@/components/ui/badge";
import { Crown, Plane, Sparkles, Star } from "lucide-react";
import { useState } from "react";

// Logo.clearbit CDN for airline logos (reliable, free)
const getAirlineLogo = (code: string) => {
  // Use pics.avs.io which is a free airline logo API
  return `https://pics.avs.io/200/80/${code}.png`;
};

interface AirlineLogoProps {
  airline: Airline;
  size?: 'sm' | 'md' | 'lg';
  isPremium?: boolean;
}

const AirlineLogo = ({ airline, size = 'md', isPremium = false }: AirlineLogoProps) => {
  const [imgError, setImgError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const bgColor = airline.category === 'premium' 
    ? 'from-amber-500/20 via-yellow-500/10 to-amber-600/5 border-amber-400/40 hover:border-amber-400/70' 
    : airline.category === 'full-service'
    ? 'from-sky-500/10 to-blue-600/5 border-sky-500/20 hover:border-sky-500/40'
    : 'from-emerald-500/10 to-green-600/5 border-emerald-500/20 hover:border-emerald-500/40';

  const accentColor = airline.category === 'premium' 
    ? 'text-amber-400' 
    : airline.category === 'full-service'
    ? 'text-sky-400'
    : 'text-emerald-400';

  const premiumGlow = isPremium ? 'shadow-amber-500/20 hover:shadow-amber-500/40 hover:shadow-xl' : '';

  return (
    <div className="group flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105 flex-shrink-0">
      <div className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${bgColor} border backdrop-blur-sm flex items-center justify-center shadow-lg ${premiumGlow} group-hover:shadow-xl transition-all overflow-hidden p-2`}>
        {/* Premium shine effect */}
        {isPremium && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        )}
        {!imgError ? (
          <img 
            src={getAirlineLogo(airline.code)}
            alt={`${airline.name} logo`}
            className="w-full h-full object-contain relative z-10"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          // Fallback: Show styled airline code with emoji flag
          <div className="flex flex-col items-center justify-center gap-0.5 relative z-10">
            <span className="text-lg">{airline.logo}</span>
            <span className={`text-xs font-bold ${accentColor}`}>{airline.code}</span>
          </div>
        )}
      </div>
      <div className="text-center opacity-80 group-hover:opacity-100 transition-opacity">
        <p className={`text-xs font-medium ${isPremium ? 'text-amber-200' : 'text-foreground'} truncate max-w-[90px]`}>{airline.name}</p>
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
  isPremium?: boolean;
}

const AirlineCarouselSection = ({ 
  title, 
  airlines, 
  icon, 
  badgeText, 
  badgeClass,
  direction = 'left',
  isPremium = false
}: AirlineCarouselSectionProps) => (
  <div className={`space-y-4 ${isPremium ? 'relative py-6' : ''}`}>
    {/* Premium background glow */}
    {isPremium && (
      <>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-yellow-500/10 to-amber-500/5 rounded-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      </>
    )}
    
    <div className={`flex items-center gap-3 px-4 relative z-10 ${isPremium ? 'justify-center' : ''}`}>
      {isPremium ? (
        <div className="flex items-center gap-4">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-lg shadow-amber-500/30">
            {icon}
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
            {title}
          </h3>
          <Badge className={`${badgeClass} font-semibold px-3 py-1`}>
            <Crown className="w-3 h-3 mr-1.5" />
            {badgeText}
          </Badge>
          <Star className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
        </div>
      ) : (
        <>
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge className={badgeClass}>{badgeText}</Badge>
        </>
      )}
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
          <AirlineLogo key={`${airline.code}-${i}`} airline={airline} size={isPremium ? 'lg' : 'md'} isPremium={isPremium} />
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
          icon={<Crown className="h-5 w-5 text-white" />}
          badgeText="5-Star Service"
          badgeClass="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-400/40 shadow-lg shadow-amber-500/10"
          direction="left"
          isPremium={true}
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
