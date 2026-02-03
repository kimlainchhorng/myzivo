/**
 * Flight Refunds Admin Page
 * Manage refund requests, view fare rules, process refunds
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RefreshCcw,
  ArrowLeft,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Plane,
  FileText,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RefundRequest {
  id: string;
  booking_reference: string;
  origin: string;
  destination: string;
  departure_date: string;
  customer_id: string;
  total_amount: number;
  currency: string;
  refund_status: string | null;
  refund_reason: string | null;
  refund_requested_at: string | null;
  refund_amount: number | null;
  refund_processed_at: string | null;
  payment_status: string;
  ticketing_status: string;
  pnr: string | null;
  admin_notes: string | null;
  created_at: string;
  stripe_payment_intent_id: string | null;
}

const refundStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  requested: { label: 'Requested', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30', icon: <Clock className="w-3 h-3" /> },
  under_review: { label: 'Under Review', color: 'bg-blue-500/20 text-blue-600 border-blue-500/30', icon: <Search className="w-3 h-3" /> },
  approved: { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30', icon: <CheckCircle className="w-3 h-3" /> },
  denied: { label: 'Denied', color: 'bg-red-500/20 text-red-600 border-red-500/30', icon: <XCircle className="w-3 h-3" /> },
  refunded: { label: 'Refunded', color: 'bg-violet-500/20 text-violet-600 border-violet-500/30', icon: <DollarSign className="w-3 h-3" /> },
};

export default function FlightRefundsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAction, setRefundAction] = useState<'approve' | 'deny' | 'process'>('approve');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch refund requests
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['flight-refund-requests', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('flight_bookings')
        .select('*')
        .not('refund_status', 'is', null)
        .order('refund_requested_at', { ascending: false, nullsFirst: false });

      if (statusFilter !== 'all') {
        query = query.eq('refund_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as RefundRequest[];
    },
  });

  // Fetch all bookings that might need refund (failed ticketing, etc.)
  const { data: autoRefundCandidates = [] } = useQuery({
    queryKey: ['flight-auto-refund-candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flight_bookings')
        .select('*')
        .eq('payment_status', 'paid')
        .eq('ticketing_status', 'failed')
        .is('refund_status', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as RefundRequest[];
    },
  });

  // Process refund mutation
  const processRefund = useMutation({
    mutationFn: async ({ bookingId, action, notes }: { bookingId: string; action: string; notes: string }) => {
      if (action === 'deny') {
        // Just update status to denied
        const { error } = await supabase
          .from('flight_bookings')
          .update({
            refund_status: 'denied',
            admin_notes: notes,
          })
          .eq('id', bookingId);

        if (error) throw error;
        return { success: true, message: 'Refund denied' };
      }

      if (action === 'approve') {
        // Mark as approved (awaiting processing)
        const { error } = await supabase
          .from('flight_bookings')
          .update({
            refund_status: 'approved',
            admin_notes: notes,
          })
          .eq('id', bookingId);

        if (error) throw error;
        return { success: true, message: 'Refund approved' };
      }

      // Process the actual refund
      const { data, error } = await supabase.functions.invoke('process-flight-refund', {
        body: {
          bookingId,
          reason: notes || 'Admin processed refund',
          action: 'process',
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Refund Processed',
        description: data.message || 'Refund action completed successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['flight-refund-requests'] });
      queryClient.invalidateQueries({ queryKey: ['flight-auto-refund-candidates'] });
      setProcessDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Refund Error',
        description: error.message || 'Failed to process refund.',
        variant: 'destructive',
      });
    },
  });

  // Filter requests by search
  const filteredRequests = requests.filter((req) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.booking_reference?.toLowerCase().includes(query) ||
      req.pnr?.toLowerCase().includes(query) ||
      req.origin?.toLowerCase().includes(query) ||
      req.destination?.toLowerCase().includes(query)
    );
  });

  const handleProcessClick = (request: RefundRequest, action: 'approve' | 'deny' | 'process') => {
    setSelectedRequest(request);
    setRefundAction(action);
    setAdminNotes(request.admin_notes || '');
    setProcessDialogOpen(true);
  };

  const handleConfirmProcess = () => {
    if (!selectedRequest) return;
    processRefund.mutate({
      bookingId: selectedRequest.id,
      action: refundAction,
      notes: adminNotes,
    });
  };

  // Stats
  const stats = {
    pending: requests.filter((r) => r.refund_status === 'requested').length,
    underReview: requests.filter((r) => r.refund_status === 'under_review').length,
    approved: requests.filter((r) => r.refund_status === 'approved').length,
    refunded: requests.filter((r) => r.refund_status === 'refunded').length,
    totalRefunded: requests
      .filter((r) => r.refund_status === 'refunded')
      .reduce((sum, r) => sum + (r.refund_amount || r.total_amount || 0), 0),
    autoRefundNeeded: autoRefundCandidates.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Flight Refunds – Admin" description="Manage flight refund requests" />
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/admin/flights">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Flight Refunds</h1>
                <p className="text-muted-foreground">Manage refund requests and process refunds</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()} className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Under Review</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.underReview}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Approved</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.approved}</p>
              </CardContent>
            </Card>
            <Card className="border-violet-500/30 bg-violet-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-muted-foreground">Total Refunded</span>
                </div>
                <p className="text-2xl font-bold mt-1">${stats.totalRefunded.toFixed(0)}</p>
              </CardContent>
            </Card>
            {stats.autoRefundNeeded > 0 && (
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Need Auto-Refund</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.autoRefundNeeded}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Tabs defaultValue="requests" className="space-y-6">
            <TabsList>
              <TabsTrigger value="requests">Refund Requests</TabsTrigger>
              <TabsTrigger value="auto-refund" className="relative">
                Auto-Refund Queue
                {stats.autoRefundNeeded > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.autoRefundNeeded}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by booking ref, PNR, or route..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Requests Table */}
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredRequests.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      No refund requests found
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request) => {
                          const statusConfig = refundStatusConfig[request.refund_status || 'requested'];
                          return (
                            <TableRow key={request.id}>
                              <TableCell>
                                <div>
                                  <p className="font-mono font-medium">{request.booking_reference}</p>
                                  {request.pnr && (
                                    <p className="text-xs text-muted-foreground">PNR: {request.pnr}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span>{request.origin}</span>
                                  <Plane className="w-3 h-3 text-muted-foreground" />
                                  <span>{request.destination}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {request.departure_date ? format(parseISO(request.departure_date), 'MMM d, yyyy') : '-'}
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">${request.total_amount?.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{request.currency}</p>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("gap-1", statusConfig?.color)}>
                                  {statusConfig?.icon}
                                  {statusConfig?.label || request.refund_status}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                <p className="text-sm truncate">{request.refund_reason || '-'}</p>
                              </TableCell>
                              <TableCell>
                                {request.refund_requested_at ? (
                                  <p className="text-sm">
                                    {format(parseISO(request.refund_requested_at), 'MMM d, HH:mm')}
                                  </p>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {request.refund_status === 'requested' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleProcessClick(request, 'approve')}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600"
                                        onClick={() => handleProcessClick(request, 'deny')}
                                      >
                                        Deny
                                      </Button>
                                    </>
                                  )}
                                  {request.refund_status === 'approved' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleProcessClick(request, 'process')}
                                      className="gap-1"
                                    >
                                      <DollarSign className="w-3 h-3" />
                                      Process Refund
                                    </Button>
                                  )}
                                  {request.refund_status === 'refunded' && (
                                    <span className="text-sm text-emerald-600">
                                      ${request.refund_amount?.toFixed(2)} refunded
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auto-refund" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Failed Bookings Awaiting Refund
                  </CardTitle>
                  <CardDescription>
                    These bookings have paid but ticketing failed. They need to be refunded.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {autoRefundCandidates.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                      <p>No pending auto-refunds</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {autoRefundCandidates.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <p className="font-mono font-medium">{booking.booking_reference}</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span>{booking.origin}</span>
                                <Plane className="w-3 h-3 text-muted-foreground" />
                                <span>{booking.destination}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">${booking.total_amount?.toFixed(2)}</p>
                            </TableCell>
                            <TableCell>
                              {format(parseISO(booking.created_at), 'MMM d, HH:mm')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleProcessClick(booking, 'process')}
                                className="gap-1"
                              >
                                <RefreshCcw className="w-3 h-3" />
                                Process Refund
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Process Refund Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {refundAction === 'approve' && 'Approve Refund Request'}
              {refundAction === 'deny' && 'Deny Refund Request'}
              {refundAction === 'process' && 'Process Refund'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Booking: {selectedRequest.booking_reference} | 
                  Amount: ${selectedRequest.total_amount?.toFixed(2)} {selectedRequest.currency}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Add notes about this refund decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>

            {refundAction === 'process' && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-300">
                      This will process an immediate Stripe refund
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The full amount of ${selectedRequest?.total_amount?.toFixed(2)} will be refunded to the customer's payment method.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={refundAction === 'deny' ? 'destructive' : 'default'}
              onClick={handleConfirmProcess}
              disabled={processRefund.isPending}
            >
              {processRefund.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {refundAction === 'approve' && 'Approve'}
                  {refundAction === 'deny' && 'Deny'}
                  {refundAction === 'process' && 'Process Refund'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}