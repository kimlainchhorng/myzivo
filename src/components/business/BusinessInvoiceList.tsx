/**
 * Business Invoice List
 * Display and download invoices for business accounts
 */

import { useState } from "react";
import {
  FileText,
  Download,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CORPORATE_COMPLIANCE } from "@/config/b2bTravelConfig";

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  bookingType: "flight" | "hotel" | "car" | "bundle";
  description: string;
  partnerName: string;
}

// Mock invoices
const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-0042",
    date: "2024-03-01",
    dueDate: "2024-03-15",
    amount: 2450.00,
    status: "paid",
    bookingType: "flight",
    description: "SFO → NYC (3 travelers)",
    partnerName: "United Airlines via ZIVO",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-0043",
    date: "2024-03-05",
    dueDate: "2024-03-19",
    amount: 890.00,
    status: "paid",
    bookingType: "hotel",
    description: "Marriott NYC - 3 nights",
    partnerName: "Marriott Hotels via ZIVO",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-0044",
    date: "2024-03-10",
    dueDate: "2024-03-24",
    amount: 1250.00,
    status: "pending",
    bookingType: "bundle",
    description: "LAX → CHI + Car Rental",
    partnerName: "Multiple providers via ZIVO",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-0041",
    date: "2024-02-15",
    dueDate: "2024-03-01",
    amount: 325.00,
    status: "overdue",
    bookingType: "car",
    description: "Hertz - LAX pickup (3 days)",
    partnerName: "Hertz via ZIVO",
  },
];

interface BusinessInvoiceListProps {
  accountId?: string;
}

export default function BusinessInvoiceList({ accountId }: BusinessInvoiceListProps) {
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  const handleDownload = (invoice: Invoice) => {
    toast.success(`Downloading ${invoice.invoiceNumber}...`);
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-500">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-500/10 text-red-500">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        );
    }
  };

  const getBookingIcon = (type: Invoice["bookingType"]) => {
    const colors = {
      flight: "bg-sky-500/10 text-sky-500",
      hotel: "bg-amber-500/10 text-amber-500",
      car: "bg-purple-500/10 text-purple-500",
      bundle: "bg-primary/10 text-primary",
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-emerald-500/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold text-emerald-500">${totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-amber-500">${totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-red-500">${totalOverdue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoices & Receipts
              </CardTitle>
              <CardDescription>
                {CORPORATE_COMPLIANCE.invoiceDisclaimer}
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoice items */}
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getBookingIcon(invoice.bookingType))}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{invoice.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {invoice.partnerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-bold">${invoice.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due {invoice.dueDate}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleDownload(invoice)}
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                </div>
              </div>
            ))}

            {filteredInvoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No invoices found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance note */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex items-start gap-3">
          <ExternalLink className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">
              {CORPORATE_COMPLIANCE.paymentNote} For questions about specific invoices, 
              please contact the issuing travel provider directly or reach out to our 
              <a href="mailto:support@hizivo.com" className="text-primary ml-1">support team</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
