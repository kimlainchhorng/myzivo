/**
 * COUNTRY SELECTOR
 * 
 * Dropdown for selecting user's country/region
 * Updates geo detection and currency preferences
 */

import { useState } from "react";
import { MapPin, ChevronDown, Check, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getLaunchedCountries, 
  getCountriesByRegion,
  type CountryConfig,
  type Region 
} from "@/config/internationalExpansion";
import { useGeoDetection } from "@/hooks/useGeoDetection";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface CountrySelectorProps {
  variant?: "default" | "compact" | "icon";
  showCurrency?: boolean;
  className?: string;
}

const REGION_LABELS: Record<Region, string> = {
  "north-america": "North America",
  "europe": "Europe",
  "asia-pacific": "Asia Pacific",
  "middle-east": "Middle East",
  "latin-america": "Latin America",
};

export default function CountrySelector({
  variant = "default",
  showCurrency = true,
  className,
}: CountrySelectorProps) {
  const { geo, country, setCountry, isOverridden, resetToDetected } = useGeoDetection();
  const { setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  
  const launchedCountries = getLaunchedCountries();
  
  // Group by region
  const groupedCountries: Record<string, CountryConfig[]> = {};
  launchedCountries.forEach((c) => {
    if (!groupedCountries[c.region]) {
      groupedCountries[c.region] = [];
    }
    groupedCountries[c.region].push(c);
  });
  
  const handleSelect = (countryConfig: CountryConfig) => {
    setCountry(countryConfig.code);
    // Also update currency to match country default
    setCurrency(countryConfig.currency);
    setOpen(false);
  };
  
  if (variant === "icon") {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={className}>
            <span className="text-lg">{country?.flag || "🌍"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Select Region
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(groupedCountries).map(([region, countries]) => (
            <DropdownMenuGroup key={region}>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {REGION_LABELS[region as Region]}
              </DropdownMenuLabel>
              {countries.map((c) => (
                <DropdownMenuItem
                  key={c.code}
                  onClick={() => handleSelect(c)}
                  className="justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </span>
                  {country?.code === c.code && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
          {isOverridden && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={resetToDetected} className="text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                Use detected location
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  if (variant === "compact") {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <span>{country?.flag || "🌍"}</span>
            <span>{country?.code || "US"}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {launchedCountries.map((c) => (
            <DropdownMenuItem
              key={c.code}
              onClick={() => handleSelect(c)}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </span>
              {country?.code === c.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  // Default variant
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("gap-2 min-w-[180px]", className)}>
          <span className="text-lg">{country?.flag || "🌍"}</span>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">{country?.name || "Select Country"}</span>
            {showCurrency && country && (
              <span className="text-xs text-muted-foreground">{country.currency}</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Select Your Region
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.entries(groupedCountries).map(([region, countries]) => (
          <DropdownMenuGroup key={region}>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              {REGION_LABELS[region as Region]}
            </DropdownMenuLabel>
            {countries.map((c) => (
              <DropdownMenuItem
                key={c.code}
                onClick={() => handleSelect(c)}
                className="justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{c.flag}</span>
                  <div>
                    <span className="block">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.currency}</span>
                  </div>
                </span>
                {country?.code === c.code && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
        
        {isOverridden && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={resetToDetected} className="text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              Use detected location
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <p className="text-[10px] text-muted-foreground">
            Prices shown in your local currency are estimates. Final price confirmed at checkout.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
