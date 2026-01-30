import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  MapPin, 
  Clock, 
  Star, 
  TrendingUp,
  History,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchAirports, getPopularAirports, formatAirportDisplay, type Airport } from "@/data/airports";

interface AirportAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  recentSearches?: string[];
  excludeCode?: string;
}

const AirportAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "City or airport",
  label,
  recentSearches = [],
  excludeCode
}: AirportAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Airport[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search airports when query changes
  useEffect(() => {
    if (query.length >= 2) {
      const searchResults = searchAirports(query)
        .filter(a => a.code !== excludeCode)
        .slice(0, 8);
      setResults(searchResults);
    } else {
      // Show popular airports when no query
      const popular = getPopularAirports(8).filter(a => a.code !== excludeCode);
      setResults(popular);
    }
  }, [query, excludeCode]);

  const handleSelect = (airport: Airport) => {
    const displayValue = formatAirportDisplay(airport);
    setQuery(displayValue);
    onChange(displayValue);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  const getRegionIcon = (region: string) => {
    const icons: Record<string, string> = {
      'North America': '🇺🇸',
      'Europe': '🇪🇺',
      'Asia': '🌏',
      'Middle East': '🕌',
      'Oceania': '🌊',
      'Africa': '🌍',
      'South America': '🌎'
    };
    return icons[region] || '🌐';
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 block font-medium">{label}</label>
      )}
      <div className="relative">
        <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-sky-500/15 to-cyan-500/10 flex items-center justify-center">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
        </div>
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="h-10 sm:h-11 pl-10 sm:pl-12 text-sm bg-muted/50"
        />
      </div>

      {/* Dropdown - Compact */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card rounded-lg border border-border shadow-xl shadow-black/30 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Recent searches - Compact */}
          {recentSearches.length > 0 && query.length < 2 && (
            <div className="p-2.5 sm:p-3 border-b border-border bg-muted/40">
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gradient-to-br from-sky-500/25 to-cyan-500/25 flex items-center justify-center">
                  <History className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-400" />
                </div>
                Recent
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.slice(0, 3).map((search, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(search);
                      onChange(search);
                      setIsOpen(false);
                    }}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-background hover:bg-sky-500/10 border border-border hover:border-sky-500/40 text-xs font-medium rounded-lg transition-all touch-manipulation active:scale-95"
                  >
                    <MapPin className="w-3 h-3 text-muted-foreground group-hover:text-sky-400" />
                    <span className="text-foreground group-hover:text-sky-400">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section header - Compact */}
          <div className="px-2.5 sm:px-3 py-2 bg-muted/50 border-b border-border">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              {query.length >= 2 ? (
                <>
                  <Globe className="w-3 h-3 text-sky-400" />
                  Results
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3 text-sky-400" />
                  Popular
                </>
              )}
            </p>
          </div>

          {/* Results - Compact */}
          <div className="max-h-[280px] sm:max-h-[320px] overflow-y-auto bg-card">
            {results.length > 0 ? (
              results.map((airport, index) => (
                <button
                  key={airport.code}
                  onClick={() => handleSelect(airport)}
                  className="w-full px-2.5 sm:px-3 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 hover:bg-sky-500/8 transition-all text-left group border-b border-border/30 last:border-0 touch-manipulation active:scale-[0.99]"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Airport icon - Compact */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-sky-500/30 group-hover:to-cyan-500/30 transition-all border border-sky-500/20 group-hover:border-sky-500/40">
                    <span className="text-lg sm:text-xl">{getRegionIcon(airport.region)}</span>
                  </div>

                  {/* Airport details - Compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-foreground group-hover:text-sky-400 transition-colors">{airport.city}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono font-bold text-sky-400 border-sky-500/50 bg-sky-500/10">
                        {airport.code}
                      </Badge>
                      {airport.popularity && airport.popularity >= 9 && (
                        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/40 text-[9px] px-1.5 py-0 h-4">
                          <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                          Hub
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-foreground/70 truncate mt-0.5 group-hover:text-foreground/80">
                      {airport.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {airport.country}
                    </p>
                  </div>

                  {/* Arrow - Compact */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted group-hover:bg-sky-500/15 flex items-center justify-center transition-all">
                    <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-sky-400 -rotate-45" />
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-6 text-center bg-card">
                <Globe className="w-7 h-7 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No airports found</p>
                <p className="text-xs text-muted-foreground mt-0.5">Try a different term</p>
              </div>
            )}
          </div>

          {/* Footer - Compact */}
          <div className="px-2.5 py-2 bg-muted/50 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center">
              Search by city, airport, or code
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
