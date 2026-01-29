import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, Car, ShoppingBag, CreditCard, UserPlus, MapPin, 
  CheckCircle2, XCircle, AlertTriangle, Pause, Play, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ActivityEvent {
  id: string;
  type: "ride" | "order" | "payment" | "user" | "driver" | "alert";
  action: string;
  description: string;
  timestamp: Date;
  status: "success" | "warning" | "error" | "info";
  metadata?: Record<string, string>;
}

const eventIcons: Record<string, React.ElementType> = {
  ride: Car,
  order: ShoppingBag,
  payment: CreditCard,
  user: UserPlus,
  driver: MapPin,
  alert: AlertTriangle,
};

const statusColors: Record<string, string> = {
  success: "text-emerald-500 bg-emerald-500/10",
  warning: "text-amber-500 bg-amber-500/10",
  error: "text-rose-500 bg-rose-500/10",
  info: "text-cyan-500 bg-cyan-500/10",
};

export default function ActivityStream() {
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filters, setFilters] = useState<Record<string, boolean>>({
    ride: true,
    order: true,
    payment: true,
    user: true,
    driver: true,
    alert: true,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: eventsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-activity-stream'],
    queryFn: async () => {
      const events: ActivityEvent[] = [];

      // Fetch recent trips
      const { data: trips } = await supabase
        .from('trips')
        .select('id, status, created_at, pickup_address')
        .order('created_at', { ascending: false })
        .limit(15);

      trips?.forEach(trip => {
        let action = 'Trip activity';
        let status: ActivityEvent["status"] = 'info';
        
        if (trip.status === 'completed') {
          action = 'Ride completed';
          status = 'success';
        } else if (trip.status === 'cancelled') {
          action = 'Ride cancelled';
          status = 'warning';
        } else if (trip.status === 'in_progress') {
          action = 'Ride in progress';
          status = 'info';
        } else if (trip.status === 'requested') {
          action = 'New ride requested';
          status = 'info';
        }

        events.push({
          id: `trip-${trip.id}`,
          type: 'ride',
          action,
          description: `${action} - ${trip.pickup_address?.slice(0, 30) || 'Location'}...`,
          timestamp: new Date(trip.created_at),
          status
        });
      });

      // Fetch recent food orders
      const { data: orders } = await supabase
        .from('food_orders')
        .select('id, status, created_at, restaurants(name)')
        .order('created_at', { ascending: false })
        .limit(15);

      orders?.forEach(order => {
        let action = 'Order activity';
        let status: ActivityEvent["status"] = 'info';
        
        if (order.status === 'completed') {
          action = 'Order completed';
          status = 'success';
        } else if (order.status === 'cancelled') {
          action = 'Order cancelled';
          status = 'error';
        } else if (order.status === 'in_progress') {
          action = 'Order preparing';
          status = 'info';
        } else if (order.status === 'pending') {
          action = 'Order placed';
          status = 'info';
        }

        events.push({
          id: `order-${order.id}`,
          type: 'order',
          action,
          description: `${action} - ${(order.restaurants as any)?.name || 'Restaurant'}`,
          timestamp: new Date(order.created_at),
          status
        });
      });

      // Fetch recent driver earnings (payments)
      const { data: earnings } = await supabase
        .from('driver_earnings')
        .select('id, earning_type, net_amount, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      earnings?.forEach(earning => {
        events.push({
          id: `earning-${earning.id}`,
          type: 'payment',
          action: earning.earning_type === 'trip' ? 'Payment received' : 'Payout completed',
          description: `$${earning.net_amount.toFixed(2)} ${earning.earning_type}`,
          timestamp: new Date(earning.created_at),
          status: 'success'
        });
      });

      // Fetch recent security events (alerts)
      const { data: securityEvents } = await supabase
        .from('security_events')
        .select('id, event_type, severity, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      securityEvents?.forEach(event => {
        events.push({
          id: `security-${event.id}`,
          type: 'alert',
          action: event.event_type.replace(/_/g, ' '),
          description: `Security event: ${event.event_type}`,
          timestamp: new Date(event.created_at),
          status: event.severity === 'critical' ? 'error' : event.severity === 'warning' ? 'warning' : 'info'
        });
      });

      // Fetch driver location updates
      const { data: locations } = await supabase
        .from('driver_location_history')
        .select('id, driver_id, recorded_at, is_online')
        .order('recorded_at', { ascending: false })
        .limit(10);

      locations?.forEach(loc => {
        events.push({
          id: `location-${loc.id}`,
          type: 'driver',
          action: loc.is_online ? 'Driver went online' : 'Location updated',
          description: `Driver ${loc.driver_id.slice(0, 8)}... location update`,
          timestamp: new Date(loc.recorded_at),
          status: loc.is_online ? 'success' : 'info'
        });
      });

      // Sort all events by timestamp
      return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50);
    },
    refetchInterval: isPaused ? false : 5000,
    staleTime: 3000,
  });

  const events = eventsData || [];

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const filteredEvents = events.filter(event => filters[event.type]);
  const activeFilters = Object.entries(filters).filter(([_, v]) => v).length;

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (isLoading) {
    return (
      <Card className="h-[600px]">
        <CardHeader>
          <Skeleton className="h-8 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Activity Stream</CardTitle>
              <p className="text-xs text-muted-foreground">
                {filteredEvents.length} events • {isPaused ? "Paused" : "Live"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {activeFilters}/6
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(filters).map(([key, value]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, [key]: checked }))
                    }
                  >
                    <span className="capitalize">{key}</span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant={isPaused ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="gap-2"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Switch
            id="auto-scroll"
            checked={autoScroll}
            onCheckedChange={setAutoScroll}
            className="scale-90"
          />
          <Label htmlFor="auto-scroll" className="text-xs text-muted-foreground">
            Auto-scroll to newest
          </Label>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-4 space-y-2">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity events found</p>
              </div>
            ) : (
              filteredEvents.map((event, index) => {
                const Icon = eventIcons[event.type];
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors",
                      index === 0 && !isPaused && "animate-fade-in"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", statusColors[event.status])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{event.action}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {event.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
