import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

export type TravelServiceType = "flights" | "hotels" | "cars";

const serviceGradients = {
  flights: "from-sky-500 via-blue-500 to-cyan-500",
  hotels: "from-amber-500 via-orange-500 to-yellow-500",
  cars: "from-violet-500 via-purple-500 to-fuchsia-500",
};

interface TravelSearchCardProps {
  service: TravelServiceType;
  disclaimer: string;
  children: ReactNode;
  className?: string;
}

export default function TravelSearchCard({
  service,
  disclaimer,
  children,
  className,
}: TravelSearchCardProps) {
  const gradient = serviceGradients[service];

  return (
    <Card className={cn(
      "max-w-4xl mx-auto overflow-hidden border-0 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/40 ring-1 ring-white/10",
      className
    )}>
      <div className={cn("h-1.5 bg-gradient-to-r", gradient)} />
      <CardContent className="p-4 sm:p-6">
        {children}
        
        {/* Affiliate Notice */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{disclaimer}</span>
        </div>
      </CardContent>
    </Card>
  );
}
