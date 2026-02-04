/**
 * ResumeBookingBanner - Continue incomplete bookings across devices
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  X, 
  Plane, 
  Building2, 
  Car, 
  ArrowRight,
  Clock 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SavedBooking {
  id: string;
  type: "flight" | "hotel" | "car";
  origin?: string;
  destination?: string;
  hotelName?: string;
  carLocation?: string;
  date: string;
  savedAt: Date;
  checkoutUrl: string;
  price?: number;
}

interface ResumeBookingBannerProps {
  savedBookings?: SavedBooking[];
  className?: string;
}

// Mock saved bookings for demo
const getMockSavedBookings = (): SavedBooking[] => {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  return [
    {
      id: "1",
      type: "flight",
      origin: "JFK",
      destination: "LAX",
      date: "Jan 15, 2025",
      savedAt: twoHoursAgo,
      checkoutUrl: "/flights/checkout?saved=1",
      price: 349,
    },
  ];
};

export function ResumeBookingBanner({
  savedBookings: providedBookings,
  className,
}: ResumeBookingBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [savedBookings, setSavedBookings] = useState<SavedBooking[]>([]);

  useEffect(() => {
    // Check localStorage or use provided bookings
    const bookings = providedBookings || getMockSavedBookings();
    // Filter to only show recent (last 24 hours) incomplete bookings
    const recentBookings = bookings.filter(b => {
      const hoursSinceSaved = (Date.now() - b.savedAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceSaved < 24;
    });
    setSavedBookings(recentBookings);
  }, [providedBookings]);

  if (isDismissed || savedBookings.length === 0) return null;

  const latestBooking = savedBookings[0];
  
  const typeIcons = {
    flight: Plane,
    hotel: Building2,
    car: Car,
  };
  
  const Icon = typeIcons[latestBooking.type];

  const formatTimeAgo = (date: Date): string => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "just now";
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    return "yesterday";
  };

  const getBookingDescription = (booking: SavedBooking): string => {
    switch (booking.type) {
      case "flight":
        return `${booking.origin} → ${booking.destination} on ${booking.date}`;
      case "hotel":
        return `${booking.hotelName} - ${booking.date}`;
      case "car":
        return `Car rental in ${booking.carLocation} - ${booking.date}`;
      default:
        return booking.date;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-sky-500/10 border border-sky-500/20 rounded-xl overflow-hidden",
          className
        )}
      >
        <div className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-sky-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium flex items-center gap-2">
                  Continue where you left off
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTimeAgo(latestBooking.savedAt)}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  <Icon className="w-3 h-3 inline mr-1" />
                  {getBookingDescription(latestBooking)}
                  {latestBooking.price && (
                    <span className="text-sky-400 font-medium ml-1">
                      ${latestBooking.price}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link to={latestBooking.checkoutUrl}>
                <Button size="sm" className="bg-sky-500 hover:bg-sky-600 gap-1.5">
                  Resume Booking
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Multiple saved bookings indicator */}
          {savedBookings.length > 1 && (
            <p className="text-xs text-muted-foreground mt-2 pl-13">
              +{savedBookings.length - 1} more saved {savedBookings.length === 2 ? "booking" : "bookings"}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ResumeBookingBanner;
