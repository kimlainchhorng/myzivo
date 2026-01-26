import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, DollarSign, Calendar, TrendingUp } from "lucide-react";

const CarRentalOverview = () => {
  const stats = [
    { label: "Active Rentals", value: "12", icon: Car, color: "text-primary", trend: "+3" },
    { label: "Revenue", value: "$8,450", icon: DollarSign, color: "text-green-500", trend: "+12%" },
    { label: "Bookings", value: "28", icon: Calendar, color: "text-amber-500", trend: "+5" },
    { label: "Fleet Utilization", value: "78%", icon: TrendingUp, color: "text-blue-500", trend: "+8%" },
  ];

  const recentBookings = [
    { id: "CAR-001", car: "Tesla Model 3", customer: "John D.", dates: "Jan 25 - Jan 28", status: "active", total: "$255" },
    { id: "CAR-002", car: "BMW X5", customer: "Sarah M.", dates: "Jan 24 - Jan 26", status: "completed", total: "$320" },
    { id: "CAR-003", car: "Mercedes C-Class", customer: "Mike R.", dates: "Jan 27 - Jan 30", status: "upcoming", total: "$285" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500";
      case "completed": return "bg-blue-500/10 text-blue-500";
      case "upcoming": return "bg-amber-500/10 text-amber-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Car Rental Dashboard</h1>
        <p className="text-muted-foreground">Manage your fleet and bookings</p>
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
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest rental bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{booking.car}</p>
                    <p className="text-sm text-muted-foreground">{booking.customer} • {booking.dates}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  <p className="font-semibold mt-1">{booking.total}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarRentalOverview;
