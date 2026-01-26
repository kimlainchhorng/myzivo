import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const CustomerFlights = () => {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["customer-flight-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("flight_bookings")
        .select("*, flights(flight_number, departure_city, arrival_city, departure_time, arrival_time, airlines(name, code))")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500";
      case "cancelled": return "bg-red-500/10 text-red-500";
      case "confirmed": return "bg-sky-500/10 text-sky-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Flight Bookings</h1>
        <p className="text-muted-foreground">Your flight history and upcoming trips</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>All your flight bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div key={booking.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="p-2 rounded-lg bg-sky-500/10">
                    <Plane className="h-5 w-5 text-sky-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {booking.flights?.departure_city} → {booking.flights?.arrival_city}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.flights?.airlines?.code} {booking.flights?.flight_number} • {booking.booking_reference}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{booking.flights?.departure_time && format(new Date(booking.flights.departure_time), 'MMM d, yyyy')}</span>
                      <span>{booking.total_passengers} passenger{booking.total_passengers > 1 ? 's' : ''}</span>
                      <span className="font-semibold text-foreground">${booking.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No flight bookings yet</p>
              <p className="text-sm">Book a flight for your next adventure!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerFlights;
