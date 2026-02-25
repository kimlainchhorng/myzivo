/**
 * Cross-sell banner promoting travel services
 * For use on zivodriver.com or other ZIVO properties
 */
import { Plane, Hotel, Car, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TravelCrossSellProps {
  className?: string;
  source?: string;
}

const TRAVEL_CROSSSELL_URL = "https://hizovo.com";

const buildCrossSellUrl = (path: string, source: string = 'driver') => {
  return `${TRAVEL_CROSSSELL_URL}${path}?utm_source=zivodriver&utm_medium=crosssell&utm_campaign=${source}`;
};

const services = [
  { 
    name: 'Flights', 
    icon: Plane, 
    path: '/flights',
    color: 'text-sky-500 hover:text-sky-400'
  },
  { 
    name: 'Hotels', 
    icon: Hotel, 
    path: '/hotels',
    color: 'text-amber-500 hover:text-amber-400'
  },
  { 
    name: 'Cars', 
    icon: Car, 
    path: '/rent-car',
    color: 'text-primary hover:text-primary/80'
  },
];

export default function TravelCrossSell({ className, source = 'driver' }: TravelCrossSellProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="text-sm text-muted-foreground">Also on ZIVO:</span>
      <div className="flex items-center gap-3">
        {services.map((service) => (
          <a
            key={service.name}
            href={buildCrossSellUrl(service.path, source)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:scale-105",
              service.color
            )}
          >
            <service.icon className="w-4 h-4" />
            {service.name}
          </a>
        ))}
      </div>
    </div>
  );
}

// Footer version with vertical layout
export function TravelCrossSellFooter({ className, source = 'driver' }: TravelCrossSellProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium">Book Travel with ZIVO</p>
      <div className="flex flex-wrap gap-4">
        {services.map((service) => (
          <a
            key={service.name}
            href={buildCrossSellUrl(service.path, source)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 group p-2 rounded-xl hover:bg-muted/50 touch-manipulation active:scale-[0.97]"
          >
            <service.icon className="w-4 h-4" />
            {service.name}
            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </a>
        ))}
      </div>
    </div>
  );
}
