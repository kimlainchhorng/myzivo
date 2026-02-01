/**
 * City Autocomplete for Hotel Search
 * Provides city suggestions with proper slugs for URL routing
 */

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchCities, getPopularCities, type City } from "@/data/cities";
import { cn } from "@/lib/utils";

interface CityAutocompleteProps {
  value: string;
  onChange: (city: City | null, displayValue: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = "City or destination",
  className,
  inputClassName,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update input when value changes externally
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.length >= 2) {
      const results = searchCities(newValue, 8);
      setSuggestions(results);
      setIsOpen(true);
      setHighlightedIndex(-1);
    } else if (newValue.length === 0) {
      // Show popular cities when empty
      setSuggestions(getPopularCities(6));
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    
    // Clear selected city when typing
    onChange(null, newValue);
  };

  const handleFocus = () => {
    if (inputValue.length >= 2) {
      const results = searchCities(inputValue, 8);
      setSuggestions(results);
    } else {
      // Show popular cities when focused with empty input
      setSuggestions(getPopularCities(6));
    }
    setIsOpen(true);
  };

  const handleSelectCity = (city: City) => {
    setInputValue(city.name);
    onChange(city, city.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelectCity(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleClear = () => {
    setInputValue("");
    onChange(null, "");
    setSuggestions(getPopularCities(6));
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-hotels" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "pl-11 pr-10 h-12 text-base rounded-xl border-border/50 focus:border-hotels",
            inputClassName
          )}
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="py-2">
            {inputValue.length < 2 && (
              <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium">
                Popular destinations
              </div>
            )}
            {suggestions.map((city, index) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelectCity(city)}
                className={cn(
                  "w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-accent transition-colors",
                  highlightedIndex === index && "bg-accent"
                )}
              >
                <MapPin className="w-4 h-4 text-hotels shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{city.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {city.region ? `${city.region}, ` : ''}{city.country}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && inputValue.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-lg p-4 text-center">
          <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No cities found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
