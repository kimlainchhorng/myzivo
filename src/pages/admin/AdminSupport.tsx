/**
 * Admin Support Tickets Panel
 * 
 * View and manage customer support tickets with proper routing
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Headphones, Search, Filter, ExternalLink, Clock, User,
  CheckCircle, XCircle, AlertCircle, MessageSquare, RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface SupportTicket {
  id: string;
  ticket_number: string | null;
  category: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  search_session_id?: string | null;
  booking_ref?: string | null;
  partner_name?: string | null;
  assigned_to?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  auto_reply_sent: boolean | null;
  created_at: string;
  updated_at: string;
  // Fields from DB schema
  user_id?: string | null;
  driver_id?: string | null;
}

export default function AdminSupport() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Fetch tickets
  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ['support-tickets', statusFilter, categoryFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      if (searchQuery) {
        query = query.or(`customer_email.ilike.%${searchQuery}%,ticket_number.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SupportTicket[];
    },
  });

  // Update ticket mutation
  const updateTicket = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SupportTicket> }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('Ticket updated');
      setSelectedTicket(null);
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const handleResolve = () => {
    if (!selectedTicket) return;
    
    updateTicket.mutate({
      id: selectedTicket.id,
      updates: {
        status: 'resolved',
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500/10 text-blue-500"><AlertCircle className="w-3 h-3 mr-1" /> Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-500/10 text-amber-500"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-emerald-500/10 text-emerald-500"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>;
      case 'closed':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" /> Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'normal':
        return <Badge variant="outline">Normal</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      booking: 'Booking Issue',
      website: 'Website Issue',
      account: 'Account',
      refund: 'Refund Request',
      general: 'General Inquiry',
    };
    return labels[category] || category;
  };

  const isBookingRelated = (category: string) => {
    return ['booking', 'refund'].includes(category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Headphones className="w-6 h-6 text-primary" />
            Support Tickets
          </h1>
          <p className="text-muted-foreground">
            Manage customer support requests and route appropriately
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, ticket #, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="booking">Booking Issue</SelectItem>
                <SelectItem value="website">Website Issue</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="refund">Refund Request</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading tickets...
            </div>
          ) : !tickets?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No tickets found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">
                      {ticket.ticket_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[150px]">{ticket.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                        {isBookingRelated(ticket.category) && (
                          <Badge className="bg-amber-500/10 text-amber-500 text-xs">
                            Partner
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(ticket.created_at), 'MMM d, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setResolutionNotes(ticket.resolution_notes || '');
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono">{selectedTicket.ticket_number}</span>
                  {getStatusBadge(selectedTicket.status)}
                </DialogTitle>
                <DialogDescription>
                  Created {format(new Date(selectedTicket.created_at), 'PPpp')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Partner Routing Notice */}
                {isBookingRelated(selectedTicket.category) && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <h4 className="font-medium text-amber-600 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Partner-Related Issue
                    </h4>
                    <p className="text-sm text-amber-700 mt-1">
                      This appears to be a booking/refund issue. The customer should contact the booking partner 
                      {selectedTicket.partner_name ? ` (${selectedTicket.partner_name})` : ''} directly for resolution.
                    </p>
                    {selectedTicket.booking_ref && (
                      <p className="text-sm font-mono mt-2">
                        Booking Ref: {selectedTicket.booking_ref}
                      </p>
                    )}
                  </div>
                )}

                {/* Ticket Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Subject</Label>
                    <p className="font-medium">{selectedTicket.subject}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p>{getCategoryLabel(selectedTicket.category)}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <div className="p-3 bg-muted rounded-lg mt-1">
                    <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>
                </div>

                {/* Status Update */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(status) => 
                          updateTicket.mutate({ id: selectedTicket.id, updates: { status } })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={selectedTicket.priority}
                        onValueChange={(priority) => 
                          updateTicket.mutate({ id: selectedTicket.id, updates: { priority } })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Resolution Notes</Label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Add notes about how this was resolved..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                      Close
                    </Button>
                    <Button onClick={handleResolve} disabled={updateTicket.isPending}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
