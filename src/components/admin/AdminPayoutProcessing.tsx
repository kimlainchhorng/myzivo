import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  ArrowUpRight,
  Download,
  Zap,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

interface PendingPayout {
  id: string;
  recipientName: string;
  recipientType: "driver" | "restaurant";
  amount: number;
  pendingSince: string;
  tripsCount: number;
  payoutMethod: string;
  bankLast4?: string;
  status: "ready" | "needs_review" | "on_hold";
  holdReason?: string;
}

const mockPendingPayouts: PendingPayout[] = [
  {
    id: "1",
    recipientName: "Michael Chen",
    recipientType: "driver",
    amount: 1245.80,
    pendingSince: format(subDays(new Date(), 2), "yyyy-MM-dd"),
    tripsCount: 48,
    payoutMethod: "bank_transfer",
    bankLast4: "4521",
    status: "ready",
  },
  {
    id: "2",
    recipientName: "Sarah's Kitchen",
    recipientType: "restaurant",
    amount: 3890.50,
    pendingSince: format(subDays(new Date(), 3), "yyyy-MM-dd"),
    tripsCount: 156,
    payoutMethod: "bank_transfer",
    bankLast4: "8823",
    status: "ready",
  },
  {
    id: "3",
    recipientName: "James Rodriguez",
    recipientType: "driver",
    amount: 892.30,
    pendingSince: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    tripsCount: 32,
    payoutMethod: "instant",
    status: "needs_review",
    holdReason: "Large variance from weekly average",
  },
  {
    id: "4",
    recipientName: "Emily Davis",
    recipientType: "driver",
    amount: 1567.20,
    pendingSince: format(subDays(new Date(), 4), "yyyy-MM-dd"),
    tripsCount: 61,
    payoutMethod: "bank_transfer",
    bankLast4: "3345",
    status: "ready",
  },
  {
    id: "5",
    recipientName: "Pizza Palace",
    recipientType: "restaurant",
    amount: 2234.90,
    pendingSince: format(subDays(new Date(), 2), "yyyy-MM-dd"),
    tripsCount: 89,
    payoutMethod: "bank_transfer",
    bankLast4: "9912",
    status: "on_hold",
    holdReason: "Pending dispute resolution",
  },
  {
    id: "6",
    recipientName: "Robert Kim",
    recipientType: "driver",
    amount: 756.40,
    pendingSince: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    tripsCount: 28,
    payoutMethod: "instant",
    status: "ready",
  },
];

const statusConfig = {
  ready: { color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle, label: "Ready" },
  needs_review: { color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertTriangle, label: "Needs Review" },
  on_hold: { color: "text-red-500", bg: "bg-red-500/10", icon: Clock, label: "On Hold" },
};

const AdminPayoutProcessing = () => {
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredPayouts = mockPendingPayouts.filter(payout => {
    const matchesSearch = payout.recipientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
    const matchesType = typeFilter === "all" || payout.recipientType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const readyPayouts = filteredPayouts.filter(p => p.status === "ready");
  const totalReadyAmount = readyPayouts.reduce((sum, p) => sum + p.amount, 0);
  const selectedAmount = selectedPayouts.reduce((sum, id) => {
    const payout = mockPendingPayouts.find(p => p.id === id);
    return sum + (payout?.amount || 0);
  }, 0);

  const toggleSelection = (id: string) => {
    setSelectedPayouts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const selectAllReady = () => {
    const readyIds = readyPayouts.map(p => p.id);
    setSelectedPayouts(readyIds);
  };

  const handleProcessPayouts = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSelectedPayouts([]);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Payouts</p>
                <p className="text-xl font-bold">{mockPendingPayouts.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ready to Process</p>
                <p className="text-xl font-bold">${totalReadyAmount.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Drivers Pending</p>
                <p className="text-xl font-bold">{mockPendingPayouts.filter(p => p.recipientType === "driver").length}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Needs Review</p>
                <p className="text-xl font-bold text-amber-500">{mockPendingPayouts.filter(p => p.status === "needs_review").length}</p>
              </div>
              <div className="p-2 rounded-lg bg-violet-500/10">
                <AlertTriangle className="h-5 w-5 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Action Bar */}
      <AnimatePresence>
        {selectedPayouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20"
          >
            <div className="flex items-center gap-4">
              <Badge className="bg-primary/20 text-primary text-sm px-3 py-1">
                {selectedPayouts.length} selected
              </Badge>
              <span className="text-sm font-medium">
                Total: <span className="text-primary">${selectedAmount.toLocaleString()}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPayouts([])}>
                Clear
              </Button>
              <Button 
                size="sm" 
                onClick={handleProcessPayouts}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Zap className="h-4 w-4 animate-pulse" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Process Payouts
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Payout Processing Queue
              </CardTitle>
              <CardDescription>Review and process pending payouts</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAllReady} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Select All Ready
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="driver">Drivers</SelectItem>
                <SelectItem value="restaurant">Restaurants</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[450px] pr-2">
            <div className="space-y-3">
              {filteredPayouts.map((payout, index) => {
                const status = statusConfig[payout.status];
                const StatusIcon = status.icon;
                const isSelected = selectedPayouts.includes(payout.id);

                return (
                  <motion.div
                    key={payout.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer",
                      isSelected 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-border/50 bg-background/50 hover:bg-muted/30",
                      payout.status === "on_hold" && "opacity-60"
                    )}
                    onClick={() => payout.status === "ready" && toggleSelection(payout.id)}
                  >
                    <div className="flex items-center gap-4">
                      {payout.status === "ready" && (
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(payout.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}

                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium">
                          {payout.recipientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{payout.recipientName}</span>
                          <Badge variant="outline" className="text-[10px] h-5 capitalize">
                            {payout.recipientType}
                          </Badge>
                          <Badge className={cn("text-[10px] h-5 gap-1", status.bg, status.color, "border-transparent")}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Since {format(new Date(payout.pendingSince), "MMM dd")}
                          </span>
                          <span>{payout.tripsCount} trips</span>
                          <span className="capitalize">{payout.payoutMethod.replace("_", " ")}</span>
                          {payout.bankLast4 && <span>••••{payout.bankLast4}</span>}
                        </div>
                        {payout.holdReason && (
                          <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {payout.holdReason}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold">${payout.amount.toLocaleString()}</p>
                        {payout.status === "ready" && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 px-2 text-xs gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Process single
                            }}
                          >
                            <Zap className="h-3 w-3" />
                            Instant
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayoutProcessing;
