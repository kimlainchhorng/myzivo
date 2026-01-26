import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, DollarSign, Users, Star } from "lucide-react";

const HotelOverview = () => {
  const stats = [
    { label: "Bookings Today", value: "18", icon: Hotel, color: "text-amber-500", trend: "+5" },
    { label: "Revenue", value: "$12,850", icon: DollarSign, color: "text-green-500", trend: "+10%" },
    { label: "Occupancy", value: "85%", icon: Users, color: "text-blue-500", trend: "+8%" },
    { label: "Avg Rating", value: "4.7", icon: Star, color: "text-primary", trend: "+0.2" },
  ];

  const topHotels = [
    { name: "Grand Plaza Hotel", city: "New York", rating: 4.8, bookings: 45, revenue: "$15,200" },
    { name: "Seaside Resort", city: "Miami", rating: 4.6, bookings: 38, revenue: "$12,800" },
    { name: "Mountain Lodge", city: "Denver", rating: 4.9, bookings: 28, revenue: "$9,400" },
    { name: "Urban Boutique", city: "Los Angeles", rating: 4.5, bookings: 32, revenue: "$10,600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hotel Booking Dashboard</h1>
        <p className="text-muted-foreground">Manage hotels and reservations</p>
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
          <CardTitle>Top Performing Hotels</CardTitle>
          <CardDescription>Hotels with highest bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topHotels.map((hotel, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Hotel className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">{hotel.name}</p>
                    <p className="text-sm text-muted-foreground">{hotel.city} • ⭐ {hotel.rating}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{hotel.revenue}</p>
                  <p className="text-sm text-muted-foreground">{hotel.bookings} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelOverview;
