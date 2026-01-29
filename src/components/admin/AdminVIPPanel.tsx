import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Crown, Star, DollarSign, Search, MoreVertical, Phone, Mail,
  Gift, Heart, TrendingUp, Calendar, MessageSquare, Award, Sparkles
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VIPCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  tier: "gold" | "platinum" | "diamond";
  totalSpent: number;
  totalTrips: number;
  memberSince: string;
  lastActivity: string;
  ltv: number;
  satisfactionScore: number;
  dedicatedAgent?: string;
}

const mockVIPCustomers: VIPCustomer[] = [
  { id: "1", name: "Alexandra Chen", email: "alex.chen@example.com", phone: "+1 555-0123", tier: "diamond", totalSpent: 25600, totalTrips: 342, memberSince: "2021-03-15", lastActivity: "2024-01-15", ltv: 45000, satisfactionScore: 98, dedicatedAgent: "Michael Ross" },
  { id: "2", name: "James Morrison", email: "j.morrison@example.com", phone: "+1 555-0456", tier: "platinum", totalSpent: 12800, totalTrips: 189, memberSince: "2022-01-20", lastActivity: "2024-01-14", ltv: 28000, satisfactionScore: 95, dedicatedAgent: "Sarah Chen" },
  { id: "3", name: "Victoria Blake", email: "v.blake@example.com", phone: "+1 555-0789", tier: "diamond", totalSpent: 31200, totalTrips: 428, memberSince: "2020-08-10", lastActivity: "2024-01-15", ltv: 52000, satisfactionScore: 99, dedicatedAgent: "Michael Ross" },
  { id: "4", name: "Robert Chen", email: "r.chen@example.com", phone: "+1 555-0321", tier: "gold", totalSpent: 5600, totalTrips: 78, memberSince: "2023-04-12", lastActivity: "2024-01-13", ltv: 12000, satisfactionScore: 92 },
  { id: "5", name: "Emily Watson", email: "e.watson@example.com", phone: "+1 555-0654", tier: "platinum", totalSpent: 9800, totalTrips: 156, memberSince: "2022-06-30", lastActivity: "2024-01-12", ltv: 22000, satisfactionScore: 94 },
];

export default function AdminVIPPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers] = useState<VIPCustomer[]>(mockVIPCustomers);

  const totalVIPs = 156;
  const diamondMembers = 28;
  const vipRevenue = 2850000;
  const avgSatisfaction = 96.5;

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTierBadge = (tier: VIPCustomer["tier"]) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      gold: { icon: <Star className="h-3 w-3" />, class: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
      platinum: { icon: <Award className="h-3 w-3" />, class: "bg-slate-400/10 text-slate-400 border-slate-400/30" },
      diamond: { icon: <Sparkles className="h-3 w-3" />, class: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30" }
    };
    return (
      <Badge variant="outline" className={config[tier].class}>
        {config[tier].icon}
        <span className="ml-1 capitalize">{tier}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            VIP Customer Panel
          </h2>
          <p className="text-muted-foreground">Manage high-value customers with priority support</p>
        </div>
        <Button>
          <Crown className="h-4 w-4 mr-2" />
          Upgrade Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Crown className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total VIPs</p>
                <p className="text-2xl font-bold">{totalVIPs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Sparkles className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diamond Members</p>
                <p className="text-2xl font-bold">{diamondMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">VIP Revenue</p>
                <p className="text-2xl font-bold">${(vipRevenue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Satisfaction</p>
                <p className="text-2xl font-bold">{avgSatisfaction}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VIP Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>VIP Customers</CardTitle>
              <CardDescription>High-value customers requiring dedicated support</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search VIPs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>LTV</TableHead>
                <TableHead>Satisfaction</TableHead>
                <TableHead>Dedicated Agent</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={customer.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {customer.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTierBadge(customer.tier)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">${customer.totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{customer.totalTrips} trips</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-green-500 font-medium">
                    ${customer.ltv.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${customer.satisfactionScore >= 95 ? "bg-green-500" : customer.satisfactionScore >= 85 ? "bg-amber-500" : "bg-red-500"}`} />
                      {customer.satisfactionScore}%
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.dedicatedAgent ? (
                      <Badge variant="outline">{customer.dedicatedAgent}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Call Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Start Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Gift className="h-4 w-4 mr-2" />
                          Send Gift
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Call
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
