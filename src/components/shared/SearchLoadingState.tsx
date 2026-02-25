/**
 * SearchLoadingState - Premium loading experience for flight/hotel search
 */

import { useState, useEffect } from "react";
import { Plane, Building2, Car, Search, Sparkles, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type SearchType = "flights" | "hotels" | "cars";

interface SearchLoadingStateProps {
  type?: SearchType;
  origin?: string;
  destination?: string;
  className?: string;
}

const searchMessages: Record<SearchType, string[]> = {
  flights: [
    "Searching thousands of flights...",
    "Comparing prices across airlines...",
    "Finding the best deals for you...",
    "Checking seat availability...",
    "Almost there...",
  ],
  hotels: [
    "Searching hotel availability...",
    "Comparing rates across providers...",
    "Finding the best deals...",
    "Checking room availability...",
    "Almost there...",
  ],
  cars: [
    "Searching rental companies...",
    "Comparing vehicle options...",
    "Finding the best rates...",
    "Checking availability...",
    "Almost there...",
  ],
};

const typeIcons: Record<SearchType, typeof Plane> = {
  flights: Plane,
  hotels: Building2,
  cars: Car,
};

const partnerLogos = [
  { name: "Emirates", color: "bg-red-500" },
  { name: "Delta", color: "bg-blue-600" },
  { name: "United", color: "bg-blue-800" },
  { name: "Marriott", color: "bg-red-700" },
  { name: "Hilton", color: "bg-blue-500" },
  { name: "Hertz", color: "bg-yellow-500" },
];

export function SearchLoadingState({
  type = "flights",
  origin,
  destination,
  className,
}: SearchLoadingStateProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [activePartner, setActivePartner] = useState(0);

  const messages = searchMessages[type];
  const Icon = typeIcons[type];

  useEffect(() => {
    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    // Message rotation
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    // Partner logo animation
    const partnerTimer = setInterval(() => {
      setActivePartner((prev) => (prev + 1) % partnerLogos.length);
    }, 1000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
      clearInterval(partnerTimer);
    };
  }, [messages.length]);

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
      {/* Animated Icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -right-1 -top-1">
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      {/* Route Display */}
      {origin && destination && (
        <div className="flex items-center gap-3 mb-6 text-lg font-medium">
          <span>{origin}</span>
          <div className="w-8 h-0.5 bg-border relative">
            <Icon className="w-4 h-4 text-primary absolute -top-2 left-1/2 -translate-x-1/2" />
          </div>
          <span>{destination}</span>
        </div>
      )}

      {/* Loading Message */}
      <div className="h-8 mb-6">
        <p className="text-lg text-muted-foreground animate-fade-in">
          {messages[messageIndex]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground text-center mt-2">
          {Math.min(Math.round(progress), 99)}% complete
        </p>
      </div>

      {/* Partner Logos Animation */}
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Searching partners:</span>
      </div>
       <div className="flex items-center gap-3">
        {partnerLogos.slice(0, 5).map((partner, index) => (
          <div
            key={partner.name}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-bold transition-all duration-300",
              partner.color,
              activePartner === index ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-50 scale-90"
            )}
          >
            {partner.name.slice(0, 2)}
          </div>
        ))}
      </div>

      {/* Trust Notice */}
      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Globe2 className="w-4 h-4" />
        <span>Searching 500+ travel providers worldwide</span>
      </div>
    </div>
  );
}

// Compact inline loading
export function SearchLoadingInline({
  message = "Finding best prices...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

export default SearchLoadingState;
