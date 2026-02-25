import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Ban,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star,
  CreditCard,
  MapPin,
  Calendar,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
  tier: "standard" | "gold" | "platinum";
  totalSpent: number;
  totalRides: number;
  totalOrders: number;
  rating: number;
  joinedAt: string;
  lastActive: string;
  location: string;
}

const customers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 123-4567",
    status: "active",
    tier: "platinum",
    totalSpent: 4850,
    totalRides: 156,
    totalOrders: 89,
    rating: 4.95,
    joinedAt: "2022-03-15",
    lastActive: "2024-01-29",
    location: "Manhattan, NY",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+1 (555) 234-5678",
    status: "active",
    tier: "gold",
    totalSpent: 2340,
    totalRides: 78,
    totalOrders: 45,
    rating: 4.82,
    joinedAt: "2022-08-20",
    lastActive: "2024-01-28",
    location: "Brooklyn, NY",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.d@email.com",
    phone: "+1 (555) 345-6789",
    status: "active",
    tier: "standard",
    totalSpent: 890,
    totalRides: 32,
    totalOrders: 18,
    rating: 4.75,
    joinedAt: "2023-02-10",
    lastActive: "2024-01-27",
    location: "Queens, NY",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "j.wilson@email.com",
    phone: "+1 (555) 456-7890",
    status: "suspended",
    tier: "standard",
    totalSpent: 1250,
    totalRides: 45,
    totalOrders: 22,
    rating: 3.20,
    joinedAt: "2022-11-05",
    lastActive: "2024-01-15",
    location: "Bronx, NY",
  },
  {
    id: "5",
    name: "Lisa Park",
    email: "l.park@email.com",
    phone: "+1 (555) 567-8901",
    status: "inactive",
    tier: "gold",
    totalSpent: 1980,
    totalRides: 65,
    totalOrders: 38,
    rating: 4.88,
    joinedAt: "2022-05-22",
    lastActive: "2023-12-01",
    location: "Jersey City, NJ",
  },
];

const statusConfig = {
  active: { color: "text-green-500", bg: "bg-green-500/10", label: "Active" },
  inactive: { color: "text-slate-500", bg: "bg-slate-500/10", label: "Inactive" },
  suspended: { color: "text-red-500", bg: "bg-red-500/10", label: "Suspended" },
};

const tierConfig = {
  standard: { color: "text-slate-500", bg: "bg-slate-500/10" },
  gold: { color: "text-amber-500", bg: "bg-amber-500/10" },
  platinum: { color: "text-violet-500", bg: "bg-violet-500/10" },
};

const AdminCustomerDirectory = () => {
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === "active").length,
    platinum: customers.filter(c => c.tier === "platinum").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            Customer Directory
          </h2>
          <p className="text-muted-foreground mt-1">Browse and manage all customer accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10">
                <Star className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.platinum}</p>
                <p className="text-xs text-muted-foreground">Platinum Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <CreditCard className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(stats.totalRevenue / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers by name, email, or phone..." className="pl-10 bg-card/50" />
      </div>

      {/* Customer List */}
      <Card className="border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="divide-y divide-border/50">
              {customers.map((customer, index) => {
                const status = statusConfig[customer.status];
                const tier = tierConfig[customer.tier];

                return (
                  <div
                    key={customer.id}
                    className="p-4 hover:bg-muted/30 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border border-border/50">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback className="bg-muted">
                          {customer.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium">{customer.name}</span>
                          <Badge className={cn("text-[10px] h-4 capitalize", tier.bg, tier.color)}>
                            {customer.tier}
                          </Badge>
                          <Badge className={cn("text-[10px] h-4", status.bg, status.color)}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.location}
                          </span>
                        </div>
                      </div>

                      <div className="hidden lg:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">${customer.totalSpent.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">Spent</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{customer.totalRides}</p>
                          <p className="text-[10px] text-muted-foreground">Rides</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{customer.totalOrders}</p>
                          <p className="text-[10px] text-muted-foreground">Orders</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {customer.rating}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Rating</p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>View Activity</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Suspend Account</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomerDirectory;
