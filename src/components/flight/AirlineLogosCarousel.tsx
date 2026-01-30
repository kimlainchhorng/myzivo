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
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-28 h-28'
  };

  const getBgStyles = () => {
    if (isPremium) {
      return 'from-amber-500/30 via-yellow-500/20 to-amber-600/10 border-amber-400/50 hover:border-amber-300 shadow-amber-500/25';
    }
    switch (airline.category) {
      case 'full-service':
        return 'from-sky-500/20 via-blue-500/15 to-indigo-600/10 border-sky-400/40 hover:border-sky-300 shadow-sky-500/20';
      case 'low-cost':
        return 'from-emerald-500/20 via-green-500/15 to-teal-600/10 border-emerald-400/40 hover:border-emerald-300 shadow-emerald-500/20';
      default:
        return 'from-slate-500/20 to-slate-600/10 border-slate-400/30 hover:border-slate-300 shadow-slate-500/15';
    }
  };

  const getAccentColor = () => {
    if (isPremium) return 'text-amber-300';
    switch (airline.category) {
      case 'full-service': return 'text-sky-300';
      case 'low-cost': return 'text-emerald-300';
      default: return 'text-slate-300';
    }
  };

  const getGlowColor = () => {
    if (isPremium) return 'hover:shadow-amber-500/40';
    switch (airline.category) {
      case 'full-service': return 'hover:shadow-sky-500/30';
      case 'low-cost': return 'hover:shadow-emerald-500/30';
      default: return 'hover:shadow-slate-500/20';
    }
  };

  return (
    <div className="group flex flex-col items-center gap-3 transition-all duration-500 hover:scale-110 flex-shrink-0">
      <div className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${getBgStyles()} border-2 backdrop-blur-xl flex items-center justify-center shadow-xl ${getGlowColor()} group-hover:shadow-2xl transition-all duration-500 overflow-hidden p-3`}>
        {/* Ambient glow ring */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isPremium ? 'bg-gradient-to-br from-amber-400/10 via-transparent to-yellow-400/10' : airline.category === 'full-service' ? 'bg-gradient-to-br from-sky-400/10 via-transparent to-blue-400/10' : 'bg-gradient-to-br from-emerald-400/10 via-transparent to-teal-400/10'}`} />
        
        {/* Shine sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        
        {/* Inner glow */}
        <div className="absolute inset-1 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-50" />
        
        {!imgError ? (
          <img 
            src={getAirlineLogo(airline.code)}
            alt={`${airline.name} logo`}
            className="w-full h-full object-contain relative z-10 drop-shadow-lg"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 relative z-10">
            <span className="text-2xl drop-shadow-lg">{airline.logo}</span>
            <span className={`text-sm font-bold ${getAccentColor()} tracking-wide`}>{airline.code}</span>
          </div>
        )}
        
        {/* Premium badge indicator */}
        {isPremium && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
            <Crown className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      {/* Airline name with enhanced styling */}
      <div className="text-center opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-0.5">
        <p className={`text-sm font-semibold ${isPremium ? 'text-amber-200' : 'text-foreground'} truncate max-w-[100px] drop-shadow-sm`}>
          {airline.name}
        </p>
        {airline.alliance && airline.alliance !== 'Independent' && (
          <p className={`text-xs ${isPremium ? 'text-amber-400/70' : 'text-muted-foreground'} font-medium`}>
            {airline.alliance}
          </p>
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
