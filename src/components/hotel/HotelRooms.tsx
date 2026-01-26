import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BedDouble, Plus, Edit } from "lucide-react";

const HotelRooms = () => {
  const rooms = [
    { id: 1, name: "Standard Room", type: "standard", beds: "1 King Bed", maxGuests: 2, price: 129, available: 8, total: 15 },
    { id: 2, name: "Deluxe Room", type: "deluxe", beds: "1 King Bed", maxGuests: 2, price: 179, available: 5, total: 10 },
    { id: 3, name: "Suite", type: "suite", beds: "1 King + Sofa Bed", maxGuests: 4, price: 299, available: 2, total: 5 },
    { id: 4, name: "Family Room", type: "family", beds: "2 Queen Beds", maxGuests: 4, price: 229, available: 3, total: 8 },
    { id: 5, name: "Presidential Suite", type: "presidential", beds: "1 King Bed", maxGuests: 2, price: 599, available: 1, total: 2 },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "standard": return "bg-muted text-muted-foreground";
      case "deluxe": return "bg-blue-500/10 text-blue-500";
      case "suite": return "bg-amber-500/10 text-amber-500";
      case "family": return "bg-green-500/10 text-green-500";
      case "presidential": return "bg-purple-500/10 text-purple-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">Manage room types and availability</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Room Type
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <BedDouble className="h-6 w-6 text-amber-500" />
                </div>
                <Badge className={getTypeColor(room.type)}>{room.type}</Badge>
              </div>
              <h3 className="font-bold text-lg">{room.name}</h3>
              <p className="text-sm text-muted-foreground">{room.beds} • Max {room.maxGuests} guests</p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-lg font-semibold">${room.price}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                <span className="text-sm text-muted-foreground">{room.available}/{room.total} available</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${((room.total - room.available) / room.total) * 100}%` }}
                />
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                <Edit className="h-4 w-4 mr-2" />
                Edit Room
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HotelRooms;
