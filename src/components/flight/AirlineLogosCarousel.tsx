import { premiumAirlines, fullServiceAirlines, lowCostAirlines, type Airline } from "@/data/airlines";
import { Badge } from "@/components/ui/badge";
import { Crown, Plane, Sparkles, Star, Loader2 } from "lucide-react";
import { useState } from "react";

// pics.avs.io - reliable airline logo API
const getAirlineLogo = (code: string) => {
  return `https://pics.avs.io/200/80/${code}.png`;
};

interface AirlineLogoProps {
  airline: Airline;
  size?: 'sm' | 'md' | 'lg';
  isPremium?: boolean;
}

const AirlineLogo = ({ airline, size = 'md', isPremium = false }: AirlineLogoProps) => {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-32 h-32'
  };

  const getBgStyles = () => {
    if (isPremium) {
      return 'from-amber-500/40 via-yellow-500/30 to-amber-600/20 border-amber-400/60 hover:border-amber-300 shadow-amber-500/30';
    }
    switch (airline.category) {
      case 'full-service':
        return 'from-sky-500/30 via-blue-500/20 to-indigo-600/15 border-sky-400/50 hover:border-sky-300 shadow-sky-500/25';
      case 'low-cost':
        return 'from-emerald-500/30 via-green-500/20 to-teal-600/15 border-emerald-400/50 hover:border-emerald-300 shadow-emerald-500/25';
      default:
        return 'from-slate-500/25 to-slate-600/15 border-slate-400/40 hover:border-slate-300 shadow-slate-500/20';
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
    if (isPremium) return 'hover:shadow-amber-500/50 hover:shadow-2xl';
    switch (airline.category) {
      case 'full-service': return 'hover:shadow-sky-500/40 hover:shadow-xl';
      case 'low-cost': return 'hover:shadow-emerald-500/40 hover:shadow-xl';
      default: return 'hover:shadow-slate-500/30 hover:shadow-lg';
    }
  };

  const getRingColor = () => {
    if (isPremium) return 'ring-amber-400/30';
    switch (airline.category) {
      case 'full-service': return 'ring-sky-400/20';
      case 'low-cost': return 'ring-emerald-400/20';
      default: return 'ring-slate-400/15';
    }
  };

  return (
    <div className="group flex flex-col items-center gap-3 transition-all duration-500 hover:scale-110 hover:-translate-y-1 flex-shrink-0">
      <div className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${getBgStyles()} border-2 backdrop-blur-xl flex items-center justify-center shadow-xl ${getGlowColor()} ring-1 ${getRingColor()} transition-all duration-500 overflow-hidden p-4`}>
        {/* Outer glow pulse */}
        <div className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${isPremium ? 'bg-gradient-to-br from-amber-400/20 via-transparent to-yellow-400/20 blur-xl' : airline.category === 'full-service' ? 'bg-gradient-to-br from-sky-400/15 via-transparent to-blue-400/15 blur-xl' : 'bg-gradient-to-br from-emerald-400/15 via-transparent to-teal-400/15 blur-xl'}`} />
        
        {/* Inner ambient glow */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isPremium ? 'bg-gradient-to-t from-amber-400/10 via-transparent to-yellow-400/5' : airline.category === 'full-service' ? 'bg-gradient-to-t from-sky-400/10 via-transparent to-blue-400/5' : 'bg-gradient-to-t from-emerald-400/10 via-transparent to-teal-400/5'}`} />
        
        {/* Shine sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        
        {/* Top highlight */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        
        {/* Inner glow shadow */}
        <div className="absolute inset-1 rounded-xl bg-gradient-to-t from-black/30 via-transparent to-white/5 opacity-60" />
        
        {/* Loading state */}
        {isLoading && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 className={`w-6 h-6 animate-spin ${getAccentColor()}`} />
          </div>
        )}
        
        {!imgError ? (
          <img 
            src={getAirlineLogo(airline.code)}
            alt={`${airline.name} logo`}
            className={`w-full h-full object-contain relative z-10 drop-shadow-lg transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImgError(true);
              setIsLoading(false);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 relative z-10">
            <span className={`text-lg font-bold ${getAccentColor()} tracking-wider`}>{airline.code}</span>
            <span className="text-xs text-muted-foreground">{airline.name.split(' ')[0]}</span>
          </div>
        )}
        
        {/* Premium crown badge */}
        {isPremium && (
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 ring-2 ring-amber-300/30">
            <Crown className="w-3.5 h-3.5 text-white drop-shadow" />
          </div>
        )}
        
        {/* Category indicator dot */}
        {!isPremium && (
          <div className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${airline.category === 'full-service' ? 'bg-sky-400' : 'bg-emerald-400'} shadow-lg`} />
        )}
      </div>
      
      {/* Airline name with enhanced styling */}
      <div className="text-center opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-0.5">
        <p className={`text-sm font-semibold ${isPremium ? 'text-amber-200' : 'text-foreground'} truncate max-w-[110px] drop-shadow-sm`}>
          {airline.name}
        </p>
        {airline.alliance && airline.alliance !== 'Independent' && (
          <p className={`text-xs ${isPremium ? 'text-amber-400/80' : 'text-muted-foreground'} font-medium mt-0.5`}>
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
        className="flex gap-8 py-2 overflow-x-auto scrollbar-hide"
        style={{ width: 'max-content' }}
      >
        {airlines.map((airline) => (
          <AirlineLogo key={airline.code} airline={airline} size={isPremium ? 'lg' : 'md'} isPremium={isPremium} />
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
