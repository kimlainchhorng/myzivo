import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock } from "lucide-react";

const FlightSchedules = () => {
  const schedules = [
    { flight: "DL 1234", route: "NYC → LAX", departure: "08:00", arrival: "11:30", aircraft: "Boeing 737", status: "on_time" },
    { flight: "UA 5678", route: "LAX → SFO", departure: "10:15", arrival: "11:30", aircraft: "Airbus A320", status: "on_time" },
    { flight: "AA 9012", route: "MIA → NYC", departure: "14:30", arrival: "17:45", aircraft: "Boeing 777", status: "delayed" },
    { flight: "B6 3456", route: "BOS → JFK", departure: "16:00", arrival: "17:15", aircraft: "Embraer 190", status: "on_time" },
    { flight: "SW 7890", route: "DEN → PHX", departure: "18:45", arrival: "20:00", aircraft: "Boeing 737 MAX", status: "cancelled" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_time": return "bg-green-500/10 text-green-500";
      case "delayed": return "bg-amber-500/10 text-amber-500";
      case "cancelled": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Flight Schedules</h1>
        <p className="text-muted-foreground">Today's flight schedule</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Flights</CardTitle>
          <CardDescription>Live flight status and schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map((flight, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-sky-500/10">
                    <Plane className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{flight.flight}</span>
                      <Badge className={getStatusColor(flight.status)}>
                        {flight.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{flight.route}</p>
                    <p className="text-xs text-muted-foreground">{flight.aircraft}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="font-bold">{flight.departure}</p>
                    <p className="text-xs text-muted-foreground">Departure</p>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-bold">{flight.arrival}</p>
                    <p className="text-xs text-muted-foreground">Arrival</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlightSchedules;
