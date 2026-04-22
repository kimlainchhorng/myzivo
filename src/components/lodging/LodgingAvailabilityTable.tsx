/**
 * LodgingAvailabilityTable — Booking.com-style desktop availability grid.
 * Shows room type, guests, today's price, options, and a Reserve CTA per room.
 * Hidden on mobile (use LodgingRoomCard there).
 */
import { useMemo } from "react";
import { Users, Check, BedDouble, Wifi, Snowflake, Coffee, Bath, Trees, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LodgeRoom } from "@/hooks/lodging/useLodgeRooms";

interface Props {
  rooms: LodgeRoom[];
  onReserve: (room: LodgeRoom) => void;
}

const AMENITY_ICON: Record<string, typeof Wifi> = {
  wifi: Wifi,
  ac: Snowflake,
  "air conditioning": Snowflake,
  breakfast: Coffee,
  bathroom: Bath,
  "private bathroom": Bath,
  garden: Trees,
  "garden view": Trees,
  tv: Tv,
};

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export function LodgingAvailabilityTable({ rooms, onReserve }: Props) {
  const sorted = useMemo(
    () => [...rooms].sort((a, b) => a.base_rate_cents - b.base_rate_cents),
    [rooms]
  );

  if (!rooms.length) return null;

  return (
    <div className="hidden lg:block rounded-2xl border border-border/60 overflow-hidden bg-card/50 backdrop-blur-sm">
      {/* Table head */}
      <div className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] bg-primary/90 text-primary-foreground text-xs font-bold">
        <div className="px-4 py-3">Room type</div>
        <div className="px-4 py-3">Number of guests</div>
        <div className="px-4 py-3">Today's Price</div>
        <div className="px-4 py-3">Your options</div>
        <div className="px-4 py-3 pr-6">Reserve</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/60">
        {sorted.map((room) => {
          const amenities = (room.amenities || []).slice(0, 6);
          return (
            <div
              key={room.id}
              className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] items-start hover:bg-muted/20 transition-colors"
            >
              {/* Room type */}
              <div className="px-4 py-4 space-y-2">
                <h3 className="text-sm font-bold text-primary hover:underline cursor-pointer">
                  {room.name}
                </h3>
                {room.beds && (
                  <p className="text-xs text-foreground flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                    {room.beds}
                  </p>
                )}
                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {amenities.map((a) => {
                      const Icon = AMENITY_ICON[a.toLowerCase()] ?? Check;
                      return (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border/60 bg-background/40 text-[10px] text-foreground"
                        >
                          <Icon className="h-2.5 w-2.5" />
                          {a}
                        </span>
                      );
                    })}
                  </div>
                )}
                {room.size_sqm && (
                  <p className="text-[10px] text-muted-foreground">{room.size_sqm} m²</p>
                )}
              </div>

              {/* Guests */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(room.max_guests, 6) }).map((_, i) => (
                    <Users key={i} className="h-3.5 w-3.5 text-foreground" />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Max {room.max_guests} {room.max_guests === 1 ? "guest" : "guests"}
                </p>
              </div>

              {/* Price */}
              <div className="px-4 py-4">
                <p className="text-base font-bold text-foreground">
                  {formatPrice(room.base_rate_cents)}
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">
                    per night
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Includes taxes & fees</p>
              </div>

              {/* Options */}
              <div className="px-4 py-4 space-y-1.5 text-xs">
                {room.breakfast_included && (
                  <p className="flex items-center gap-1.5 text-foreground">
                    <Coffee className="h-3 w-3 text-amber-500" />
                    <span className="font-medium">Breakfast included</span>
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3 w-3" />
                  <span className="font-medium">Free cancellation</span>
                </p>
                <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3 w-3" />
                  <span className="font-medium">No prepayment needed</span>
                </p>
                {room.cancellation_policy && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2 pt-0.5">
                    {room.cancellation_policy}
                  </p>
                )}
              </div>

              {/* Reserve */}
              <div className="px-4 py-4 pr-6 flex items-start">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-md px-5"
                  onClick={() => onReserve(room)}
                >
                  Reserve
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LodgingAvailabilityTable;
