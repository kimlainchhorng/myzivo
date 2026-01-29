import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Car, Store, Building2, Plane, UserPlus, 
  Search, Filter, MoreVertical, Eye, Mail, Phone,
  CheckCircle, XCircle, Clock, Shield, Ban, UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockCustomers = [
  { id: "C001", name: "John Smith", email: "john@example.com", phone: "+1 234 567 8901", status: "active", totalRides: 45, totalSpent: 1245.00, joined: "2024-01-15" },
  { id: "C002", name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 234 567 8902", status: "active", totalRides: 128, totalSpent: 3450.00, joined: "2023-08-20" },
  { id: "C003", name: "Mike Wilson", email: "mike@example.com", phone: "+1 234 567 8903", status: "suspended", totalRides: 12, totalSpent: 280.00, joined: "2024-06-01" },
];

const mockDrivers = [
  { id: "D001", name: "Alex Driver", email: "alex@driver.com", phone: "+1 345 678 9012", status: "verified", rating: 4.9, trips: 567, earnings: 12450.00 },
  { id: "D002", name: "Lisa Transport", email: "lisa@driver.com", phone: "+1 345 678 9013", status: "pending", rating: 0, trips: 0, earnings: 0 },
];

const mockPartners = [
  { id: "P001", name: "Pizza Palace", type: "restaurant", status: "active", orders: 2345, revenue: 45670.00 },
  { id: "P002", name: "City Cars", type: "car_rental", status: "active", bookings: 189, revenue: 28450.00 },
  { id: "P003", name: "Grand Hotel", type: "hotel", status: "pending", bookings: 0, revenue: 0 },
];

const accountStats = {
  totalCustomers: 15847,
  activeDrivers: 423,
  partners: 156,
  pendingApprovals: 34,
  suspendedAccounts: 12,
  newThisWeek: 245,
};

export default function AdminAccountsManagement() {
  const [activeTab, setActiveTab] = useState("customers");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      verified: "bg-green-500/10 text-green-500 border-green-500/20",
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      suspended: "bg-red-500/10 text-red-500 border-red-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10">
            <Users className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Accounts Management</h1>
            <p className="text-muted-foreground">Manage all user accounts across the platform</p>
          </div>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        {[
          { label: "Total Customers", value: accountStats.totalCustomers.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Drivers", value: accountStats.activeDrivers, icon: Car, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Partners", value: accountStats.partners, icon: Store, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Pending Approval", value: accountStats.pendingApprovals, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Suspended", value: accountStats.suspendedAccounts, icon: Ban, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "New This Week", value: accountStats.newThisWeek, icon: UserPlus, color: "text-cyan-500", bg: "bg-cyan-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="customers" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2">
            <Car className="h-4 w-4" />
            Drivers
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="gap-2">
            <Store className="h-4 w-4" />
            Restaurants
          </TabsTrigger>
          <TabsTrigger value="car-rentals" className="gap-2">
            <Car className="h-4 w-4" />
            Car Rentals
          </TabsTrigger>
          <TabsTrigger value="hotels" className="gap-2">
            <Building2 className="h-4 w-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="flights" className="gap-2">
            <Plane className="h-4 w-4" />
            Airlines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-6">
          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Customers List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Customer Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCustomers.map((customer, i) => (
                  <div 
                    key={customer.id}
                    className="p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-all animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-teal-500/20">
                            {customer.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{customer.name}</p>
                            <Badge variant="outline" className={cn("text-[10px]", getStatusBadge(customer.status))}>
                              {customer.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          </div>
                        </div>
                        <div className="h-12 w-px bg-border mx-4" />
                        <div className="text-center">
                          <p className="font-bold">{customer.totalRides}</p>
                          <p className="text-xs text-muted-foreground">Rides</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">${customer.totalSpent.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">Spent</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2">
                              <UserCog className="h-4 w-4" />
                              Edit Account
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Mail className="h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-red-500">
                              <Ban className="h-4 w-4" />
                              Suspend Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-emerald-500" />
                Driver Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDrivers.map((driver, i) => (
                  <div 
                    key={driver.id}
                    className="p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-all animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                            {driver.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{driver.name}</p>
                            <Badge variant="outline" className={cn("text-[10px]", getStatusBadge(driver.status))}>
                              {driver.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{driver.email}</p>
                        </div>
                        <div className="h-12 w-px bg-border mx-4" />
                        <div className="text-center">
                          <p className="font-bold">{driver.rating > 0 ? driver.rating : "-"}</p>
                          <p className="text-xs text-muted-foreground">Rating</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{driver.trips}</p>
                          <p className="text-xs text-muted-foreground">Trips</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">${driver.earnings.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">Earnings</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {["restaurants", "car-rentals", "hotels", "flights"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")} partner accounts</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
