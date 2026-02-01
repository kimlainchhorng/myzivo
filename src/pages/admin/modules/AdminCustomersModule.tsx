/**
 * Admin Customers Module
 * Customer directory from rides/eats requests
 */
import { useState, useMemo } from "react";
import { 
  UserCircle, Search, RefreshCw, Phone, Mail, Loader2,
  Car, UtensilsCrossed, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRideRequests } from "@/hooks/useRideRequests";
import { useFoodOrders } from "@/hooks/useEatsOrders";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  ridesCount: number;
  eatsCount: number;
  lastActivity: string;
}

export default function AdminCustomersModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: rideRequests, isLoading: ridesLoading, refetch: refetchRides } = useRideRequests("all");
  const { data: foodOrders, isLoading: eatsLoading, refetch: refetchEats } = useFoodOrders("all");

  const isLoading = ridesLoading || eatsLoading;

  const handleRefresh = () => {
    refetchRides();
    refetchEats();
  };

  // Build customer list from rides and eats
  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    // Add customers from ride requests
    rideRequests?.forEach(request => {
      const key = request.customer_email || request.customer_phone;
      const existing = customerMap.get(key);
      
      if (existing) {
        existing.ridesCount += 1;
        if (new Date(request.created_at) > new Date(existing.lastActivity)) {
          existing.lastActivity = request.created_at;
        }
      } else {
        customerMap.set(key, {
          id: key,
          name: request.customer_name,
          email: request.customer_email,
          phone: request.customer_phone,
          city: request.pickup_address.split(",").pop()?.trim() || "Unknown",
          ridesCount: 1,
          eatsCount: 0,
          lastActivity: request.created_at,
        });
      }
    });

    // Add customers from food orders (parse from special_instructions)
    foodOrders?.forEach(order => {
      try {
        const match = (order.special_instructions || "").match(/Customer Info: ({.*})/);
        if (match) {
          const info = JSON.parse(match[1]);
          if (info.customer_email || info.customer_phone) {
            const key = info.customer_email || info.customer_phone;
            const existing = customerMap.get(key);
            
            if (existing) {
              existing.eatsCount += 1;
              if (new Date(order.created_at) > new Date(existing.lastActivity)) {
                existing.lastActivity = order.created_at;
              }
            } else {
              customerMap.set(key, {
                id: key,
                name: info.customer_name || "Unknown",
                email: info.customer_email || "",
                phone: info.customer_phone || "",
                city: "Unknown",
                ridesCount: 0,
                eatsCount: 1,
                lastActivity: order.created_at,
              });
            }
          }
        }
      } catch {}
    });

    return Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }, [rideRequests, foodOrders]);

  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.city.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: customers.length,
    withRides: customers.filter(c => c.ridesCount > 0).length,
    withEats: customers.filter(c => c.eatsCount > 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-sky-500" />
            Customers
          </h1>
          <p className="text-muted-foreground">Customer directory from requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-primary">{stats.withRides}</p>
            <p className="text-xs text-muted-foreground">Ride Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-eats">{stats.withEats}</p>
            <p className="text-xs text-muted-foreground">Eats Customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, email, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No customers found</p>
              <p className="text-sm">Customers from ride and eats requests will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-3 font-medium">Customer</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Contact</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">City</th>
                    <th className="text-left p-3 font-medium">Activity</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Last Active</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <UserCircle className="w-4 h-4" />
                          </div>
                          <p className="font-medium">{customer.name}</p>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <p className="text-xs">{customer.phone}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{customer.email}</p>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3" />
                          {customer.city}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {customer.ridesCount > 0 && (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <Car className="w-3 h-3" /> {customer.ridesCount}
                            </Badge>
                          )}
                          {customer.eatsCount > 0 && (
                            <Badge variant="outline" className="text-[10px] gap-1 text-eats">
                              <UtensilsCrossed className="w-3 h-3" /> {customer.eatsCount}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">
                        {format(new Date(customer.lastActivity), "MMM d, h:mm a")}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                            <a href={`tel:${customer.phone}`}><Phone className="w-3 h-3" /></a>
                          </Button>
                          {customer.email && (
                            <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                              <a href={`mailto:${customer.email}`}><Mail className="w-3 h-3" /></a>
                            </Button>
                          )}
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
    </div>
  );
}
