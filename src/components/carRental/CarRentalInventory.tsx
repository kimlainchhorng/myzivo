import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Plus, Edit, Trash2, Search, Sparkles, DollarSign, Filter, SlidersHorizontal, Eye } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const CarRentalInventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { data: cars, isLoading } = useQuery({
    queryKey: ["rental-cars-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_cars")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "available": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500", glow: "shadow-emerald-500/20" };
      case "rented": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500", glow: "shadow-blue-500/20" };
      case "maintenance": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500", glow: "shadow-amber-500/20" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground", glow: "" };
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category?.toLowerCase()) {
      case "electric": return { gradient: "from-emerald-500 to-teal-400", icon: "⚡", label: "Electric" };
      case "suv": return { gradient: "from-amber-500 to-orange-500", icon: "🚙", label: "SUV" };
      case "luxury": return { gradient: "from-purple-500 to-pink-500", icon: "💎", label: "Luxury" };
      case "sedan": return { gradient: "from-blue-500 to-indigo-500", icon: "🚗", label: "Sedan" };
      case "economy": return { gradient: "from-gray-500 to-slate-500", icon: "💰", label: "Economy" };
      case "sports": return { gradient: "from-red-500 to-rose-500", icon: "🏎️", label: "Sports" };
      default: return { gradient: "from-primary to-teal-400", icon: "🚗", label: "Standard" };
    }
  };

  const categories = ["Electric", "SUV", "Luxury", "Sedan", "Economy", "Sports"];

  const filteredCars = (cars || []).filter((car: any) => {
    const matchesSearch = `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || car.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Floating Decorations */}
      <div className="absolute -top-4 right-10 text-3xl pointer-events-none hidden md:block animate-float-icon">
        🚙
      </div>
      <div className="absolute top-20 right-0 text-2xl pointer-events-none hidden md:block animate-pulse-slow">
        ✨
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="animate-wiggle">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            Fleet Inventory
          </h1>
          <p className="text-muted-foreground">Manage your vehicle fleet with style</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-primary to-teal-400 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 touch-manipulation active:scale-95">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "100ms" }}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-card/50 backdrop-blur-sm border-border/50 touch-manipulation active:scale-95">
              <Filter className="h-4 w-4" />
              {categoryFilter || "All Categories"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
              All Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {categories.map((cat) => {
              const config = getCategoryConfig(cat);
              return (
                <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat)}>
                  <span className="mr-2">{config.icon}</span>
                  {cat}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "150ms" }}>
        {[
          { label: "Total Vehicles", value: cars?.length || 0, color: "text-primary" },
          { label: "Available", value: cars?.filter((c: any) => c.status === "available" || c.is_available).length || 0, color: "text-emerald-500" },
          { label: "Rented", value: cars?.filter((c: any) => c.status === "rented" || !c.is_available).length || 0, color: "text-blue-500" },
          { label: "Maintenance", value: cars?.filter((c: any) => c.status === "maintenance").length || 0, color: "text-amber-500" },
        ].map((stat, idx) => (
          <div key={stat.label} className="p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-colors">
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Vehicle Grid */}
      {filteredCars.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCars.map((car: any, index: number) => {
            const statusConfig = getStatusConfig(car.status || (car.is_available ? "available" : "rented"));
            const categoryConfig = getCategoryConfig(car.category);
            const colorValue = car.color?.toLowerCase() === 'white' ? '#e5e5e5' : car.color?.toLowerCase() || '#888';
            
            return (
              <div
                key={car.id}
                className="animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-300"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-1">
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${categoryConfig.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`} />
                  
                  {/* Top Accent Line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryConfig.gradient}`} />
                  
                  <CardContent className="p-5 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className={`p-3 rounded-xl bg-gradient-to-br ${categoryConfig.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <Car className="h-6 w-6 text-white" />
                      </div>
                      <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border shadow-sm ${statusConfig.glow}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${car.status === 'rented' || !car.is_available ? 'animate-pulse' : ''}`} />
                        {car.status || (car.is_available ? "available" : "rented")}
                      </Badge>
                    </div>
                    
                    <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                      {car.year} {car.make} {car.model}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="bg-muted/50 font-normal text-xs">
                        <span className="mr-1">{categoryConfig.icon}</span>
                        {car.category || "Standard"}
                      </Badge>
                      <span className="text-muted-foreground text-sm">•</span>
                      <span className="text-sm text-muted-foreground">{car.license_plate || "N/A"}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3">
                      {car.color && (
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground px-2.5 py-1 rounded-lg bg-muted/50 border border-border/50">
                          <div 
                            className="w-3 h-3 rounded-full ring-1 ring-border/50" 
                            style={{ backgroundColor: colorValue }} 
                          />
                          {car.color}
                        </span>
                      )}
                      {car.fuel_type && (
                        <span className="text-sm text-muted-foreground px-2.5 py-1 rounded-lg bg-muted/50 border border-border/50">
                          ⛽ {car.fuel_type}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                      <span className="flex items-center gap-1 text-xl font-bold text-emerald-500">
                        <DollarSign className="h-5 w-5" />
                        {car.daily_rate || 0}
                        <span className="text-xs text-muted-foreground font-normal">/day</span>
                      </span>
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors touch-manipulation active:scale-90">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors touch-manipulation active:scale-90">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 transition-colors touch-manipulation active:scale-90">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-6xl mb-4 animate-bounce">🚗</div>
          <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || categoryFilter 
              ? "Try adjusting your search or filters" 
              : "Start by adding your first vehicle to the fleet"}
          </p>
          <Button className="gap-2 bg-gradient-to-r from-primary to-teal-400 touch-manipulation active:scale-95">
            <Plus className="h-4 w-4" />
            Add Your First Vehicle
          </Button>
        </div>
      )}
    </div>
  );
};

export default CarRentalInventory;
