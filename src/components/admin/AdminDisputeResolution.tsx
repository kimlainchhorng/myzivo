import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Scale, Search, MoreVertical, Clock, DollarSign, FileText,
  CheckCircle2, XCircle, AlertTriangle, MessageSquare, RefreshCw
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Dispute {
  id: string;
  caseNumber: string;
  customerId: string;
  customerName: string;
  type: "chargeback" | "refund" | "complaint" | "fraud";
  amount: number;
  orderId: string;
  status: "open" | "investigating" | "resolved" | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  deadline: string;
  assignee?: string;
  description: string;
}

const mockDisputes: Dispute[] = [
  { id: "1", caseNumber: "DSP-2024-001", customerId: "c1", customerName: "John Smith", type: "chargeback", amount: 125.50, orderId: "ORD-12345", status: "open", priority: "critical", createdAt: "2024-01-15", deadline: "2024-01-22", description: "Customer claims they never received the order" },
  { id: "2", caseNumber: "DSP-2024-002", customerId: "c2", customerName: "Sarah Johnson", type: "refund", amount: 45.00, orderId: "ORD-12346", status: "investigating", priority: "medium", createdAt: "2024-01-14", deadline: "2024-01-21", assignee: "Mike Ross", description: "Requested refund for cancelled ride" },
  { id: "3", caseNumber: "DSP-2024-003", customerId: "c3", customerName: "Mike Brown", type: "complaint", amount: 0, orderId: "ORD-12347", status: "escalated", priority: "high", createdAt: "2024-01-14", deadline: "2024-01-18", assignee: "Sarah Chen", description: "Poor service quality complaint" },
  { id: "4", caseNumber: "DSP-2024-004", customerId: "c4", customerName: "Emma Wilson", type: "fraud", amount: 250.00, orderId: "ORD-12348", status: "investigating", priority: "critical", createdAt: "2024-01-13", deadline: "2024-01-17", assignee: "John Doe", description: "Suspected fraudulent transaction" },
  { id: "5", caseNumber: "DSP-2024-005", customerId: "c5", customerName: "David Lee", type: "refund", amount: 35.00, orderId: "ORD-12349", status: "resolved", priority: "low", createdAt: "2024-01-12", deadline: "2024-01-19", assignee: "Mike Ross", description: "Duplicate charge refund request" },
];

export default function AdminDisputeResolution() {
  const [searchQuery, setSearchQuery] = useState("");
  const [disputes] = useState<Dispute[]>(mockDisputes);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);

  const openDisputes = disputes.filter(d => d.status === "open").length;
  const investigating = disputes.filter(d => d.status === "investigating").length;
  const totalAmount = disputes.filter(d => d.status !== "resolved").reduce((sum, d) => sum + d.amount, 0);
  const criticalCases = disputes.filter(d => d.priority === "critical").length;

  const filteredDisputes = disputes.filter(d =>
    d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadge = (type: Dispute["type"]) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      chargeback: { icon: <DollarSign className="h-3 w-3" />, class: "bg-red-500/10 text-red-500" },
      refund: { icon: <RefreshCw className="h-3 w-3" />, class: "bg-blue-500/10 text-blue-500" },
      complaint: { icon: <MessageSquare className="h-3 w-3" />, class: "bg-amber-500/10 text-amber-500" },
      fraud: { icon: <AlertTriangle className="h-3 w-3" />, class: "bg-purple-500/10 text-purple-500" }
    };
    return (
      <Badge className={config[type].class}>
        {config[type].icon}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: Dispute["status"]) => {
    const config: Record<string, string> = {
      open: "bg-amber-500/10 text-amber-500",
      investigating: "bg-blue-500/10 text-blue-500",
      resolved: "bg-green-500/10 text-green-500",
      escalated: "bg-red-500/10 text-red-500"
    };
    return <Badge className={config[status]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: Dispute["priority"]) => {
    const config: Record<string, string> = {
      low: "bg-muted text-muted-foreground",
      medium: "bg-blue-500/10 text-blue-500",
      high: "bg-amber-500/10 text-amber-500",
      critical: "bg-red-500/10 text-red-500"
    };
    return <Badge variant="outline" className={config[priority]}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Dispute Resolution Center
          </h2>
          <p className="text-muted-foreground">Handle chargebacks, refunds, and customer complaints</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Cases</p>
                <p className="text-2xl font-bold">{openDisputes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Search className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Investigating</p>
                <p className="text-2xl font-bold">{investigating}</p>
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
                <p className="text-sm text-muted-foreground">Amount at Risk</p>
                <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Cases</p>
                <p className="text-2xl font-bold">{criticalCases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Cases</TabsTrigger>
            <TabsTrigger value="chargebacks">Chargebacks</TabsTrigger>
            <TabsTrigger value="refunds">Refunds</TabsTrigger>
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDisputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-mono text-sm">{dispute.caseNumber}</TableCell>
                      <TableCell className="font-medium">{dispute.customerName}</TableCell>
                      <TableCell>{getTypeBadge(dispute.type)}</TableCell>
                      <TableCell>${dispute.amount.toFixed(2)}</TableCell>
                      <TableCell>{getPriorityBadge(dispute.priority)}</TableCell>
                      <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(dispute.deadline).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {dispute.assignee || <span className="text-muted-foreground">Unassigned</span>}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedDispute(dispute); setIsResolutionOpen(true); }}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Resolve Case
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Claim
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
        </TabsContent>

        <TabsContent value="chargebacks">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Filter by chargebacks applied
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Filter by refund requests applied
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Filter by complaints applied
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resolution Dialog */}
      <Dialog open={isResolutionOpen} onOpenChange={setIsResolutionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Case {selectedDispute?.caseNumber}</DialogTitle>
            <DialogDescription>
              Provide resolution details for this dispute case
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resolution Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_refund">Full Refund</SelectItem>
                  <SelectItem value="partial_refund">Partial Refund</SelectItem>
                  <SelectItem value="credit">Account Credit</SelectItem>
                  <SelectItem value="rejected">Claim Rejected</SelectItem>
                  <SelectItem value="escalated">Escalate Further</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Refund Amount (if applicable)</Label>
              <Input type="number" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea placeholder="Provide details about the resolution..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolutionOpen(false)}>Cancel</Button>
            <Button>Resolve Case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
