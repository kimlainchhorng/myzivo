import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Plane, Clock, MapPin, AlertTriangle, CheckCircle2, 
  RefreshCw, Bell, BellOff, ChevronRight, Luggage,
  CloudRain, Wind, Thermometer, Navigation
} from 'lucide-react';
import { format } from 'date-fns';

interface FlightStatus {
  status: 'on-time' | 'delayed' | 'boarding' | 'departed' | 'in-flight' | 'landed' | 'cancelled';
  delayMinutes?: number;
  gate?: string;
  terminal?: string;
  baggageClaim?: string;
  updatedAt: Date;
}

interface FlightTrackerProps {
  flightNumber: string;
  airline: string;
  airlineLogo?: string;
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
    date: Date;
    terminal?: string;
    gate?: string;
  };
  aircraft?: string;
  duration: string;
  onNotificationToggle?: (enabled: boolean) => void;
}

const statusConfig = {
  'on-time': { label: 'On Time', color: 'bg-emerald-500', icon: CheckCircle2, textColor: 'text-emerald-400' },
  'delayed': { label: 'Delayed', color: 'bg-amber-500', icon: AlertTriangle, textColor: 'text-amber-400' },
  'boarding': { label: 'Boarding', color: 'bg-sky-500', icon: Plane, textColor: 'text-sky-400' },
  'departed': { label: 'Departed', color: 'bg-blue-500', icon: Plane, textColor: 'text-blue-400' },
  'in-flight': { label: 'In Flight', color: 'bg-violet-500', icon: Plane, textColor: 'text-violet-400' },
  'landed': { label: 'Landed', color: 'bg-emerald-500', icon: CheckCircle2, textColor: 'text-emerald-400' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-500', icon: AlertTriangle, textColor: 'text-red-400' },
};

// Simulated weather data
const weatherData = {
  departure: { temp: 72, condition: 'Sunny', wind: '8 mph' },
  arrival: { temp: 65, condition: 'Partly Cloudy', wind: '12 mph' },
};

export default function FlightTracker({
  flightNumber,
  airline,
  airlineLogo,
  departure,
  arrival,
  aircraft,
  duration,
  onNotificationToggle,
}: FlightTrackerProps) {
  const [status, setStatus] = useState<FlightStatus>({
    status: 'on-time',
    gate: departure.gate || 'B42',
    terminal: departure.terminal || '2',
    updatedAt: new Date(),
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [flightProgress, setFlightProgress] = useState(0);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random status changes
      const statuses: FlightStatus['status'][] = ['on-time', 'boarding', 'departed', 'in-flight'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      if (status.status === 'in-flight') {
        setFlightProgress(prev => Math.min(prev + 5, 100));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [status.status]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStatus(prev => ({ ...prev, updatedAt: new Date() }));
    setIsRefreshing(false);
  };

  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    onNotificationToggle?.(newState);
  };

  const StatusIcon = statusConfig[status.status].icon;

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-muted/20">
      {/* Status Bar */}
      <div className={cn("h-1.5", statusConfig[status.status].color)} />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {airlineLogo && (
              <div className="w-12 h-12 rounded-xl bg-white/90 dark:bg-muted/50 flex items-center justify-center border border-border/30">
                <img src={airlineLogo} alt={airline} className="w-10 h-10 object-contain" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{flightNumber}</CardTitle>
              <p className="text-sm text-muted-foreground">{airline}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={cn("gap-1", statusConfig[status.status].color, "text-white border-0")}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig[status.status].label}
              {status.status === 'delayed' && status.delayMinutes && (
                <span className="ml-1">+{status.delayMinutes}m</span>
              )}
            </Badge>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRefresh}
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={toggleNotifications}
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4 text-sky-400" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Flight Route Visualization */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {/* Departure */}
            <div className="text-center">
              <p className="text-3xl font-bold">{departure.time}</p>
              <p className="text-xl font-semibold text-muted-foreground">{departure.code}</p>
              <p className="text-sm text-muted-foreground">{departure.city}</p>
            </div>

            {/* Flight Path */}
            <div className="flex-1 mx-6 relative">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                <div className="h-0.5 bg-muted w-full" />
                {status.status === 'in-flight' && (
                  <div 
                    className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-1000"
                    style={{ width: `${flightProgress}%` }}
                  />
                )}
              </div>
              
              {/* Airplane Icon */}
              <div 
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000",
                  status.status === 'in-flight' ? 'text-sky-400' : 'text-muted-foreground'
                )}
                style={{ left: status.status === 'in-flight' ? `${flightProgress}%` : '50%' }}
              >
                <div className="relative">
                  <Plane className="w-6 h-6 rotate-90" />
                  {status.status === 'in-flight' && (
                    <div className="absolute -inset-2 rounded-full bg-sky-500/20 animate-ping" />
                  )}
                </div>
              </div>

              {/* Duration */}
              <div className="absolute -bottom-6 inset-x-0 text-center">
                <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {duration}
                </span>
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-3xl font-bold">{arrival.time}</p>
              <p className="text-xl font-semibold text-muted-foreground">{arrival.code}</p>
              <p className="text-sm text-muted-foreground">{arrival.city}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar for In-Flight */}
        {status.status === 'in-flight' && (
          <div className="pt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Departed</span>
              <span>{flightProgress}% Complete</span>
              <span>Arriving</span>
            </div>
            <Progress value={flightProgress} className="h-2" />
          </div>
        )}

        {/* Gate & Terminal Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Navigation className="w-4 h-4" />
              <span className="text-xs">Terminal</span>
            </div>
            <p className="text-lg font-bold">{status.terminal || departure.terminal || 'TBD'}</p>
          </div>
          
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Gate</span>
            </div>
            <p className="text-lg font-bold">{status.gate || 'TBD'}</p>
          </div>
          
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Plane className="w-4 h-4" />
              <span className="text-xs">Aircraft</span>
            </div>
            <p className="text-sm font-semibold truncate">{aircraft || 'Boeing 787'}</p>
          </div>
          
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Luggage className="w-4 h-4" />
              <span className="text-xs">Baggage</span>
            </div>
            <p className="text-lg font-bold">{status.baggageClaim || 'TBD'}</p>
          </div>
        </div>

        {/* Weather Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/20">
            <p className="text-xs text-muted-foreground mb-2">{departure.city} Weather</p>
            <div className="flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-sky-400" />
              <div>
                <p className="font-semibold">{weatherData.departure.temp}°F</p>
                <p className="text-xs text-muted-foreground">{weatherData.departure.condition}</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Wind className="w-3 h-3" />
                {weatherData.departure.wind}
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
            <p className="text-xs text-muted-foreground mb-2">{arrival.city} Weather</p>
            <div className="flex items-center gap-3">
              <CloudRain className="w-5 h-5 text-violet-400" />
              <div>
                <p className="font-semibold">{weatherData.arrival.temp}°F</p>
                <p className="text-xs text-muted-foreground">{weatherData.arrival.condition}</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Wind className="w-3 h-3" />
                {weatherData.arrival.wind}
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-center text-muted-foreground">
          Last updated: {format(status.updatedAt, 'h:mm a')}
        </p>
      </CardContent>
    </Card>
  );
}
