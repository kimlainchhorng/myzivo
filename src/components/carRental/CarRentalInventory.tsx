import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Plus, Edit, Trash2, Search, Sparkles, DollarSign, Fuel, Settings2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const CarRentalInventory = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const cars = [
    { id: 1, make: "Tesla", model: "Model 3", year: 2024, category: "Electric", dailyRate: 85, status: "available", plate: "ABC-1234", color: "White" },
    { id: 2, make: "BMW", model: "X5", year: 2023, category: "SUV", dailyRate: 120, status: "rented", plate: "DEF-5678", color: "Black" },
    { id: 3, make: "Mercedes", model: "C-Class", year: 2024, category: "Luxury", dailyRate: 95, status: "available", plate: "GHI-9012", color: "Silver" },
    { id: 4, make: "Audi", model: "A4", year: 2023, category: "Sedan", dailyRate: 75, status: "maintenance", plate: "JKL-3456", color: "Blue" },
    { id: 5, make: "Toyota", model: "Camry", year: 2024, category: "Economy", dailyRate: 55, status: "available", plate: "MNO-7890", color: "Red" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "available": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500" };
      case "rented": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500" };
      case "maintenance": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground" };
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case "Electric": return "from-emerald-500 to-teal-400";
      case "SUV": return "from-amber-500 to-orange-500";
      case "Luxury": return "from-purple-500 to-pink-500";
      case "Sedan": return "from-blue-500 to-indigo-500";
      case "Economy": return "from-gray-500 to-slate-500";
      default: return "from-primary to-teal-400";
    }
  };

  const filteredCars = cars.filter(car =>
    `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Fleet Inventory
          </h1>
          <p className="text-muted-foreground">Manage your vehicle fleet</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-primary to-teal-400 shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-sm"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50"
        />
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredCars.map((car) => {
          const statusConfig = getStatusConfig(car.status);
          const categoryGradient = getCategoryGradient(car.category);
          return (
            <motion.div key={car.id} variants={item}>
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="p-5 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryGradient} shadow-lg group-hover:scale-110 transition-transform`}>
                      <Car className="h-6 w-6 text-white" />
                    </div>
                    <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${car.status === 'rented' ? 'animate-pulse' : ''}`} />
                      {car.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-xl">{car.year} {car.make} {car.model}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="bg-muted/50 font-normal">
                      {car.category}
                    </Badge>
                    <span>•</span>
                    <span>{car.plate}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: car.color.toLowerCase() === 'white' ? '#e5e5e5' : car.color.toLowerCase() }} />
                      {car.color}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <span className="flex items-center gap-1 text-lg font-bold text-emerald-500">
                      <DollarSign className="h-4 w-4" />
                      {car.dailyRate}
                      <span className="text-xs text-muted-foreground font-normal">/day</span>
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default CarRentalInventory;
