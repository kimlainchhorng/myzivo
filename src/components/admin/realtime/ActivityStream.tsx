import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

const generateRandomEvent = (): ActivityEvent => {
  const types: ActivityEvent["type"][] = ["ride", "order", "payment", "user", "driver", "alert"];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const events: Record<string, { actions: string[]; statuses: ActivityEvent["status"][] }> = {
    ride: { 
      actions: ["Ride completed", "New ride requested", "Driver assigned", "Ride cancelled"],
      statuses: ["success", "info", "info", "warning"]
    },
    order: { 
      actions: ["Order placed", "Order delivered", "Order preparing", "Order cancelled"],
      statuses: ["info", "success", "info", "error"]
    },
    payment: { 
      actions: ["Payment received", "Refund processed", "Payment failed", "Payout completed"],
      statuses: ["success", "info", "error", "success"]
    },
    user: { 
      actions: ["New user registered", "Profile updated", "Account verified", "Password reset"],
      statuses: ["info", "info", "success", "info"]
    },
    driver: { 
      actions: ["Driver went online", "Location updated", "Driver went offline", "Documents uploaded"],
      statuses: ["success", "info", "warning", "info"]
    },
    alert: { 
      actions: ["High demand detected", "Service disruption", "Unusual activity", "SLA breach"],
      statuses: ["warning", "error", "warning", "error"]
    },
  };

  const actionIndex = Math.floor(Math.random() * events[type].actions.length);
  
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    action: events[type].actions[actionIndex],
    description: `${events[type].actions[actionIndex]} - ID: ${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    timestamp: new Date(),
    status: events[type].statuses[actionIndex],
  };
};

export default function ActivityStream() {
  const [events, setEvents] = useState<ActivityEvent[]>(() => 
    Array.from({ length: 10 }, generateRandomEvent)
  );
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

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newEvent = generateRandomEvent();
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const filteredEvents = events.filter(event => filters[event.type]);
  const activeFilters = Object.entries(filters).filter(([_, v]) => v).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

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
            {filteredEvents.map((event, index) => {
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
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
