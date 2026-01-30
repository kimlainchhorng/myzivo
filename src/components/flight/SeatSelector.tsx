import { useState } from 'react';
import { cn } from '@/lib/utils';
import { User, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
}

interface SeatSelectorProps {
  fareClass: 'economy' | 'premium-economy' | 'business' | 'first';
  onSeatSelect: (seat: Seat | null) => void;
  selectedSeat?: Seat | null;
  basePrice?: number;
}

const generateSeats = (fareClass: string): Seat[][] => {
  const rows: Seat[][] = [];
  const columns = fareClass === 'first' ? ['A', 'C', 'D', 'F'] : 
                  fareClass === 'business' ? ['A', 'C', 'D', 'F', 'G', 'K'] :
                  ['A', 'B', 'C', 'D', 'E', 'F'];
  
  const rowCount = fareClass === 'first' ? 4 : 
                   fareClass === 'business' ? 8 : 30;
  
  for (let row = 1; row <= rowCount; row++) {
    const seatRow: Seat[] = [];
    columns.forEach((col, colIndex) => {
      const isWindow = col === 'A' || col === columns[columns.length - 1];
      const isAisle = fareClass === 'economy' ? (col === 'C' || col === 'D') : 
                      (col === 'C' || col === 'D' || col === 'G');
      const isMiddle = !isWindow && !isAisle;
      
      const isExitRow = row === 12 || row === 25;
      const isExtraLegroom = row <= 3;
      
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
        price = 45;
      } else if (isExtraLegroom) {
        type = 'extra-legroom';
        price = 35;
      } else if (isWindow) {
        price = 15;
      } else if (isAisle) {
        price = 12;
      }
      
      seatRow.push({
        id: `${row}${col}`,
        row,
        column: col,
        type,
        price,
        isAvailable: Math.random() > 0.3,
        isWindow,
        isAisle,
        isMiddle
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
  basePrice = 0 
}: SeatSelectorProps) {
  const [seats] = useState(() => generateSeats(fareClass));
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  
  const getSeatColor = (seat: Seat) => {
    if (!seat.isAvailable) return 'bg-muted/50 cursor-not-allowed';
    if (selectedSeat?.id === seat.id) return 'bg-primary text-primary-foreground ring-2 ring-primary';
    
    switch (seat.type) {
      case 'first':
        return 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/40';
      case 'premium':
        return 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/40';
      case 'exit-row':
        return 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/40';
      case 'extra-legroom':
        return 'bg-sky-500/20 border-sky-500/50 hover:bg-sky-500/40';
      default:
        return 'bg-card/50 border-border/50 hover:bg-card';
    }
  };
  
  const columns = fareClass === 'first' ? ['A', '', 'C', 'D', '', 'F'] : 
                  fareClass === 'business' ? ['A', '', 'C', 'D', '', 'G', '', 'K'] :
                  ['A', 'B', 'C', '', 'D', 'E', 'F'];

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-card/50 border border-border/50" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-sky-500/20 border border-sky-500/50" />
          <span className="text-muted-foreground">Extra Legroom (+$35)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/50" />
          <span className="text-muted-foreground">Exit Row (+$45)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted/50" />
          <span className="text-muted-foreground">Unavailable</span>
        </div>
      </div>

      {/* Airplane cabin visualization */}
      <div className="relative bg-gradient-to-b from-muted/20 to-transparent rounded-t-[100px] pt-12 pb-6 px-4 overflow-hidden">
        {/* Cockpit indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
            ✈️
          </div>
          <span>Front of aircraft</span>
        </div>

        {/* Column headers */}
        <div className="flex justify-center gap-1 mb-4 mt-6">
          {columns.map((col, i) => (
            <div 
              key={i} 
              className={cn(
                "w-8 h-6 flex items-center justify-center text-xs font-medium text-muted-foreground",
                col === '' && "w-4"
              )}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Seat grid */}
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
          {seats.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1 items-center">
              <span className="w-6 text-xs text-muted-foreground text-right mr-2">
                {row[0].row}
              </span>
              {row.map((seat, seatIndex) => {
                // Add aisle gap
                const needsGap = fareClass === 'economy' ? seatIndex === 3 : 
                                 fareClass === 'business' ? (seatIndex === 2 || seatIndex === 4) :
                                 seatIndex === 2;
                return (
                  <>
                    {needsGap && <div className="w-4" />}
                    <button
                      key={seat.id}
                      disabled={!seat.isAvailable}
                      onClick={() => onSeatSelect(selectedSeat?.id === seat.id ? null : seat)}
                      onMouseEnter={() => setHoveredSeat(seat)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      className={cn(
                        "w-8 h-8 rounded-t-lg border text-xs font-medium transition-all",
                        "flex items-center justify-center",
                        getSeatColor(seat)
                      )}
                    >
                      {seat.type === 'first' && <Crown className="w-3 h-3" />}
                      {seat.type === 'premium' && <Sparkles className="w-3 h-3" />}
                      {selectedSeat?.id === seat.id && <User className="w-3 h-3" />}
                    </button>
                  </>
                );
              })}
              <span className="w-6 text-xs text-muted-foreground ml-2">
                {row[0].row}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected seat info */}
      {(hoveredSeat || selectedSeat) && (
        <div className="p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
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
              </div>
            </div>
            <div className="text-right">
              {(hoveredSeat || selectedSeat)?.price ? (
                <p className="text-lg font-bold text-primary">
                  +${(hoveredSeat || selectedSeat)?.price}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Included</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onSeatSelect(null)}
        >
          Skip Seat Selection
        </Button>
        {selectedSeat && (
          <Button className="flex-1 bg-primary">
            Confirm Seat {selectedSeat.id}
            {selectedSeat.price > 0 && ` (+$${selectedSeat.price})`}
          </Button>
        )}
      </div>
    </div>
  );
}
