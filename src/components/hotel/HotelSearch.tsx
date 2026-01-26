import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Hotel, Star, MapPin, Users } from "lucide-react";

const HotelSearch = () => {
  const [searchResults] = useState([
    { id: 1, name: "Grand Plaza Hotel", city: "New York", rating: 4.8, reviews: 2340, price: 189, amenities: ["Pool", "Spa", "Gym"] },
    { id: 2, name: "Seaside Resort", city: "Miami Beach", rating: 4.6, reviews: 1890, price: 249, amenities: ["Beach", "Pool", "Restaurant"] },
    { id: 3, name: "Urban Boutique Hotel", city: "Los Angeles", rating: 4.5, reviews: 980, price: 159, amenities: ["Gym", "Bar", "WiFi"] },
    { id: 4, name: "Mountain View Lodge", city: "Denver", rating: 4.9, reviews: 756, price: 139, amenities: ["Hiking", "Spa", "Restaurant"] },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search Hotels</h1>
        <p className="text-muted-foreground">Find and book your perfect stay</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input placeholder="City or hotel name" defaultValue="New York" />
            </div>
            <div className="space-y-2">
              <Label>Check-in</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Check-out</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Guests</Label>
              <Input type="number" defaultValue="2" min="1" />
            </div>
            <div className="flex items-end">
              <Button className="w-full">Search Hotels</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Hotels</h2>
        {searchResults.map((hotel) => (
          <Card key={hotel.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-32 h-24 rounded-lg bg-muted flex items-center justify-center">
                    <Hotel className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{hotel.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      {hotel.city}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium">{hotel.rating}</span>
                      <span className="text-muted-foreground">({hotel.reviews} reviews)</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {hotel.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${hotel.price}</p>
                  <p className="text-sm text-muted-foreground mb-3">per night</p>
                  <Button>Book Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HotelSearch;
