import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plane, Download, Share2, Wallet, 
  User, Clock, MapPin, Luggage,
  Crown, Star, Wifi, Utensils, Monitor,
  CloudSun, ThermometerSun, Wind, Droplets,
  CheckCircle2, AlertCircle, RotateCcw, Sparkles,
  Navigation
} from 'lucide-react';
import { format, addHours, differenceInMinutes } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface BoardingPassProps {
  confirmationNumber: string;
  passenger: {
    firstName: string;
    lastName: string;
    frequentFlyerNumber?: string;
    frequentFlyerTier?: 'gold' | 'silver' | 'bronze' | 'platinum';
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
    status?: 'on-time' | 'delayed' | 'boarding' | 'departed';
  };
  seat: {
    number: string;
    class: 'economy' | 'premium-economy' | 'business' | 'first';
  };
  baggage?: string;
  boardingTime?: string;
  boardingGroup?: string;
  mealPreference?: string;
  specialServices?: string[];
  onDownload?: () => void;
  onShare?: () => void;
  onAddToWallet?: () => void;
}

interface WeatherInfo {
  temp: string;
  condition: string;
  humidity: string;
  wind: string;
  icon: typeof CloudSun;
}

const classConfig = {
  economy: { 
    label: 'Economy', 
    color: 'bg-sky-500', 
    gradient: 'from-sky-500 to-blue-600',
    icon: Plane,
    amenities: ['Entertainment', 'Meal Service']
  },
  'premium-economy': { 
    label: 'Premium Economy', 
    color: 'bg-violet-500',
    gradient: 'from-violet-500 to-purple-600',
    icon: Star,
    amenities: ['Priority Boarding', 'Extra Legroom', 'Premium Meals']
  },
  business: { 
    label: 'Business', 
    color: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-600',
    icon: Crown,
    amenities: ['Lounge Access', 'Lie-flat Seats', 'Fine Dining', 'Fast WiFi']
  },
  first: { 
    label: 'First Class', 
    color: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400',
    gradient: 'from-amber-400 via-yellow-500 to-amber-500',
    icon: Crown,
    amenities: ['Private Suite', 'Chauffeur Service', 'Michelin Dining', 'Shower Spa']
  },
};

const tierConfig = {
  bronze: { color: 'border-orange-700 text-orange-600 bg-orange-500/10', label: 'Bronze' },
  silver: { color: 'border-slate-400 text-slate-300 bg-slate-500/10', label: 'Silver' },
  gold: { color: 'border-amber-500 text-amber-400 bg-amber-500/10', label: 'Gold' },
  platinum: { color: 'border-violet-400 text-violet-300 bg-violet-500/10', label: 'Platinum' },
};

const statusConfig = {
  'on-time': { color: 'bg-emerald-500', text: 'On Time', icon: CheckCircle2 },
  'delayed': { color: 'bg-amber-500', text: 'Delayed', icon: AlertCircle },
  'boarding': { color: 'bg-violet-500 animate-pulse', text: 'Boarding', icon: Plane },
  'departed': { color: 'bg-sky-500', text: 'Departed', icon: Navigation },
};

const mockWeather: WeatherInfo = {
  temp: '24°C',
  condition: 'Partly Cloudy',
  humidity: '65%',
  wind: '12 km/h',
  icon: CloudSun,
};

export default function BoardingPass({
  confirmationNumber,
  passenger,
  flight,
  seat,
  baggage,
  boardingTime,
  boardingGroup,
  mealPreference,
  specialServices,
  onDownload,
  onShare,
  onAddToWallet,
}: BoardingPassProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [countdown, setCountdown] = useState('');
  const ClassIcon = classConfig[seat.class].icon;
  const flightStatus = flight.status || 'on-time';
  const StatusIcon = statusConfig[flightStatus].icon;

  // Countdown timer to boarding
  useEffect(() => {
    const boardingDate = new Date(flight.departure.date);
    const [hours, minutes] = (boardingTime || '10:30').split(':').map(Number);
    boardingDate.setHours(hours, minutes, 0, 0);

    const updateCountdown = () => {
      const now = new Date();
      const diff = differenceInMinutes(boardingDate, now);
      
      if (diff <= 0) {
        setCountdown('Boarding now');
      } else if (diff < 60) {
        setCountdown(`${diff} min to boarding`);
      } else {
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        setCountdown(`${hrs}h ${mins}m to boarding`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [flight.departure.date, boardingTime]);

  const qrData = JSON.stringify({
    pnr: confirmationNumber,
    flight: flight.flightNumber,
    passenger: `${passenger.lastName}/${passenger.firstName}`,
    seat: seat.number,
    date: format(flight.departure.date, 'yyyy-MM-dd'),
  });

  const handleDownload = () => {
    onDownload?.();
    toast.success('Boarding pass downloaded!');
  };

  const handleShare = () => {
    onShare?.();
    toast.success('Share link copied!');
  };

  const handleWallet = () => {
    onAddToWallet?.();
    toast.success('Added to Apple Wallet!');
  };

  return (
    <div className="perspective-1000 w-full max-w-md mx-auto">
      <motion.div 
        className="relative w-full preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Boarding Pass */}
        <Card 
          className={cn(
            "w-full overflow-hidden border-0 shadow-2xl backface-hidden",
            "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Animated Class Header */}
          <div className={cn("h-2 bg-gradient-to-r", classConfig[seat.class].gradient)} />
          
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          
          <CardContent className="p-0 relative">
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
              <Badge className={cn("gap-1 border-0 text-white", statusConfig[flightStatus].color)}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig[flightStatus].text}
              </Badge>
            </div>

            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3">
                {flight.airlineLogo && (
                  <motion.div 
                    className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <img src={flight.airlineLogo} alt={flight.airline} className="w-12 h-12 object-contain" />
                  </motion.div>
                )}
                <div>
                  <p className="text-white font-semibold text-lg">{flight.airline}</p>
                  <p className="text-slate-400 text-sm font-mono">{flight.flightNumber}</p>
                </div>
              </div>
            </div>

            {/* Route Display */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <motion.p 
                    className="text-5xl font-bold text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {flight.departure.code}
                  </motion.p>
                  <p className="text-slate-400 text-sm mt-1">{flight.departure.city}</p>
                  <p className="text-white font-medium text-lg mt-2">{flight.departure.time}</p>
                </div>
                
                <div className="flex-1 mx-6 relative">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-600" />
                  <motion.div 
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 p-3 rounded-full border-2 border-primary/50"
                    animate={{ 
                      x: [0, 20, 0],
                      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Plane className="w-5 h-5 text-primary rotate-90" />
                  </motion.div>
                  <p className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap">
                    {flight.duration}
                  </p>
                </div>
                
                <div className="text-center">
                  <motion.p 
                    className="text-5xl font-bold text-white"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {flight.arrival.code}
                  </motion.p>
                  <p className="text-slate-400 text-sm mt-1">{flight.arrival.city}</p>
                  <p className="text-white font-medium text-lg mt-2">{flight.arrival.time}</p>
                </div>
              </div>
            </div>

            {/* Perforated Edge with circles */}
            <div className="relative py-4">
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background" />
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background" />
              <div className="border-t-2 border-dashed border-slate-700 mx-8" />
              {/* Decorative dots */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 flex justify-between px-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-slate-700" />
                ))}
              </div>
            </div>

            {/* Passenger & Flight Info */}
            <div className="p-6 pt-2 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider">Passenger</p>
                  <p className="text-white font-semibold text-lg">
                    {passenger.lastName.toUpperCase()}, {passenger.firstName}
                  </p>
                  {passenger.frequentFlyerTier && (
                    <Badge className={cn("mt-1 text-xs", tierConfig[passenger.frequentFlyerTier].color)}>
                      <Crown className="w-3 h-3 mr-1" />
                      {tierConfig[passenger.frequentFlyerTier].label} Member
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">Date</p>
                    <p className="text-white font-medium">
                      {format(flight.departure.date, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">Class</p>
                    <Badge className={cn("mt-0.5 border-0 text-white", classConfig[seat.class].color)}>
                      <ClassIcon className="w-3 h-3 mr-1" />
                      {classConfig[seat.class].label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">Terminal</p>
                    <p className="text-white font-bold text-3xl">{flight.departure.terminal || 'T2'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">Gate</p>
                    <p className="text-white font-bold text-3xl">{flight.departure.gate || 'B42'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">Seat</p>
                    <p className="text-white font-bold text-3xl">{seat.number}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">Group</p>
                    <p className="text-white font-bold text-3xl">{boardingGroup || '2'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boarding Countdown */}
            <div className="mx-6 mb-4 p-3 rounded-xl bg-primary/10 border border-primary/30 text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">{countdown}</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="p-6 pt-0">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 bg-white rounded-lg">
                  <QRCodeSVG 
                    value={qrData} 
                    size={88}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                
                <div className="flex-1">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Confirmation</p>
                  <p className="text-white font-mono text-xl font-bold tracking-wider">{confirmationNumber}</p>
                  <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    Tap to flip for more details
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-0 flex gap-3">
              <Button 
                className={cn("flex-1 gap-2 text-white", classConfig[seat.class].color)}
                onClick={(e) => { e.stopPropagation(); handleWallet(); }}
              >
                <Wallet className="w-4 h-4" />
                Add to Wallet
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-700 text-white hover:bg-slate-800"
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-700 text-white hover:bg-slate-800"
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back of Boarding Pass */}
        <Card 
          className={cn(
            "absolute inset-0 w-full overflow-hidden border-0 shadow-2xl",
            "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className={cn("h-2 bg-gradient-to-r", classConfig[seat.class].gradient)} />
          
          <CardContent className="p-6 space-y-4">
            <div className="text-center mb-2">
              <p className="text-slate-400 text-sm">Flight Details</p>
            </div>

            {/* Flight Info Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-slate-400">Boarding Time</span>
                </div>
                <span className="text-white font-semibold">{boardingTime || '10:30 AM'}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-primary" />
                  <span className="text-slate-400">Aircraft</span>
                </div>
                <span className="text-white font-semibold">{flight.aircraft || 'Boeing 787-9'}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Luggage className="w-5 h-5 text-primary" />
                  <span className="text-slate-400">Baggage</span>
                </div>
                <span className="text-white font-semibold">{baggage || '1 × 23kg checked'}</span>
              </div>

              {mealPreference && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Utensils className="w-5 h-5 text-primary" />
                    <span className="text-slate-400">Meal</span>
                  </div>
                  <span className="text-white font-semibold">{mealPreference}</span>
                </div>
              )}

              {passenger.frequentFlyerNumber && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-400" />
                    <span className="text-slate-400">Frequent Flyer</span>
                  </div>
                  <span className="text-white font-semibold font-mono">{passenger.frequentFlyerNumber}</span>
                </div>
              )}
            </div>

            {/* Destination Weather */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/30">
              <div className="flex items-center gap-2 mb-3">
                <mockWeather.icon className="w-5 h-5 text-sky-400" />
                <span className="text-sky-400 font-medium">Weather at {flight.arrival.city}</span>
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <ThermometerSun className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                  <p className="text-white font-medium">{mockWeather.temp}</p>
                </div>
                <div>
                  <CloudSun className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                  <p className="text-white text-sm">{mockWeather.condition}</p>
                </div>
                <div>
                  <Droplets className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                  <p className="text-white font-medium">{mockWeather.humidity}</p>
                </div>
                <div>
                  <Wind className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                  <p className="text-white font-medium">{mockWeather.wind}</p>
                </div>
              </div>
            </div>

            {/* Class Amenities */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-slate-400 text-sm">{classConfig[seat.class].label} Amenities</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {classConfig[seat.class].amenities.map((amenity, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-300">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-slate-500 text-xs flex items-center justify-center gap-1">
                <RotateCcw className="w-3 h-3" />
                Tap to flip back
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
