import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, ArrowRight, Clock } from "lucide-react";

const FlightSearch = () => {
  const [searchResults, setSearchResults] = useState([
    { id: 1, airline: "Delta", flight: "DL 1234", departure: "08:00", arrival: "11:30", duration: "3h 30m", price: 299, stops: 0 },
    { id: 2, airline: "United", flight: "UA 5678", departure: "10:15", arrival: "14:00", duration: "3h 45m", price: 279, stops: 0 },
    { id: 3, airline: "American", flight: "AA 9012", departure: "14:30", arrival: "19:15", duration: "4h 45m", price: 249, stops: 1 },
    { id: 4, airline: "JetBlue", flight: "B6 3456", departure: "18:00", arrival: "21:30", duration: "3h 30m", price: 319, stops: 0 },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search Flights</h1>
        <p className="text-muted-foreground">Find and book your perfect flight</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Input placeholder="City or Airport" defaultValue="New York (JFK)" />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input placeholder="City or Airport" defaultValue="Los Angeles (LAX)" />
            </div>
            <div className="space-y-2">
              <Label>Departure</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Return</Label>
              <Input type="date" />
            </div>
            <div className="flex items-end">
              <Button className="w-full">Search Flights</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Flights</h2>
        {searchResults.map((flight) => (
          <Card key={flight.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="p-2 rounded-lg bg-sky-500/10 mb-2">
                      <Plane className="h-5 w-5 text-sky-500" />
                    </div>
                    <p className="text-sm font-medium">{flight.airline}</p>
                    <p className="text-xs text-muted-foreground">{flight.flight}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold">{flight.departure}</p>
                      <p className="text-sm text-muted-foreground">JFK</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                      <div className="w-24 h-px bg-border relative">
                        <ArrowRight className="h-4 w-4 absolute right-0 -top-2 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{flight.duration}</p>
                      <p className="text-xs text-muted-foreground">{flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop`}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{flight.arrival}</p>
                      <p className="text-sm text-muted-foreground">LAX</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${flight.price}</p>
                  <p className="text-sm text-muted-foreground mb-2">per person</p>
                  <Button>Select</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FlightSearch;
