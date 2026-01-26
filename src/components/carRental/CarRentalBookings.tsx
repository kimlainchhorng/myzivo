import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Calendar } from "lucide-react";

const CarRentalBookings = () => {
  const bookings = [
    { id: "CAR-001", car: "Tesla Model 3", customer: "John D.", phone: "+1 234 5678", dates: "Jan 25 - Jan 28", status: "active", total: "$255", deposit: "$100" },
    { id: "CAR-002", car: "BMW X5", customer: "Sarah M.", phone: "+1 345 6789", dates: "Jan 24 - Jan 26", status: "completed", total: "$320", deposit: "$150" },
    { id: "CAR-003", car: "Mercedes C-Class", customer: "Mike R.", phone: "+1 456 7890", dates: "Jan 27 - Jan 30", status: "pending", total: "$285", deposit: "$120" },
    { id: "CAR-004", car: "Audi A4", customer: "Emily K.", phone: "+1 567 8901", dates: "Jan 29 - Feb 1", status: "upcoming", total: "$340", deposit: "$130" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500";
      case "completed": return "bg-blue-500/10 text-blue-500";
      case "pending": return "bg-yellow-500/10 text-yellow-500";
      case "upcoming": return "bg-amber-500/10 text-amber-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">Manage car rental bookings</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{booking.id}</span>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>
                    <p className="font-medium">{booking.car}</p>
                    <p className="text-sm text-muted-foreground">{booking.customer} • {booking.phone}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {booking.dates}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{booking.total}</p>
                  <p className="text-sm text-muted-foreground">Deposit: {booking.deposit}</p>
                  <div className="flex gap-2 mt-3">
                    {booking.status === "pending" && (
                      <>
                        <Button size="sm">Approve</Button>
                        <Button size="sm" variant="outline">Reject</Button>
                      </>
                    )}
                    {booking.status === "active" && (
                      <Button size="sm" variant="outline">Complete</Button>
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

export default CarRentalBookings;
