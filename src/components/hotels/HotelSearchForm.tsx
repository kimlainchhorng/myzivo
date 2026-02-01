/**
 * Premium Hotel Search Form
 * With city autocomplete and proper URL routing
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addDays, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import CityAutocomplete from "./CityAutocomplete";
import { getCityBySlug, cityNameToSlug, type City } from "@/data/cities";

export interface HotelSearchParams {
  citySlug: string;
  cityName: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  rooms: number;
}

interface HotelSearchFormProps {
  initialCity?: string;
  initialCheckIn?: Date;
  initialCheckOut?: Date;
  initialAdults?: number;
  initialRooms?: number;
  onSearch?: (params: HotelSearchParams) => void;
  className?: string;
  navigateOnSearch?: boolean;
}

export default function HotelSearchForm({
  initialCity = "",
  initialCheckIn,
  initialCheckOut,
  initialAdults = 2,
  initialRooms = 1,
  onSearch,
  className,
  navigateOnSearch = true,
}: HotelSearchFormProps) {
  const navigate = useNavigate();
  
  // State
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityDisplayName, setCityDisplayName] = useState(initialCity);
  const [checkIn, setCheckIn] = useState<Date>(initialCheckIn || addDays(new Date(), 7));
  const [checkOut, setCheckOut] = useState<Date>(initialCheckOut || addDays(new Date(), 10));
  const [adults, setAdults] = useState(initialAdults);
  const [rooms, setRooms] = useState(initialRooms);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  
  // Calculate nights
  const nights = Math.max(1, differenceInDays(checkOut, checkIn));

  // Handle city selection from autocomplete
  const handleCityChange = (city: City | null, displayValue: string) => {
    setSelectedCity(city);
    setCityDisplayName(displayValue);
  };

  // Handle search submit
  const handleSearch = () => {
    // Get city slug - either from selected city or generate from display name
    const citySlug = selectedCity?.slug || cityNameToSlug(cityDisplayName);
    const cityName = selectedCity?.name || cityDisplayName;
    
    if (!citySlug || !cityDisplayName.trim()) {
      return; // Don't search without a destination
    }
    
    const searchParams: HotelSearchParams = {
      citySlug,
      cityName,
      checkIn,
      checkOut,
      adults,
      rooms,
    };
    
    // Call onSearch callback if provided
    if (onSearch) {
      onSearch(searchParams);
    }
    
    // Navigate to results page
    if (navigateOnSearch) {
      const urlParams = new URLSearchParams({
        city: citySlug,
        checkin: format(checkIn, 'yyyy-MM-dd'),
        checkout: format(checkOut, 'yyyy-MM-dd'),
        adults: String(adults),
        rooms: String(rooms),
      });
      
      navigate(`/hotels/results?${urlParams.toString()}`);
    }
  };

  return (
    <div className={cn(
      "bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-4 sm:p-6 shadow-2xl",
      className
    )}>
      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 rounded-t-2xl mb-4 sm:mb-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Destination - with autocomplete */}
        <div className="lg:col-span-2">
          <Label className="text-xs text-muted-foreground mb-1.5 block">Destination</Label>
          <CityAutocomplete
            value={cityDisplayName}
            onChange={handleCityChange}
            placeholder="City or destination"
          />
        </div>

        {/* Check-in */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Check-in</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start text-left font-normal rounded-xl border-border/50"
              >
                <Calendar className="w-4 h-4 mr-2 text-hotels" />
                <span className="truncate">{format(checkIn, "MMM d")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={checkIn}
                onSelect={(date) => {
                  if (date) {
                    setCheckIn(date);
                    if (date >= checkOut) {
                      setCheckOut(addDays(date, 1));
                    }
                  }
                }}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Check-out</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start text-left font-normal rounded-xl border-border/50"
              >
                <Calendar className="w-4 h-4 mr-2 text-hotels" />
                <span className="truncate">{format(checkOut, "MMM d")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={checkOut}
                onSelect={(date) => date && setCheckOut(date)}
                disabled={(date) => date <= checkIn}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests & Rooms */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Guests</Label>
          <Popover open={isGuestPopoverOpen} onOpenChange={setIsGuestPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start text-left font-normal rounded-xl border-border/50"
              >
                <Users className="w-4 h-4 mr-2 text-hotels" />
                <span className="truncate">{adults} guest{adults !== 1 ? 's' : ''}, {rooms} room{rooms !== 1 ? 's' : ''}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Adults</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{adults}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setAdults(Math.min(10, adults + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Rooms</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{rooms}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setRooms(Math.min(5, rooms + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => setIsGuestPopoverOpen(false)}
                >
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Nights indicator + Search Button */}
      <div className="flex items-center justify-between mt-4 gap-4">
        <div className="text-sm text-muted-foreground">
          {nights} night{nights !== 1 ? 's' : ''}
        </div>
        <Button
          onClick={handleSearch}
          disabled={!cityDisplayName.trim()}
          size="lg"
          className="h-14 px-10 rounded-xl bg-hotels hover:bg-hotels/90 text-white font-semibold text-lg"
        >
          <Search className="w-5 h-5 mr-2" />
          Search Hotels
        </Button>
      </div>
    </div>
  );
}
