/**
 * Premium Hotel Search Form
 * Mobile-first, conversion-optimized design
 */

import { useState } from "react";
import { MapPin, Calendar, Users, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface HotelSearchFormProps {
  initialDestination?: string;
  onSearch: (params: HotelSearchParams) => void;
  className?: string;
}

export interface HotelSearchParams {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms: number;
}

export default function HotelSearchForm({ 
  initialDestination = "", 
  onSearch,
  className 
}: HotelSearchFormProps) {
  const [destination, setDestination] = useState(initialDestination);
  const [checkIn, setCheckIn] = useState<Date>(addDays(new Date(), 7));
  const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 10));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);

  const handleSearch = () => {
    if (destination.trim()) {
      onSearch({
        destination: destination.trim(),
        checkIn,
        checkOut,
        guests,
        rooms,
      });
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
        {/* Destination */}
        <div className="lg:col-span-2">
          <Label className="text-xs text-muted-foreground mb-1.5 block">Destination</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-hotels" />
            <Input
              type="text"
              placeholder="City, hotel, or area"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-11 h-12 text-base rounded-xl border-border/50 focus:border-hotels"
            />
          </div>
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
                <span className="truncate">{guests} guest{guests !== 1 ? 's' : ''}, {rooms} room{rooms !== 1 ? 's' : ''}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Guests</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{guests}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setGuests(Math.min(10, guests + 1))}
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

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        disabled={!destination.trim()}
        size="lg"
        className="w-full sm:w-auto mt-4 h-14 px-10 rounded-xl bg-hotels hover:bg-hotels/90 text-white font-semibold text-lg"
      >
        <Search className="w-5 h-5 mr-2" />
        Search Hotels
      </Button>
    </div>
  );
}
