/**
 * ZIVO Country Selector Component
 * User-facing country/locale selection
 */

import { useState, useEffect } from "react";
import { Globe, ChevronDown, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useCountries } from "@/hooks/useGlobalExpansion";
import { useGeoLocation, useSaveLocalePreferences } from "@/hooks/useGeoLocation";
import { Country } from "@/types/global";

interface CountrySelectorProps {
  value?: string;
  onChange?: (countryCode: string) => void;
  showDetectedBadge?: boolean;
  variant?: "default" | "compact" | "inline";
}

export function CountrySelector({
  value,
  onChange,
  showDetectedBadge = true,
  variant = "default",
}: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const { data: countries, isLoading } = useCountries(true);
  const { countryCode: detectedCode, isDetected } = useGeoLocation();
  const savePreferences = useSaveLocalePreferences();

  // Set initial country
  useEffect(() => {
    if (!countries || countries.length === 0) return;

    // Priority: value prop > detected > US
    const code = value || detectedCode || "US";
    const country = countries.find((c) => c.code === code) || countries[0];
    setSelectedCountry(country);
  }, [countries, value, detectedCode]);

  const handleSelect = (country: Country) => {
    setSelectedCountry(country);
    onChange?.(country.code);
    
    // Save preference if authenticated
    savePreferences.mutate({
      countryCode: country.code,
      currencyCode: country.default_currency,
      languageCode: country.default_language,
    });
  };

  if (isLoading || !selectedCountry) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Globe className="w-4 h-4" />
        Loading...
      </Button>
    );
  }

  // Compact variant (header use)
  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 px-2">
            <span className="text-lg">{selectedCountry.flag_emoji}</span>
            <span className="hidden sm:inline">{selectedCountry.code}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Select Country</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {countries?.map((country) => (
            <DropdownMenuItem
              key={country.id}
              onClick={() => handleSelect(country)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.flag_emoji}</span>
                <span>{country.name}</span>
              </div>
              {selectedCountry.id === country.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Inline variant (form field use)
  if (variant === "inline") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag_emoji}</span>
              <span>{selectedCountry.name}</span>
            </div>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px]">
          {countries?.map((country) => (
            <DropdownMenuItem
              key={country.id}
              onClick={() => handleSelect(country)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.flag_emoji}</span>
                <span>{country.name}</span>
              </div>
              {selectedCountry.id === country.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant (prominent display)
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-3 h-12 px-4">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span className="text-xl">{selectedCountry.flag_emoji}</span>
            <div className="text-left">
              <p className="font-medium">{selectedCountry.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedCountry.default_currency} · {selectedCountry.default_language.toUpperCase()}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Select Your Country
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Detected country suggestion */}
          {showDetectedBadge && isDetected && detectedCode && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  const detected = countries?.find((c) => c.code === detectedCode);
                  if (detected) handleSelect(detected);
                }}
                className="bg-primary/5"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Detected: </span>
                  <span className="font-medium">
                    {countries?.find((c) => c.code === detectedCode)?.name || detectedCode}
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* All countries */}
          {countries?.map((country) => (
            <DropdownMenuItem
              key={country.id}
              onClick={() => handleSelect(country)}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{country.flag_emoji}</span>
                <div>
                  <p className="font-medium">{country.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {country.default_currency} · {country.default_language.toUpperCase()}
                  </p>
                </div>
              </div>
              {selectedCountry.id === country.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Detected badge */}
      {showDetectedBadge && isDetected && selectedCountry.code === detectedCode && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 text-[10px] bg-primary/10 text-primary"
        >
          <MapPin className="w-3 h-3 mr-1" />
          Detected
        </Badge>
      )}
    </div>
  );
}
