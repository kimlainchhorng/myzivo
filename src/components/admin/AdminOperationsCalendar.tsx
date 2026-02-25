import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, 
  Clock, MapPin, Users, AlertTriangle
} from "lucide-react";

const events = [
  { id: "1", title: "Stadium Event - High Demand", date: "2024-01-20", time: "18:00", type: "event", zone: "Stadium Area", drivers: 50 },
  { id: "2", title: "Driver Training Session", date: "2024-01-21", time: "10:00", type: "training", zone: "HQ", drivers: 25 },
  { id: "3", title: "Surge Pricing Active", date: "2024-01-22", time: "17:00", type: "surge", zone: "Downtown", drivers: 0 },
  { id: "4", title: "New Zone Launch", date: "2024-01-25", time: "09:00", type: "launch", zone: "North Suburbs", drivers: 30 },
  { id: "5", title: "System Maintenance", date: "2024-01-28", time: "02:00", type: "maintenance", zone: "All", drivers: 0 },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminOperationsCalendar() {
  const [currentMonth] = useState("January 2024");

  const getEventTypeBadge = (type: string) => {
    const config: Record<string, string> = {
      event: "bg-purple-500/10 text-purple-500",
      training: "bg-blue-500/10 text-blue-500",
      surge: "bg-amber-500/10 text-amber-500",
      launch: "bg-green-500/10 text-green-500",
      maintenance: "bg-red-500/10 text-red-500"
    };
    return <Badge className={config[type]}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Operations Calendar
          </h2>
          <p className="text-muted-foreground">Plan and schedule operational events</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentMonth}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 2;
                const isCurrentMonth = day >= 1 && day <= 31;
                const hasEvent = events.some(e => parseInt(e.date.split("-")[2]) === day);
                
                return (
                  <div
                    key={i}
                    className={`aspect-square p-1 rounded-xl border ${
                      isCurrentMonth 
                        ? hasEvent 
                          ? "bg-primary/10 border-primary/30" 
                          : "bg-muted/30 border-transparent"
                        : "opacity-30"
                    }`}
                  >
                    {isCurrentMonth && (
                      <div className="text-sm font-medium">{day}</div>
                    )}
                    {hasEvent && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.slice(0, 4).map((event) => (
              <div key={event.id} className="p-3 rounded-xl bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{event.title}</span>
                  {getEventTypeBadge(event.type)}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {event.time}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.zone}
                  </span>
                  {event.drivers > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.drivers} drivers
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Scheduled Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{event.date} at {event.time}</span>
                      <span>•</span>
                      <span>{event.zone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getEventTypeBadge(event.type)}
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
