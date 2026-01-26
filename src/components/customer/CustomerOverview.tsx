import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, UtensilsCrossed, Plane, Hotel, MapPin, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CustomerOverview = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Total Rides", value: "24", icon: MapPin, color: "text-rides" },
    { label: "Food Orders", value: "18", icon: UtensilsCrossed, color: "text-eats" },
    { label: "Car Rentals", value: "3", icon: Car, color: "text-primary" },
    { label: "Flight Bookings", value: "5", icon: Plane, color: "text-sky-500" },
    { label: "Hotel Stays", value: "7", icon: Hotel, color: "text-amber-500" },
  ];

  const recentActivity = [
    { type: "ride", description: "Trip to Airport", date: "Today, 2:30 PM", amount: "$32.50" },
    { type: "food", description: "Order from Bella Italia", date: "Yesterday", amount: "$24.99" },
    { type: "hotel", description: "Check-in at Grand Hotel", date: "Jan 20", amount: "$189.00" },
    { type: "flight", description: "NYC → LAX", date: "Jan 18", amount: "$299.00" },
    { type: "car", description: "Tesla Model 3 Rental", date: "Jan 15", amount: "$85.00" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</h1>
        <p className="text-muted-foreground">Here's an overview of your bookings and activity.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest bookings and orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                  <span className="font-semibold">{activity.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Book your next adventure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 rounded-lg bg-rides/10 hover:bg-rides/20 transition-colors text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-rides" />
                <span className="text-sm font-medium">Book Ride</span>
              </button>
              <button className="p-4 rounded-lg bg-eats/10 hover:bg-eats/20 transition-colors text-center">
                <UtensilsCrossed className="h-6 w-6 mx-auto mb-2 text-eats" />
                <span className="text-sm font-medium">Order Food</span>
              </button>
              <button className="p-4 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 transition-colors text-center">
                <Plane className="h-6 w-6 mx-auto mb-2 text-sky-500" />
                <span className="text-sm font-medium">Book Flight</span>
              </button>
              <button className="p-4 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors text-center">
                <Hotel className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                <span className="text-sm font-medium">Book Hotel</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerOverview;
