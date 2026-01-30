import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Plane,
  Info,
  Check,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAirlineLogo, allAirlines, type Airline } from "@/data/airlines";

export interface CodeshareInfo {
  operatingCarrier: {
    code: string;
    name: string;
    flightNumber: string;
  };
  marketingCarriers: {
    code: string;
    name: string;
    flightNumber: string;
    alliance?: string;
  }[];
}

interface CodeshareFlightsProps {
  codeshares: CodeshareInfo[];
  showDetails?: boolean;
}

// Generate codeshare partners based on alliances
export const generateCodeshares = (operatingCode: string): CodeshareInfo | null => {
  const operatingAirline = allAirlines.find(a => a.code === operatingCode);
  if (!operatingAirline || !operatingAirline.alliance || operatingAirline.alliance === 'Independent') {
    return null;
  }

  // Find alliance partners
  const partners = allAirlines
    .filter(a => 
      a.alliance === operatingAirline.alliance && 
      a.code !== operatingCode
    )
    .slice(0, 3);

  if (partners.length === 0) return null;

  return {
    operatingCarrier: {
      code: operatingCode,
      name: operatingAirline.name,
      flightNumber: `${operatingCode} ${Math.floor(Math.random() * 900 + 100)}`
    },
    marketingCarriers: partners.map(p => ({
      code: p.code,
      name: p.name,
      flightNumber: `${p.code} ${Math.floor(Math.random() * 9000 + 1000)}`,
      alliance: p.alliance
    }))
  };
};

const CodeshareFlights = ({ codeshares, showDetails = false }: CodeshareFlightsProps) => {
  if (!codeshares || codeshares.length === 0) return null;

  return (
    <div className="space-y-3">
      {codeshares.map((codeshare, index) => (
        <div
          key={index}
          className="p-4 rounded-xl bg-muted/30 border border-border/50"
        >
          {/* Operating carrier */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/30">
            <div className="w-10 h-10 rounded-lg bg-white/90 dark:bg-muted/50 flex items-center justify-center overflow-hidden">
              <img
                src={getAirlineLogo(codeshare.operatingCarrier.code)}
                alt={codeshare.operatingCarrier.name}
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{codeshare.operatingCarrier.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {codeshare.operatingCarrier.flightNumber}
              </p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/40 text-xs">
              <Plane className="w-3 h-3 mr-1" />
              Operating
            </Badge>
          </div>

          {/* Marketing carriers */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              Also sold as:
            </p>
            <div className="grid sm:grid-cols-3 gap-2">
              {codeshare.marketingCarriers.map((carrier, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/30"
                >
                  <div className="w-6 h-6 rounded bg-white/90 dark:bg-muted/50 flex items-center justify-center overflow-hidden">
                    <img
                      src={getAirlineLogo(carrier.code, 50)}
                      alt={carrier.name}
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{carrier.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {carrier.flightNumber}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alliance info */}
          {codeshare.marketingCarriers[0]?.alliance && (
            <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="w-3.5 h-3.5" />
                <span>{codeshare.marketingCarriers[0].alliance} Alliance</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                <Check className="w-3.5 h-3.5" />
                <span>Earn miles on all carriers</span>
              </div>
            </div>
          )}
        </div>
      ))}

      {showDetails && (
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-500" />
            What is a codeshare flight?
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A codeshare is when one airline operates a flight but other airlines sell seats on the same flight 
            under their own flight numbers. You'll fly on the operating carrier's aircraft, but can book 
            through any of the marketing carriers and earn miles with your preferred loyalty program.
          </p>
        </div>
      )}
    </div>
  );
};

export default CodeshareFlights;
