import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plane, QrCode, Download, Share2, Wallet, 
  User, Clock, MapPin, Armchair, Luggage,
  Crown, Star, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

interface BoardingPassProps {
  confirmationNumber: string;
  passenger: {
    firstName: string;
    lastName: string;
    frequentFlyerNumber?: string;
    frequentFlyerTier?: 'gold' | 'silver' | 'bronze';
  };
  flight: {
    airline: string;
    airlineLogo?: string;
    flightNumber: string;
    departure: {
      code: string;
      city: string;
      time: string;
      date: Date;
      terminal?: string;
      gate?: string;
    };
    arrival: {
      code: string;
      city: string;
      time: string;
    };
    duration: string;
    aircraft?: string;
  };
  seat: {
    number: string;
    class: 'economy' | 'premium-economy' | 'business' | 'first';
  };
  baggage?: string;
  boardingTime?: string;
  boardingGroup?: string;
  onDownload?: () => void;
  onShare?: () => void;
  onAddToWallet?: () => void;
}

const classConfig = {
  economy: { label: 'Economy', color: 'bg-sky-500', icon: Plane },
  'premium-economy': { label: 'Premium Economy', color: 'bg-violet-500', icon: Star },
  business: { label: 'Business', color: 'bg-amber-500', icon: Crown },
  first: { label: 'First Class', color: 'bg-gradient-to-r from-amber-500 to-yellow-400', icon: Crown },
};

export default function BoardingPass({
  confirmationNumber,
  passenger,
  flight,
  seat,
  baggage,
  boardingTime,
  boardingGroup,
  onDownload,
  onShare,
  onAddToWallet,
}: BoardingPassProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const ClassIcon = classConfig[seat.class].icon;

  // Generate QR code data (in real app, this would be actual barcode data)
  const qrData = `ZIVO:${confirmationNumber}:${flight.flightNumber}:${passenger.lastName}/${passenger.firstName}:${seat.number}`;

  return (
    <div className="perspective-1000">
      <div 
        className={cn(
          "relative transition-transform duration-700 transform-style-3d cursor-pointer",
          isFlipped && "rotate-y-180"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of Boarding Pass */}
        <Card className={cn(
          "overflow-hidden border-0 shadow-2xl backface-hidden",
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        )}>
          {/* Airline Header */}
          <div className={cn("h-2", classConfig[seat.class].color)} />
          
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {flight.airlineLogo && (
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                      <img src={flight.airlineLogo} alt={flight.airline} className="w-10 h-10 object-contain" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold">{flight.airline}</p>
                    <p className="text-slate-400 text-sm">{flight.flightNumber}</p>
                  </div>
                </div>
                <Badge className={cn("border-0 text-white", classConfig[seat.class].color)}>
                  <ClassIcon className="w-3 h-3 mr-1" />
                  {classConfig[seat.class].label}
                </Badge>
              </div>
            </div>

            {/* Route Display */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{flight.departure.code}</p>
                  <p className="text-slate-400 text-sm">{flight.departure.city}</p>
                </div>
                
                <div className="flex-1 mx-6 relative">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-600" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 p-2 rounded-full">
                    <Plane className="w-5 h-5 text-sky-400 rotate-90" />
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{flight.arrival.code}</p>
                  <p className="text-slate-400 text-sm">{flight.arrival.city}</p>
                </div>
              </div>
            </div>

            {/* Perforated Edge */}
            <div className="relative">
              <div className="absolute -left-4 w-8 h-8 rounded-full bg-background" />
              <div className="absolute -right-4 w-8 h-8 rounded-full bg-background" />
              <div className="border-t-2 border-dashed border-slate-700 mx-8" />
            </div>

            {/* Passenger & Flight Info */}
            <div className="p-6 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider">Passenger</p>
                  <p className="text-white font-semibold text-lg">
                    {passenger.lastName}, {passenger.firstName}
                  </p>
                  {passenger.frequentFlyerTier && (
                    <Badge variant="outline" className="mt-1 border-amber-500/50 text-amber-400 text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      {passenger.frequentFlyerTier.toUpperCase()} Member
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Date</p>
                    <p className="text-white font-medium">
                      {format(flight.departure.date, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Departs</p>
                    <p className="text-white font-medium">{flight.departure.time}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Terminal</p>
                    <p className="text-white font-bold text-2xl">{flight.departure.terminal || 'T2'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Gate</p>
                    <p className="text-white font-bold text-2xl">{flight.departure.gate || 'B42'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Seat</p>
                    <p className="text-white font-bold text-2xl">{seat.number}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Group</p>
                    <p className="text-white font-bold text-2xl">{boardingGroup || '2'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="p-6 pt-0">
              <div className="flex items-center gap-6 p-4 rounded-xl bg-white/5 border border-white/10">
                {/* QR Code Placeholder */}
                <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-20 h-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMSAyMSI+PHBhdGggZD0iTTEgMWg3djdIMVYxem0xIDFoNXY1SDJWMnptMSAxaDN2M0gzVjN6bTEwLThINnY3aDdWMXptMSAxaDV2NWgtNVYyem0xIDFoM3YzaC0zVjN6TTEgMTNoN3Y3SDF2LTd6bTEgMWg1djVIMnYtNXptMSAxaDN2M0gzdi0zem03LTJoMXYxaC0xdi0xem0yIDBoMXYxaC0xdi0xem0yIDBoMXYxaC0xdi0xem0yIDBoMXYxaC0xdi0xem0tNiAyaDF2MWgtMXYtMXptMiAwaDR2MWgtNHYtMXptLTIgMmgxdjFoLTF2LTF6bTIgMGgxdjFoLTF2LTF6bTIgMGgxdjFoLTF2LTF6bTIgMGgxdjFoLTF2LTF6bS02IDJoNHYxaC00di0xem02IDBoMXYxaC0xdi0xeiIvPjwvc3ZnPg==')] bg-contain" />
                </div>
                
                <div className="flex-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Confirmation</p>
                  <p className="text-white font-mono text-xl font-bold tracking-wider">{confirmationNumber}</p>
                  <p className="text-slate-500 text-xs mt-2">Tap to flip for more details</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-0 flex gap-3">
              <Button 
                className="flex-1 bg-sky-500 hover:bg-sky-600"
                onClick={(e) => { e.stopPropagation(); onAddToWallet?.(); }}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Add to Wallet
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-700 text-white hover:bg-slate-800"
                onClick={(e) => { e.stopPropagation(); onDownload?.(); }}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-700 text-white hover:bg-slate-800"
                onClick={(e) => { e.stopPropagation(); onShare?.(); }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back of Boarding Pass */}
        <Card className={cn(
          "absolute inset-0 overflow-hidden border-0 shadow-2xl backface-hidden rotate-y-180",
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        )}>
          <div className={cn("h-2", classConfig[seat.class].color)} />
          
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Additional Flight Information</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-sky-400" />
                  <span className="text-slate-400">Boarding Time</span>
                </div>
                <span className="text-white font-semibold">{boardingTime || '10:30 AM'}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-sky-400" />
                  <span className="text-slate-400">Aircraft</span>
                </div>
                <span className="text-white font-semibold">{flight.aircraft || 'Boeing 787-9'}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-sky-400" />
                  <span className="text-slate-400">Flight Duration</span>
                </div>
                <span className="text-white font-semibold">{flight.duration}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <Luggage className="w-5 h-5 text-sky-400" />
                  <span className="text-slate-400">Baggage</span>
                </div>
                <span className="text-white font-semibold">{baggage || '1 × 23kg checked'}</span>
              </div>

              {passenger.frequentFlyerNumber && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-400" />
                    <span className="text-slate-400">Frequent Flyer</span>
                  </div>
                  <span className="text-white font-semibold">{passenger.frequentFlyerNumber}</span>
                </div>
              )}
            </div>

            <div className="text-center pt-4">
              <p className="text-slate-500 text-xs">Tap to flip back</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
