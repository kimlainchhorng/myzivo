import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  User, Crown, Sparkles, Plane, Info, Check, X,
  Wifi, Monitor, Power, Coffee, Utensils, Wine,
  Baby, Accessibility, ArrowUpDown, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Seat {
  id: string;
  row: number;
  column: string;
  type: 'standard' | 'extra-legroom' | 'exit-row' | 'premium' | 'first';
  price: number;
  isAvailable: boolean;
  isWindow: boolean;
  isAisle: boolean;
  isMiddle: boolean;
  amenities?: string[];
  legroom?: string;
}

interface SeatSelectorProps {
  fareClass: 'economy' | 'premium-economy' | 'business' | 'first';
  onSeatSelect: (seat: Seat | null) => void;
  selectedSeat?: Seat | null;
  basePrice?: number;
  passengerCount?: number;
  aircraft?: string;
}

interface SeatAmenity {
  id: string;
  label: string;
  icon: typeof Wifi;
}

const SEAT_AMENITIES: Record<string, SeatAmenity[]> = {
  'first': [
    { id: 'wifi', label: 'Premium WiFi', icon: Wifi },
    { id: 'screen', label: '18" HD Display', icon: Monitor },
    { id: 'power', label: 'AC Power + USB', icon: Power },
    { id: 'dining', label: 'Fine Dining', icon: Wine },
  ],
  'premium': [
    { id: 'wifi', label: 'Fast WiFi', icon: Wifi },
    { id: 'screen', label: '15" Display', icon: Monitor },
    { id: 'power', label: 'AC Power', icon: Power },
    { id: 'meals', label: 'Premium Meals', icon: Utensils },
  ],
  'extra-legroom': [
    { id: 'legroom', label: '+4" Legroom', icon: ArrowUpDown },
    { id: 'power', label: 'USB Charging', icon: Power },
  ],
  'exit-row': [
    { id: 'legroom', label: '+6" Legroom', icon: ArrowUpDown },
    { id: 'power', label: 'USB Charging', icon: Power },
  ],
  'standard': [
    { id: 'screen', label: '10" Display', icon: Monitor },
  ],
};

const LEGROOM_INFO: Record<string, string> = {
  'first': '62" (157cm)',
  'premium': '38" (97cm)',
  'exit-row': '36" (91cm)',
  'extra-legroom': '34" (86cm)',
  'standard': '30" (76cm)',
};

const generateSeats = (fareClass: string): Seat[][] => {
  const rows: Seat[][] = [];
  const columns = fareClass === 'first' ? ['A', 'C', 'D', 'F'] : 
                  fareClass === 'business' ? ['A', 'C', 'D', 'F', 'G', 'K'] :
                  ['A', 'B', 'C', 'D', 'E', 'F'];
  
  const rowCount = fareClass === 'first' ? 4 : 
                   fareClass === 'business' ? 8 : 32;
  
  for (let row = 1; row <= rowCount; row++) {
    const seatRow: Seat[] = [];
    columns.forEach((col) => {
      const isWindow = col === 'A' || col === columns[columns.length - 1];
      const isAisle = fareClass === 'economy' ? (col === 'C' || col === 'D') : 
                      (col === 'C' || col === 'D' || col === 'G');
      const isMiddle = !isWindow && !isAisle;
      
      const isExitRow = row === 14 || row === 26;
      const isExtraLegroom = row <= 4;
      
      let type: Seat['type'] = 'standard';
      let price = 0;
      
      if (fareClass === 'first') {
        type = 'first';
        price = 0;
      } else if (fareClass === 'business') {
        type = 'premium';
        price = 0;
      } else if (isExitRow) {
        type = 'exit-row';
        price = 55;
      } else if (isExtraLegroom) {
        type = 'extra-legroom';
        price = 40;
      } else if (isWindow) {
        price = 18;
      } else if (isAisle) {
        price = 15;
      }
      
      seatRow.push({
        id: `${row}${col}`,
        row,
        column: col,
        type,
        price,
        isAvailable: Math.random() > 0.28,
        isWindow,
        isAisle,
        isMiddle,
        amenities: SEAT_AMENITIES[type]?.map(a => a.id) || [],
        legroom: LEGROOM_INFO[type],
      });
    });
    rows.push(seatRow);
  }
  return rows;
};

export default function SeatSelector({ 
  fareClass, 
  onSeatSelect, 
  selectedSeat,
  basePrice = 0,
  passengerCount = 1,
  aircraft = 'Boeing 787-9 Dreamliner'
}: SeatSelectorProps) {
  const [seats] = useState(() => generateSeats(fareClass));
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState(1);
  const [passengerSeats, setPassengerSeats] = useState<Record<number, Seat>>({});
  const [showLegend, setShowLegend] = useState(true);
  
  const handleSeatSelect = (seat: Seat) => {
    if (!seat.isAvailable) return;
    
    const isAlreadySelected = Object.values(passengerSeats).some(s => s.id === seat.id);
    
    if (isAlreadySelected) {
      const passenger = Object.entries(passengerSeats).find(([, s]) => s.id === seat.id)?.[0];
      if (passenger) {
        const newSeats = { ...passengerSeats };
        delete newSeats[Number(passenger)];
        setPassengerSeats(newSeats);
      }
    } else {
      setPassengerSeats({ ...passengerSeats, [selectedPassenger]: seat });
      if (selectedPassenger < passengerCount) {
        setSelectedPassenger(selectedPassenger + 1);
      }
    }
    
    onSeatSelect(seat);
  };

  const getSeatColor = (seat: Seat) => {
    const isSelectedByAny = Object.values(passengerSeats).some(s => s.id === seat.id);
    
    if (!seat.isAvailable) return 'bg-muted/40 cursor-not-allowed opacity-50';
    if (isSelectedByAny) return 'bg-primary text-primary-foreground ring-2 ring-primary shadow-lg shadow-primary/30';
    
    switch (seat.type) {
      case 'first':
        return 'bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-amber-500/60 hover:from-amber-500/50 hover:to-yellow-500/30';
      case 'premium':
        return 'bg-gradient-to-br from-purple-500/30 to-violet-500/20 border-purple-500/60 hover:from-purple-500/50 hover:to-violet-500/30';
      case 'exit-row':
        return 'bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border-emerald-500/60 hover:from-emerald-500/50 hover:to-teal-500/30';
      case 'extra-legroom':
        return 'bg-gradient-to-br from-sky-500/30 to-blue-500/20 border-sky-500/60 hover:from-sky-500/50 hover:to-blue-500/30';
      default:
        return 'bg-card/60 border-border/60 hover:bg-card hover:border-border';
    }
  };

  const getPassengerForSeat = (seatId: string): number | null => {
    const entry = Object.entries(passengerSeats).find(([, s]) => s.id === seatId);
    return entry ? Number(entry[0]) : null;
  };
  
  const columns = fareClass === 'first' ? ['A', '', 'C', 'D', '', 'F'] : 
                  fareClass === 'business' ? ['A', '', 'C', 'D', '', 'G', '', 'K'] :
                  ['A', 'B', 'C', '', 'D', 'E', 'F'];

  const totalSeatPrice = Object.values(passengerSeats).reduce((sum, s) => sum + s.price, 0);
  const allSeatsSelected = Object.keys(passengerSeats).length === passengerCount;

  const amenities = SEAT_AMENITIES[hoveredSeat?.type || 'standard'] || [];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Aircraft Info */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{aircraft}</p>
              <p className="text-xs text-muted-foreground">
                {fareClass === 'first' ? 'First Class Cabin' : 
                 fareClass === 'business' ? 'Business Class Cabin' :
                 fareClass === 'premium-economy' ? 'Premium Economy Cabin' : 'Economy Cabin'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
            className="text-xs"
          >
            {showLegend ? 'Hide' : 'Show'} Legend
            <ChevronDown className={cn("w-4 h-4 ml-1 transition-transform", showLegend && "rotate-180")} />
          </Button>
        </div>

        {/* Multi-Passenger Selection */}
        {passengerCount > 1 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-sm text-muted-foreground">Selecting for:</span>
            <div className="flex gap-2">
              {Array.from({ length: passengerCount }).map((_, i) => {
                const passenger = i + 1;
                const hasSeat = passengerSeats[passenger];
                
                return (
                  <button
                    key={passenger}
                    onClick={() => setSelectedPassenger(passenger)}
                    className={cn(
                      "w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all",
                      selectedPassenger === passenger && "border-primary bg-primary text-primary-foreground",
                      selectedPassenger !== passenger && hasSeat && "border-emerald-500 bg-emerald-500/20 text-emerald-400",
                      selectedPassenger !== passenger && !hasSeat && "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {hasSeat ? <Check className="w-4 h-4" /> : passenger}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground ml-auto">
              {Object.keys(passengerSeats).length}/{passengerCount} selected
            </span>
          </div>
        )}

        {/* Legend */}
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 text-sm p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-t-lg bg-card/60 border border-border/60" />
                  <span className="text-muted-foreground">Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-t-lg bg-sky-500/30 border border-sky-500/60" />
                  <span className="text-muted-foreground">Extra Legroom <span className="text-sky-400">+$40</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-t-lg bg-emerald-500/30 border border-emerald-500/60" />
                  <span className="text-muted-foreground">Exit Row <span className="text-emerald-400">+$55</span></span>
                </div>
                {fareClass === 'first' && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-t-lg bg-amber-500/30 border border-amber-500/60" />
                    <span className="text-muted-foreground">First Class</span>
                  </div>
                )}
                {fareClass === 'business' && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-t-lg bg-purple-500/30 border border-purple-500/60" />
                    <span className="text-muted-foreground">Business</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-t-lg bg-muted/40 opacity-50" />
                  <span className="text-muted-foreground">Unavailable</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Airplane cabin visualization */}
        <div className="relative bg-gradient-to-b from-slate-800/50 via-slate-900/30 to-transparent rounded-t-[80px] pt-10 pb-6 px-4 overflow-hidden border border-border/30">
          {/* Cockpit indicator */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Plane className="w-4 h-4 text-primary rotate-0" />
            </div>
            <span>Front of aircraft</span>
          </div>

          {/* Wing indicators */}
          <div className="absolute left-0 top-1/2 w-3 h-32 -translate-y-1/2 bg-gradient-to-r from-muted/50 to-transparent rounded-r" />
          <div className="absolute right-0 top-1/2 w-3 h-32 -translate-y-1/2 bg-gradient-to-l from-muted/50 to-transparent rounded-l" />

          {/* Column headers */}
          <div className="flex justify-center gap-1 mb-3 mt-8">
            {columns.map((col, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-9 h-6 flex items-center justify-center text-xs font-semibold",
                  col === '' ? "w-6" : "text-primary/80"
                )}
              >
                {col}
              </div>
            ))}
          </div>

          {/* Seat grid */}
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
            {seats.map((row, rowIndex) => {
              const isExitRow = row[0].type === 'exit-row';
              
              return (
                <div key={rowIndex}>
                  {isExitRow && (
                    <div className="flex justify-center items-center gap-2 py-2 my-1 border-y border-dashed border-emerald-500/40">
                      <div className="w-4 h-4 rounded bg-emerald-500/30 flex items-center justify-center">
                        <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-[10px] text-emerald-400 uppercase tracking-wider">Emergency Exit</span>
                      <div className="w-4 h-4 rounded bg-emerald-500/30 flex items-center justify-center">
                        <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center gap-1.5 items-center">
                    <span className="w-6 text-xs text-muted-foreground text-right mr-1 font-mono">
                      {row[0].row}
                    </span>
                    {row.map((seat, seatIndex) => {
                      const needsGap = fareClass === 'economy' ? seatIndex === 3 : 
                                       fareClass === 'business' ? (seatIndex === 2 || seatIndex === 4) :
                                       seatIndex === 2;
                      const passengerNum = getPassengerForSeat(seat.id);
                      
                      return (
                        <div key={seat.id} className="contents">
                          {needsGap && <div className="w-6" />}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.button
                                disabled={!seat.isAvailable}
                                onClick={() => handleSeatSelect(seat)}
                                onMouseEnter={() => setHoveredSeat(seat)}
                                onMouseLeave={() => setHoveredSeat(null)}
                                whileHover={{ scale: seat.isAvailable ? 1.1 : 1 }}
                                whileTap={{ scale: seat.isAvailable ? 0.95 : 1 }}
                                className={cn(
                                  "w-9 h-9 rounded-t-lg border text-xs font-medium transition-all",
                                  "flex items-center justify-center relative",
                                  getSeatColor(seat)
                                )}
                              >
                                {seat.type === 'first' && !passengerNum && <Crown className="w-4 h-4 text-amber-400" />}
                                {seat.type === 'premium' && !passengerNum && <Sparkles className="w-4 h-4 text-purple-400" />}
                                {passengerNum && (
                                  <span className="text-xs font-bold">P{passengerNum}</span>
                                )}
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-4">
                                  <span className="font-bold">Seat {seat.id}</span>
                                  {seat.price > 0 ? (
                                    <Badge className="bg-primary/20 text-primary">+${seat.price}</Badge>
                                  ) : (
                                    <Badge variant="outline">Included</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge variant="outline" className="capitalize">
                                    {seat.isWindow ? 'Window' : seat.isAisle ? 'Aisle' : 'Middle'}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {seat.type.replace('-', ' ')}
                                  </Badge>
                                </div>
                                {seat.legroom && (
                                  <p className="text-xs text-muted-foreground">
                                    Legroom: {seat.legroom}
                                  </p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      );
                    })}
                    <span className="w-6 text-xs text-muted-foreground ml-1 font-mono">
                      {row[0].row}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rear of aircraft */}
          <div className="flex justify-center mt-4 text-xs text-muted-foreground">
            <span>Rear of aircraft</span>
          </div>
        </div>

        {/* Seat Info Panel */}
        <AnimatePresence mode="wait">
          {(hoveredSeat || selectedSeat) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-bold">
                    Seat {(hoveredSeat || selectedSeat)?.id}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {(hoveredSeat || selectedSeat)?.isWindow ? 'Window' : 
                       (hoveredSeat || selectedSeat)?.isAisle ? 'Aisle' : 'Middle'}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {(hoveredSeat || selectedSeat)?.type.replace('-', ' ')}
                    </Badge>
                    {(hoveredSeat || selectedSeat)?.legroom && (
                      <Badge variant="outline" className="text-xs">
                        {(hoveredSeat || selectedSeat)?.legroom}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {(hoveredSeat || selectedSeat)?.price ? (
                    <p className="text-xl font-bold text-primary">
                      +${(hoveredSeat || selectedSeat)?.price}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Included</p>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {amenities.map(amenity => (
                    <div
                      key={amenity.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs"
                    >
                      <amenity.icon className="w-3.5 h-3.5 text-primary" />
                      <span>{amenity.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary & Action buttons */}
        <div className="space-y-3">
          {totalSeatPrice > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
              <span className="text-sm">Total seat upgrade cost</span>
              <span className="text-lg font-bold text-primary">+${totalSeatPrice}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setPassengerSeats({});
                onSeatSelect(null);
              }}
            >
              {Object.keys(passengerSeats).length > 0 ? 'Clear Selection' : 'Skip Selection'}
            </Button>
            {allSeatsSelected && (
              <Button className="flex-1 bg-primary">
                Confirm {Object.keys(passengerSeats).length} Seat{Object.keys(passengerSeats).length > 1 ? 's' : ''}
                {totalSeatPrice > 0 && ` (+$${totalSeatPrice})`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
