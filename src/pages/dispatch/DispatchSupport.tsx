/**
 * Dispatch Support Inbox
 * Admin support ticket management dashboard
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Inbox,
  Loader2,
  ChevronRight,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import {
  useDispatchTickets,
  useDispatchTicketsRealtime,
  useTicketStatusCounts,
} from "@/hooks/useSupportChat";
import { TicketStatusBadge } from "@/components/support/TicketStatusBadge";
import { TicketPriorityBadge } from "@/components/support/TicketPriorityBadge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DispatchSupport = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tickets = [], isLoading, refetch } = useDispatchTickets({
    status: statusFilter,
    search: searchQuery || undefined,
  });

  const { data: counts = {} } = useTicketStatusCounts();

  // Real-time updates
  useDispatchTicketsRealtime(
    useCallback((payload: any) => {
      if (payload.eventType === "INSERT") {
        toast.info("New support ticket received", {
          action: {
            label: "View",
            onClick: () => navigate(`/dispatch/support/${payload.new.id}`),
          },
        });
      }
    }, [navigate])
  );

  const statusTabs = [
    { value: "all", label: "All", count: counts.all || 0 },
    { value: "open", label: "Open", count: counts.open || 0 },
    { value: "in_progress", label: "In Progress", count: counts.in_progress || 0 },
    { value: "pending", label: "Pending", count: counts.pending || 0 },
    { value: "resolved", label: "Resolved", count: counts.resolved || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Inbox</h1>
          <p className="text-muted-foreground">
            Manage customer support tickets and messages
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket #, subject, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                {statusTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                    {tab.label}
                    {tab.count > 0 && (
                      <Badge
                        variant={tab.value === "open" ? "destructive" : "secondary"}
                        className="h-5 px-1.5 text-xs"
                      >
                        {tab.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Inbox className="h-5 w-5" />
            Tickets
            <Badge variant="outline" className="ml-2">
              {tickets.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mb-3 opacity-50" />
              <p>No tickets found</p>
              <p className="text-xs mt-1">
                {searchQuery
                  ? "Try adjusting your search"
                  : "All caught up! No pending tickets."}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y divide-border">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => navigate(`/dispatch/support/${ticket.id}`)}
                    className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center gap-4"
                  >
                    {/* Priority indicator */}
                    <div
                      className={cn(
                        "w-1 h-12 rounded-full shrink-0",
                        ticket.priority === "urgent"
                          ? "bg-destructive"
                          : ticket.priority === "high"
                          ? "bg-warning"
                          : "bg-muted-foreground/30"
                      )}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          {ticket.ticket_number || `#${ticket.id.slice(0, 8)}`}
                        </span>
                        <TicketStatusBadge status={ticket.status || "open"} />
                        <TicketPriorityBadge
                          priority={ticket.priority || "normal"}
                          showLabel={false}
                        />
                      </div>
                      <p className="font-medium truncate">
                        {ticket.subject || "No subject"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="capitalize">
                          {ticket.submitter_role || "Customer"}
                        </span>
                        <span>•</span>
                        <span>
                          {ticket.last_message_at
                            ? formatDistanceToNow(new Date(ticket.last_message_at), {
                                addSuffix: true,
                              })
                            : format(new Date(ticket.created_at), "MMM d, h:mm a")}
                        </span>
                        {ticket.category && (
                          <>
                            <span>•</span>
                            <span className="capitalize">
                              {ticket.category.replace(/_/g, " ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchSupport;
