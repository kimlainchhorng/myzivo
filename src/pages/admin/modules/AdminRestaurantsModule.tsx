/**
 * Admin Restaurants Module
 * CRUD for restaurants + basic menu management
 */
import { useState } from "react";
import { 
  Store, Search, RefreshCw, Phone, Mail, Eye, Plus, 
  CheckCircle, XCircle, Loader2, Edit, Star, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  cuisine_type: string | null;
  rating: number | null;
  is_open: boolean | null;
  created_at: string;
}

export default function AdminRestaurantsModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const queryClient = useQueryClient();

  const { data: restaurants, isLoading, refetch } = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Restaurant[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("restaurants")
        .update({ is_open: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      toast.success("Restaurant updated");
    },
  });

  const filteredRestaurants = restaurants?.filter(restaurant => {
    const matchesSearch = !searchQuery || 
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (restaurant.cuisine_type || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && restaurant.is_open) ||
      (statusFilter === "inactive" && !restaurant.is_open);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: restaurants?.length ?? 0,
    active: restaurants?.filter(r => r.is_open).length ?? 0,
    inactive: restaurants?.filter(r => !r.is_open).length ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6 text-eats" />
            Restaurants
          </h1>
          <p className="text-muted-foreground">Manage restaurant listings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Restaurants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-gray-400">{stats.inactive}</p>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, city, cuisine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No restaurants found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-3 font-medium">Restaurant</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Location</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">Contact</th>
                    <th className="text-left p-3 font-medium">Rating</th>
                    <th className="text-left p-3 font-medium">Active</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRestaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <p className="font-medium">{restaurant.name}</p>
                        <p className="text-xs text-muted-foreground">{restaurant.cuisine_type || "Various"}</p>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3" />
                          {restaurant.city}
                        </div>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <p className="text-xs">{restaurant.phone || "N/A"}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{restaurant.email || "N/A"}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium">{restaurant.rating?.toFixed(1) ?? "N/A"}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Switch
                          checked={restaurant.is_open ?? false}
                          onCheckedChange={(checked) => toggleActive.mutate({ id: restaurant.id, isActive: checked })}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {restaurant.phone && (
                            <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                              <a href={`tel:${restaurant.phone}`}><Phone className="w-3 h-3" /></a>
                            </Button>
                          )}
                          {restaurant.email && (
                            <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                              <a href={`mailto:${restaurant.email}`}><Mail className="w-3 h-3" /></a>
                            </Button>
                          )}
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={() => setSelectedRestaurant(restaurant)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restaurant Detail Dialog */}
      <Dialog open={!!selectedRestaurant} onOpenChange={() => setSelectedRestaurant(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Restaurant Details</DialogTitle>
          </DialogHeader>
          {selectedRestaurant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedRestaurant.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cuisine</Label>
                  <p className="font-medium">{selectedRestaurant.cuisine_type || "Various"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">City</Label>
                  <p className="font-medium">{selectedRestaurant.city}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Rating</Label>
                  <p className="font-medium">{selectedRestaurant.rating?.toFixed(1) ?? "N/A"}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Address</Label>
                <p className="text-sm">{selectedRestaurant.address}</p>
              </div>

              {selectedRestaurant.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedRestaurant.description}</p>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setSelectedRestaurant(null)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
