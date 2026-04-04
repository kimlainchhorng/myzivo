import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownLeft, Plus, Send, CreditCard, DollarSign, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  type: "topup" | "transfer_out" | "transfer_in" | "purchase" | "refund";
  amount: number;
  description: string;
  time: string;
  status: "completed" | "pending";
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", type: "topup", amount: 50, description: "Wallet top-up via card", time: "Today, 2:30 PM", status: "completed" },
  { id: "2", type: "transfer_out", amount: -15, description: "Sent to @alexm", time: "Today, 1:00 PM", status: "completed" },
  { id: "3", type: "purchase", amount: -24.99, description: "Marketplace purchase", time: "Yesterday", status: "completed" },
  { id: "4", type: "transfer_in", amount: 10, description: "Received from @sarahk", time: "Yesterday", status: "completed" },
  { id: "5", type: "refund", amount: 12.50, description: "Order refund #4521", time: "2 days ago", status: "completed" },
  { id: "6", type: "topup", amount: 100, description: "Wallet top-up via Apple Pay", time: "3 days ago", status: "completed" },
];

const TOP_UP_AMOUNTS = [10, 25, 50, 100, 250];

export default function WalletDashboardPage() {
  const navigate = useNavigate();
  const [balance] = useState(132.51);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const typeIcon = (type: string) => {
    switch (type) {
      case "topup": return <Plus className="h-4 w-4 text-green-500" />;
      case "transfer_out": return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "transfer_in": return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case "purchase": return <CreditCard className="h-4 w-4 text-red-500" />;
      case "refund": return <DollarSign className="h-4 w-4 text-green-500" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-b from-primary/20 to-background p-4 pt-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Wallet</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-primary text-primary-foreground p-6 mb-4">
            <p className="text-sm opacity-80 mb-1">Available Balance</p>
            <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="secondary" className="rounded-full gap-1" onClick={() => { setShowTopUp(!showTopUp); setShowTransfer(false); }}>
                <Plus className="h-3 w-3" /> Top Up
              </Button>
              <Button size="sm" variant="secondary" className="rounded-full gap-1" onClick={() => { setShowTransfer(!showTransfer); setShowTopUp(false); }}>
                <Send className="h-3 w-3" /> Send
              </Button>
            </div>
          </Card>
        </motion.div>

        {showTopUp && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
            <Card className="p-4 mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Top Up Amount</h3>
              <div className="flex gap-2 flex-wrap mb-3">
                {TOP_UP_AMOUNTS.map((amt) => (
                  <Badge key={amt} variant={topUpAmount === String(amt) ? "default" : "outline"} className="cursor-pointer" onClick={() => setTopUpAmount(String(amt))}>
                    ${amt}
                  </Badge>
                ))}
              </div>
              <Input type="number" placeholder="Custom amount" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} className="mb-3" />
              <Button size="sm" className="w-full gap-1"><CreditCard className="h-3 w-3" /> Add Funds</Button>
            </Card>
          </motion.div>
        )}

        {showTransfer && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
            <Card className="p-4 mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Send Money</h3>
              <Input placeholder="@username" value={transferTo} onChange={(e) => setTransferTo(e.target.value)} className="mb-2" />
              <Input type="number" placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="mb-3" />
              <Button size="sm" className="w-full gap-1"><Send className="h-3 w-3" /> Send</Button>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 mb-4">
        {[
          { label: "This Month", value: "$75.49", icon: TrendingUp },
          { label: "Sent", value: "$15.00", icon: ArrowUpRight },
          { label: "Received", value: "$22.50", icon: ArrowDownLeft },
        ].map((stat, i) => (
          <Card key={stat.label} className="p-3 text-center">
            <stat.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-sm font-bold text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Transactions */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" /> Recent Transactions
          </h2>
        </div>
        <div className="space-y-2">
          {MOCK_TRANSACTIONS.map((tx, i) => (
            <motion.div key={tx.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {typeIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.time}</p>
                </div>
                <span className={`text-sm font-semibold ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {tx.amount >= 0 ? "+" : ""}{tx.amount.toFixed(2)}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
