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
        <label className="text-sm text-muted-foreground mb-1 block">{label}</label>
      )}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="h-12 pl-10 bg-background/50"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border border-border shadow-2xl shadow-black/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Recent searches */}
          {recentSearches.length > 0 && query.length < 2 && (
            <div className="p-4 border-b border-border bg-muted/50">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500/30 to-cyan-500/30 flex items-center justify-center">
                  <History className="w-4 h-4 text-sky-400" />
                </div>
                Recent Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.slice(0, 3).map((search, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(search);
                      onChange(search);
                      setIsOpen(false);
                    }}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-background hover:bg-sky-500/15 border border-border hover:border-sky-500/50 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-sky-500/10"
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-sky-400 transition-colors" />
                    <span className="text-foreground group-hover:text-sky-400 transition-colors">{search}</span>
                    <Plane className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-sky-400 -rotate-45 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section header */}
          <div className="px-4 py-3 bg-muted/60 border-b border-border">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              {query.length >= 2 ? (
                <>
                  <Globe className="w-4 h-4 text-sky-400" />
                  Search Results
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  Popular Airports
                </>
              )}
            </p>
          </div>

          {/* Results */}
          <div className="max-h-[400px] md:max-h-[450px] overflow-y-auto bg-card">
            {results.length > 0 ? (
              results.map((airport, index) => (
                <button
                  key={airport.code}
                  onClick={() => handleSelect(airport)}
                  className="w-full px-4 py-4 md:py-5 flex items-center gap-4 hover:bg-sky-500/10 transition-all duration-200 text-left group border-b border-border/50 last:border-0"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Airport icon with region */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-sky-500/25 via-blue-500/20 to-cyan-500/25 flex items-center justify-center flex-shrink-0 group-hover:from-sky-500/35 group-hover:via-blue-500/30 group-hover:to-cyan-500/35 transition-all duration-300 shadow-lg shadow-sky-500/10 group-hover:shadow-sky-500/25 group-hover:scale-105 border border-sky-500/30 group-hover:border-sky-500/50">
                    <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-300">{getRegionIcon(airport.region)}</span>
                  </div>

                  {/* Airport details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base md:text-lg text-foreground group-hover:text-sky-400 transition-colors">{airport.city}</span>
                      <Badge variant="outline" className="text-xs md:text-sm px-2.5 py-0.5 h-6 font-mono font-bold text-sky-400 border-sky-500/60 bg-sky-500/15 group-hover:bg-sky-500/25 transition-colors">
                        {airport.code}
                      </Badge>
                      {airport.popularity && airport.popularity >= 9 && (
                        <Badge className="bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-400 border-amber-500/50 text-xs px-2.5 py-0.5">
                          <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                          Major Hub
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm md:text-base text-foreground/80 truncate mt-1.5 group-hover:text-foreground transition-colors">
                      {airport.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-xs md:text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors">
                        {airport.country} • {airport.region}
                      </p>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-muted group-hover:bg-sky-500/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <Plane className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground group-hover:text-sky-400 transition-all duration-300 -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-10 text-center bg-card">
                <Globe className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-base font-medium text-foreground">No airports found</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer tip */}
          <div className="px-4 py-3 bg-muted/60 border-t border-border">
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              Search by city name, airport name, or IATA code
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
