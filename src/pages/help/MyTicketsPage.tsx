/**
 * My Tickets Page
 * List of user's support tickets with status
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Ticket, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useRiderTickets, TICKET_CATEGORIES } from "@/hooks/useRiderSupport";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";

type FilterStatus = "active" | "resolved" | "all";

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const { data: tickets = [], isLoading } = useRiderTickets();
  const [filter, setFilter] = useState<FilterStatus>("active");

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "active") {
      return ["open", "pending", "in_progress", "waiting_response"].includes(ticket.status || "open");
    }
    if (filter === "resolved") {
      return ["resolved", "closed"].includes(ticket.status || "");
    }
    return true;
  });

  const getCategoryLabel = (value: string) => {
    return TICKET_CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">My Tickets</h1>
          <button
            onClick={() => navigate("/help/new")}
            className="p-2 -mr-2 hover:bg-muted rounded-full"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={filter === "resolved" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("resolved")}
          >
            Resolved
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tickets List */}
        {!isLoading && filteredTickets.length > 0 && (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      #{ticket.ticket_number}
                    </span>
                    <TicketStatusBadge status={ticket.status || "open"} />
                  </div>

                  <h3 className="font-medium mb-1 line-clamp-1">{ticket.subject}</h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">
                      {getCategoryLabel(ticket.category || "other")}
                    </Badge>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(ticket.created_at || Date.now()), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {ticket.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {ticket.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredTickets.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              {filter === "active" ? (
                <Inbox className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Ticket className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="font-semibold mb-2">
              {filter === "active" ? "No active tickets" : filter === "resolved" ? "No resolved tickets" : "No tickets yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {filter === "active"
                ? "You don't have any open support tickets"
                : filter === "resolved"
                ? "Your resolved tickets will appear here"
                : "Need help? Submit a support ticket"}
            </p>
            <Button onClick={() => navigate("/help/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Report an Issue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;
