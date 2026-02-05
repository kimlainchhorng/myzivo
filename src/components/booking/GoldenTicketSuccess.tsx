/**
 * GoldenTicketSuccess - Premium "boarding pass" style confirmation
 * Features: gold foil gradient, 3D flip animation, metallic shine, QR code
 */

import { motion } from "framer-motion";
import { CheckCircle2, Plane, Download, Wallet, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TicketQRCode from "./TicketQRCode";
import ConfettiEffect from "./ConfettiEffect";

interface GoldenTicketSuccessProps {
  bookingRef: string;
  origin: string;
  originCity?: string;
  destination: string;
  destinationCity?: string;
  flightNumber?: string;
  departureDate?: string;
  departureTime?: string;
  airline?: string;
  passengerName?: string;
  className?: string;
  showConfetti?: boolean;
  onDownload?: () => void;
  onAddToWallet?: () => void;
}

const flipVariants = {
  hidden: { 
    rotateY: -90,
    opacity: 0,
    scale: 0.8
  },
  visible: { 
    rotateY: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 100,
      delay: 0.2
    }
  }
};

export default function GoldenTicketSuccess({
  bookingRef,
  origin,
  originCity,
  destination,
  destinationCity,
  flightNumber,
  departureDate,
  departureTime,
  airline,
  passengerName,
  className,
  showConfetti = true,
  onDownload,
  onAddToWallet,
}: GoldenTicketSuccessProps) {
  const qrValue = `https://hizovo.com/booking/${bookingRef}`;

  return (
    <>
      {showConfetti && <ConfettiEffect show={true} pieceCount={60} />}
      
      <div className={cn("w-full max-w-md mx-auto perspective-1000", className)}>
        <motion.div
          variants={flipVariants}
          initial="hidden"
          animate="visible"
          className="relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Main Ticket Card */}
          <div className="relative rounded-3xl overflow-hidden golden-border metallic-shine">
            {/* Gold gradient header */}
            <div className="golden-gradient p-6 pb-8 text-center">
              {/* Success badge */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-white drop-shadow-lg" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white drop-shadow-md mb-1">
                Boarding Pass Issued
              </h2>
              <p className="text-white/80 text-sm font-medium">
                Your flight is confirmed!
              </p>
            </div>

            {/* Ticket body */}
            <div className="bg-card dark:bg-zinc-900 p-6 pt-10 relative">
              {/* Perforated cutout circles */}
              <div className="absolute -top-4 left-8 w-8 h-8 bg-background dark:bg-background rounded-full" />
              <div className="absolute -top-4 right-8 w-8 h-8 bg-background dark:bg-background rounded-full" />
              
              {/* Dashed line */}
              <div className="absolute top-0 left-12 right-12 border-t-2 border-dashed border-muted-foreground/30" />

              {/* Route display */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-foreground tracking-tight">{origin}</p>
                  {originCity && (
                    <p className="text-xs text-muted-foreground mt-1">{originCity}</p>
                  )}
                </div>

                <div className="flex-1 px-4 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="w-16 sm:w-24 border-t-2 border-dashed border-amber-500/50" />
                    <Plane className="w-5 h-5 text-amber-500 rotate-90" />
                    <div className="w-16 sm:w-24 border-t-2 border-dashed border-amber-500/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-3xl font-black text-foreground tracking-tight">{destination}</p>
                  {destinationCity && (
                    <p className="text-xs text-muted-foreground mt-1">{destinationCity}</p>
                  )}
                </div>
              </div>

              {/* QR Code section */}
              <div className="flex justify-center mb-6">
                <TicketQRCode value={qrValue} size={140} />
              </div>
              <p className="text-center text-xs text-muted-foreground mb-6">
                Scan at airport for boarding
              </p>

              {/* Flight details grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Date</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{departureDate || "TBD"}</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Time</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{departureTime || "TBD"}</p>
                </div>

                {flightNumber && (
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Plane className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase tracking-wider font-semibold">Flight</span>
                    </div>
                    <p className="text-sm font-bold text-foreground">{flightNumber}</p>
                  </div>
                )}

                {airline && (
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase tracking-wider font-semibold">Airline</span>
                    </div>
                    <p className="text-sm font-bold text-foreground">{airline}</p>
                  </div>
                )}
              </div>

              {/* Booking reference */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold mb-1">
                  Confirmation Code
                </p>
                <p className="text-xl font-mono font-black tracking-wider text-foreground">
                  {bookingRef}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 gap-2 rounded-xl"
                  onClick={onDownload}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  className="flex-1 h-12 gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={onAddToWallet}
                >
                  <Wallet className="w-4 h-4" />
                  Add to Wallet
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}