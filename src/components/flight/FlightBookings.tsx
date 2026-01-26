import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, Users } from "lucide-react";

const FlightBookings = () => {
  const bookings = [
    { id: "FLT-001", route: "NYC → LAX", flight: "DL 1234", date: "Jan 28, 2024", passengers: 2, status: "confirmed", total: "$598", ref: "ABCD12" },
    { id: "FLT-002", route: "LAX → SFO", flight: "UA 5678", date: "Feb 5, 2024", passengers: 1, status: "pending", total: "$149", ref: "EFGH34" },
    { id: "FLT-003", route: "MIA → NYC", flight: "AA 9012", date: "Jan 15, 2024", passengers: 3, status: "completed", total: "$567", ref: "IJKL56" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-500";
      case "pending": return "bg-amber-500/10 text-amber-500";
      case "completed": return "bg-blue-500/10 text-blue-500";
      case "cancelled": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your flight bookings</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-3 rounded-lg bg-sky-500/10">
                    <Plane className="h-6 w-6 text-sky-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">{booking.route}</span>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{booking.flight} • Ref: {booking.ref}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {booking.passengers} passenger{booking.passengers > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{booking.total}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">View Details</Button>
                    {booking.status === "confirmed" && (
                      <Button size="sm" variant="outline" className="text-destructive">Cancel</Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FlightBookings;
