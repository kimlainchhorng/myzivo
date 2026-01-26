import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, DollarSign, Users, TrendingUp } from "lucide-react";

const FlightOverview = () => {
  const stats = [
    { label: "Bookings Today", value: "42", icon: Plane, color: "text-sky-500", trend: "+8" },
    { label: "Revenue", value: "$28,450", icon: DollarSign, color: "text-green-500", trend: "+15%" },
    { label: "Passengers", value: "156", icon: Users, color: "text-amber-500", trend: "+12%" },
    { label: "Occupancy Rate", value: "82%", icon: TrendingUp, color: "text-primary", trend: "+5%" },
  ];

  const popularRoutes = [
    { route: "NYC → LAX", flights: 24, avgPrice: "$299", occupancy: "85%" },
    { route: "LAX → SFO", flights: 18, avgPrice: "$149", occupancy: "78%" },
    { route: "NYC → MIA", flights: 15, avgPrice: "$189", occupancy: "82%" },
    { route: "CHI → NYC", flights: 12, avgPrice: "$179", occupancy: "75%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Flight Booking Dashboard</h1>
        <p className="text-muted-foreground">Manage flights and bookings</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-green-500 font-medium">{stat.trend}</span>
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Routes</CardTitle>
          <CardDescription>Most booked flight routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10">
                    <Plane className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-medium">{route.route}</p>
                    <p className="text-sm text-muted-foreground">{route.flights} flights/day</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{route.avgPrice}</p>
                  <p className="text-sm text-muted-foreground">{route.occupancy} occupancy</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlightOverview;
