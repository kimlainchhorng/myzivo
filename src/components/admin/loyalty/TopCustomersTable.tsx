/**
 * TOP CUSTOMERS TABLE
 * Admin component to view top customers by points and adjust points
 */

import { useState } from "react";
import {
  Crown,
  Trophy,
  Medal,
  Loader2,
  Plus,
  Minus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTopCustomers } from "@/hooks/useLoyalty";
import { cn } from "@/lib/utils";

interface TopCustomersTableProps {
  onAdjustPoints: (userId: string) => void;
}

const TIER_ICONS: Record<string, React.ReactNode> = {
  elite: <Crown className="w-4 h-4 text-amber-500" />,
  traveler: <Trophy className="w-4 h-4 text-sky-500" />,
  explorer: <Medal className="w-4 h-4 text-slate-500" />,
};

const TIER_COLORS: Record<string, string> = {
  elite: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  traveler: "bg-sky-500/10 text-sky-500 border-sky-500/30",
  explorer: "bg-slate-500/10 text-slate-500 border-slate-500/30",
};

export default function TopCustomersTable({ onAdjustPoints }: TopCustomersTableProps) {
  const { data: customers = [], isLoading } = useTopCustomers(50);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Top Customers by Points</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {searchTerm ? "No customers found" : "No loyalty members yet"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Lifetime</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow key={customer.userId}>
                    <TableCell className="font-medium">
                      {index < 3 ? (
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            index === 0 && "bg-amber-500 text-white",
                            index === 1 && "bg-slate-400 text-white",
                            index === 2 && "bg-amber-700 text-white"
                          )}
                        >
                          {index + 1}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">{index + 1}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", TIER_COLORS[customer.tier])}
                      >
                        {TIER_ICONS[customer.tier]}
                        <span className="ml-1">{customer.tier}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {customer.currentBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {customer.lifetimePoints.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {customer.totalOrders}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAdjustPoints(customer.userId)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        <Minus className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
