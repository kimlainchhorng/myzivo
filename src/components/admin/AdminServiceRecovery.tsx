import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Heart, Search, Gift, RefreshCw, DollarSign, 
  CheckCircle2, Clock, User, MoreVertical
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

const recoveryCases = [
  { id: "REC-001", customer: "John Smith", issue: "Late delivery", compensation: "Free delivery credit", amount: 5.00, status: "completed", recoveredAt: "2 hours ago" },
  { id: "REC-002", customer: "Sarah Johnson", issue: "Wrong order", compensation: "Full refund + credit", amount: 35.00, status: "completed", recoveredAt: "5 hours ago" },
  { id: "REC-003", customer: "Mike Brown", issue: "Driver cancellation", compensation: "Discount code", amount: 10.00, status: "pending", recoveredAt: null },
  { id: "REC-004", customer: "Emma Wilson", issue: "Poor service", compensation: "Loyalty points", amount: 15.00, status: "completed", recoveredAt: "1 day ago" },
  { id: "REC-005", customer: "David Lee", issue: "App crash", compensation: "Free ride", amount: 20.00, status: "pending", recoveredAt: null },
];

const recoveryMetrics = [
  { type: "Free Delivery", count: 245, totalValue: 1225 },
  { type: "Discount Codes", count: 189, totalValue: 1890 },
  { type: "Full Refunds", count: 45, totalValue: 2250 },
  { type: "Loyalty Points", count: 320, totalValue: 1600 },
  { type: "Free Rides", count: 78, totalValue: 1560 },
];

export default function AdminServiceRecovery() {
  const [searchQuery, setSearchQuery] = useState("");

  const totalRecoveries = 877;
  const totalValue = 8525;
  const recoveryRate = 92;
  const retentionAfterRecovery = 85;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      pending: { icon: <Clock className="h-3 w-3" />, class: "bg-amber-500/10 text-amber-500" },
      completed: { icon: <CheckCircle2 className="h-3 w-3" />, class: "bg-green-500/10 text-green-500" }
    };
    return (
      <Badge className={config[status].class}>
        {config[status].icon}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            Service Recovery
          </h2>
          <p className="text-muted-foreground">Manage compensation and customer retention</p>
        </div>
        <Button>
          <Gift className="h-4 w-4 mr-2" />
          Issue Compensation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recoveries</p>
                <p className="text-2xl font-bold">{totalRecoveries}</p>
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
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <RefreshCw className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recovery Rate</p>
                <p className="text-2xl font-bold">{recoveryRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retention After</p>
                <p className="text-2xl font-bold">{retentionAfterRecovery}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Recovery Cases</CardTitle>
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Compensation</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recoveryCases.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.customer}</TableCell>
                    <TableCell>{rec.issue}</TableCell>
                    <TableCell>{rec.compensation}</TableCell>
                    <TableCell>${rec.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(rec.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                          <DropdownMenuItem>Add Compensation</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compensation Types</CardTitle>
            <CardDescription>Breakdown by recovery method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recoveryMetrics.map((metric) => (
              <div key={metric.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">{metric.type}</p>
                  <p className="text-sm text-muted-foreground">{metric.count} issued</p>
                </div>
                <Badge variant="outline" className="text-green-500">
                  ${metric.totalValue.toLocaleString()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
