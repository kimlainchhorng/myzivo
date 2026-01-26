import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const CustomerCarRentals = () => {
  const { user } = useAuth();

  const { data: rentals, isLoading } = useQuery({
    queryKey: ["customer-car-rentals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("car_rentals")
        .select("*, rental_cars(make, model, year, images)")
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
      case "in_progress": return "bg-blue-500/10 text-blue-500";
      case "confirmed": return "bg-amber-500/10 text-amber-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Car Rentals</h1>
        <p className="text-muted-foreground">Your rental history and active bookings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rental History</CardTitle>
          <CardDescription>All your car rentals</CardDescription>
        </CardHeader>
        <CardContent>
          {rentals && rentals.length > 0 ? (
            <div className="space-y-4">
              {rentals.map((rental: any) => (
                <div key={rental.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {rental.rental_cars?.year} {rental.rental_cars?.make} {rental.rental_cars?.model}
                        </p>
                        <p className="text-sm text-muted-foreground">{rental.pickup_location}</p>
                      </div>
                      <Badge className={getStatusColor(rental.status)}>
                        {rental.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{format(new Date(rental.pickup_date), 'MMM d')} - {format(new Date(rental.return_date), 'MMM d, yyyy')}</span>
                      <span className="font-semibold text-foreground">${rental.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No car rentals yet</p>
              <p className="text-sm">Rent a car for your next trip!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerCarRentals;
