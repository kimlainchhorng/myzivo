/**
 * Flight Email Logs - Admin View
 * View email delivery status for all flight bookings
 */

import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Search,
  RefreshCw,
  Loader2,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EmailStatus = "sent" | "failed" | "pending";
type EmailType = "booking_confirmation" | "payment_receipt" | "booking_failed" | "schedule_change" | "refund_requested" | "refund_approved" | "refund_completed";

const EMAIL_TYPE_LABELS: Record<EmailType, { label: string; color: string }> = {
  booking_confirmation: { label: "Booking Confirmation", color: "bg-emerald-500/10 text-emerald-600" },
  payment_receipt: { label: "Payment Receipt", color: "bg-blue-500/10 text-blue-600" },
  booking_failed: { label: "Booking Failed", color: "bg-red-500/10 text-red-600" },
  schedule_change: { label: "Schedule Change", color: "bg-amber-500/10 text-amber-600" },
  refund_requested: { label: "Refund Requested", color: "bg-violet-500/10 text-violet-600" },
  refund_approved: { label: "Refund Approved", color: "bg-teal-500/10 text-teal-600" },
  refund_completed: { label: "Refund Completed", color: "bg-green-500/10 text-green-600" },
};

const STATUS_CONFIG: Record<EmailStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  sent: { icon: CheckCircle, color: "text-emerald-500", label: "Sent" },
  failed: { icon: XCircle, color: "text-red-500", label: "Failed" },
  pending: { icon: Clock, color: "text-amber-500", label: "Pending" },
};

const FlightEmailLogsPage = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: emailLogs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["flight-email-logs", typeFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("flight_email_logs")
        .select(`
          *,
          flight_bookings (
            booking_reference,
            origin,
            destination
          )
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      if (typeFilter !== "all") {
        query = query.eq("email_type", typeFilter);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Redirect non-admins
  if (!authLoading && !isAdmin) {
    return <Navigate to="/flights" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Filter by search
  const filteredLogs = emailLogs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.recipient_email?.toLowerCase().includes(query) ||
      log.subject?.toLowerCase().includes(query) ||
      log.flight_bookings?.booking_reference?.toLowerCase().includes(query) ||
      log.resend_id?.toLowerCase().includes(query)
    );
  });

  // Stats
  const stats = {
    total: emailLogs.length,
    sent: emailLogs.filter((l) => l.status === "sent").length,
    failed: emailLogs.filter((l) => l.status === "failed").length,
    pending: emailLogs.filter((l) => l.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Flight Email Logs | Admin" 
        description="View email delivery status for flight bookings." 
      />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 gap-2">
              <Link to="/admin/flights/status">
                <ArrowLeft className="w-4 h-4" />
                Back to Flights Status
              </Link>
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <Mail className="w-6 h-6 text-primary" />
                  Flight Email Logs
                </h1>
                <p className="text-muted-foreground">Track email delivery for all flight notifications</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => refetch()} 
                disabled={isFetching}
                className="gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Emails</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Mail className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sent</p>
                    <p className="text-2xl font-bold text-emerald-500">{stats.sent}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email, booking ref, subject..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Email Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(EMAIL_TYPE_LABELS).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>
                Showing {filteredLogs.length} of {stats.total} emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  No email logs found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Booking</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Resend ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => {
                        const status = log.status as EmailStatus;
                        const StatusIcon = STATUS_CONFIG[status]?.icon || Clock;
                        const statusColor = STATUS_CONFIG[status]?.color || "text-muted-foreground";
                        const typeConfig = EMAIL_TYPE_LABELS[log.email_type as EmailType];

                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <StatusIcon className={cn("w-4 h-4", statusColor)} />
                                <span className="text-sm capitalize">{status}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", typeConfig?.color)}
                              >
                                {typeConfig?.label || log.email_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {log.recipient_email}
                            </TableCell>
                            <TableCell>
                              {log.flight_bookings ? (
                                <div>
                                  <Link 
                                    to={`/admin/flights/booking/${log.booking_id}`}
                                    className="text-primary hover:underline font-medium"
                                  >
                                    {log.flight_bookings.booking_reference}
                                  </Link>
                                  <p className="text-xs text-muted-foreground">
                                    {log.flight_bookings.origin} → {log.flight_bookings.destination}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={log.subject}>
                              {log.subject}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {log.sent_at 
                                ? format(new Date(log.sent_at), "MMM d, HH:mm")
                                : "—"}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {log.resend_id ? (
                                <span title={log.resend_id}>
                                  {log.resend_id.slice(0, 12)}...
                                </span>
                              ) : log.error_message ? (
                                <span className="text-red-500" title={log.error_message}>
                                  Error
                                </span>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightEmailLogsPage;
