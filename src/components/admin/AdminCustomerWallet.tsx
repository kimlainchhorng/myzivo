import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Wallet, CreditCard, Gift, Plus, Minus, RefreshCw, Search,
  ArrowUpRight, ArrowDownLeft, Clock, DollarSign
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WalletTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: "credit" | "debit" | "refund" | "gift_card";
  amount: number;
  balance: number;
  description: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

const mockTransactions: WalletTransaction[] = [
  { id: "1", customerId: "c1", customerName: "John Smith", type: "credit", amount: 50.00, balance: 150.00, description: "Promotional credit", status: "completed", createdAt: "2024-01-15T10:30:00Z" },
  { id: "2", customerId: "c2", customerName: "Sarah Johnson", type: "refund", amount: 25.50, balance: 75.50, description: "Ride cancellation refund", status: "completed", createdAt: "2024-01-15T09:15:00Z" },
  { id: "3", customerId: "c3", customerName: "Mike Brown", type: "debit", amount: 30.00, balance: 20.00, description: "Wallet payment for order", status: "completed", createdAt: "2024-01-14T18:45:00Z" },
  { id: "4", customerId: "c4", customerName: "Emma Wilson", type: "gift_card", amount: 100.00, balance: 100.00, description: "Gift card redemption", status: "pending", createdAt: "2024-01-14T14:20:00Z" },
  { id: "5", customerId: "c5", customerName: "David Lee", type: "credit", amount: 15.00, balance: 65.00, description: "Referral bonus", status: "completed", createdAt: "2024-01-14T11:00:00Z" },
];

export default function AdminCustomerWallet() {
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions] = useState<WalletTransaction[]>(mockTransactions);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "deduct">("add");

  const totalWalletBalance = 12500.00;
  const totalCreditsIssued = 8500.00;
  const pendingRefunds = 450.00;
  const activeGiftCards = 32;

  const filteredTransactions = transactions.filter(t =>
    t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: WalletTransaction["type"]) => {
    switch (type) {
      case "credit": return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case "debit": return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "refund": return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case "gift_card": return <Gift className="h-4 w-4 text-purple-500" />;
    }
  };

  const getTypeBadge = (type: WalletTransaction["type"]) => {
    const variants: Record<string, string> = {
      credit: "bg-green-500/10 text-green-500",
      debit: "bg-red-500/10 text-red-500",
      refund: "bg-blue-500/10 text-blue-500",
      gift_card: "bg-purple-500/10 text-purple-500"
    };
    return <Badge className={variants[type]}>{type.replace("_", " ")}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Customer Wallet & Credits
          </h2>
          <p className="text-muted-foreground">Manage customer balances, credits, refunds, and gift cards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setAdjustmentType("deduct"); setIsAdjustOpen(true); }}>
            <Minus className="h-4 w-4 mr-2" />
            Deduct Credits
          </Button>
          <Button onClick={() => { setAdjustmentType("add"); setIsAdjustOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Credits
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-teal-500/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">${totalWalletBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CreditCard className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Issued</p>
                <p className="text-2xl font-bold">${totalCreditsIssued.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Pending Refunds</p>
                <p className="text-2xl font-bold">${pendingRefunds.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Gift className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Gift Cards</p>
                <p className="text-2xl font-bold">{activeGiftCards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
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
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.customerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(tx.type)}
                      {getTypeBadge(tx.type)}
                    </div>
                  </TableCell>
                  <TableCell className={tx.type === "debit" ? "text-red-500" : "text-green-500"}>
                    {tx.type === "debit" ? "-" : "+"}${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>${tx.balance.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === "completed" ? "default" : tx.status === "pending" ? "secondary" : "destructive"}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{adjustmentType === "add" ? "Add Credits" : "Deduct Credits"}</DialogTitle>
            <DialogDescription>
              {adjustmentType === "add" 
                ? "Add promotional credits or refunds to a customer's wallet"
                : "Deduct credits from a customer's wallet balance"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="c1">John Smith</SelectItem>
                  <SelectItem value="c2">Sarah Johnson</SelectItem>
                  <SelectItem value="c3">Mike Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="number" placeholder="0.00" className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promo">Promotional Credit</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="referral">Referral Bonus</SelectItem>
                  <SelectItem value="compensation">Customer Compensation</SelectItem>
                  <SelectItem value="adjustment">Manual Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Add any additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustOpen(false)}>Cancel</Button>
            <Button variant={adjustmentType === "add" ? "default" : "destructive"}>
              {adjustmentType === "add" ? "Add Credits" : "Deduct Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
