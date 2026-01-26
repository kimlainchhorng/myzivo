import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

const CarRentalInventory = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const cars = [
    { id: 1, make: "Tesla", model: "Model 3", year: 2024, category: "Electric", dailyRate: 85, status: "available", plate: "ABC-1234" },
    { id: 2, make: "BMW", model: "X5", year: 2023, category: "SUV", dailyRate: 120, status: "rented", plate: "DEF-5678" },
    { id: 3, make: "Mercedes", model: "C-Class", year: 2024, category: "Luxury", dailyRate: 95, status: "available", plate: "GHI-9012" },
    { id: 4, make: "Audi", model: "A4", year: 2023, category: "Sedan", dailyRate: 75, status: "maintenance", plate: "JKL-3456" },
    { id: 5, make: "Toyota", model: "Camry", year: 2024, category: "Economy", dailyRate: 55, status: "available", plate: "MNO-7890" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500/10 text-green-500";
      case "rented": return "bg-blue-500/10 text-blue-500";
      case "maintenance": return "bg-amber-500/10 text-amber-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredCars = cars.filter(car =>
    `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fleet Inventory</h1>
          <p className="text-muted-foreground">Manage your vehicle fleet</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <Input
        placeholder="Search vehicles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCars.map((car) => (
          <Card key={car.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <Badge className={getStatusColor(car.status)}>{car.status}</Badge>
              </div>
              <h3 className="font-bold text-lg">{car.year} {car.make} {car.model}</h3>
              <p className="text-sm text-muted-foreground">{car.category} • {car.plate}</p>
              <p className="text-lg font-semibold mt-2">${car.dailyRate}/day</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CarRentalInventory;
