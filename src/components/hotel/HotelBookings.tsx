import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hotel, Calendar, Users } from "lucide-react";

const HotelBookings = () => {
  const bookings = [
    { id: "HTL-001", hotel: "Grand Plaza Hotel", city: "New York", dates: "Jan 28 - Jan 30", nights: 2, guests: 2, status: "confirmed", total: "$378", ref: "HP12345" },
    { id: "HTL-002", hotel: "Seaside Resort", city: "Miami", dates: "Feb 10 - Feb 14", nights: 4, guests: 2, status: "pending", total: "$996", ref: "SR67890" },
    { id: "HTL-003", hotel: "Mountain Lodge", city: "Denver", dates: "Jan 10 - Jan 12", nights: 2, guests: 1, status: "completed", total: "$278", ref: "ML11111" },
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
        <p className="text-muted-foreground">View and manage your hotel reservations</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-3 rounded-lg bg-amber-500/10">
                    <Hotel className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">{booking.hotel}</span>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{booking.city} • Ref: {booking.ref}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {booking.dates}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {booking.guests} guest{booking.guests > 1 ? 's' : ''} • {booking.nights} night{booking.nights > 1 ? 's' : ''}
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

export default HotelBookings;
