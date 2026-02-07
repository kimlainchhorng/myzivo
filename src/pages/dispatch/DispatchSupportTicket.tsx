/**
 * Dispatch Support Ticket Detail
 * Admin view for individual ticket with chat
 */

import { useParams, useNavigate, Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  MoreVertical,
  User,
  Clock,
  ExternalLink,
  Loader2,
  UserPlus,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  useDispatchTicketDetail,
  useUpdateDispatchTicket,
  useAssignTicketToMe,
} from "@/hooks/useSupportChat";
import { TicketChat } from "@/components/support/TicketChat";
import { TicketStatusBadge } from "@/components/support/TicketStatusBadge";
import { TicketPriorityBadge } from "@/components/support/TicketPriorityBadge";
import { SLACountdownBadge } from "@/components/support/SLACountdownBadge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "waiting_response", label: "Waiting Response" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const priorityOptions = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

const DispatchSupportTicket = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: ticket, isLoading } = useDispatchTicketDetail(id);
  const updateTicket = useUpdateDispatchTicket();
  const assignToMe = useAssignTicketToMe();

  const handleStatusChange = (status: string) => {
    if (!id) return;
    updateTicket.mutate({ ticketId: id, updates: { status } });
  };

  const handlePriorityChange = (priority: string) => {
    if (!id) return;
    updateTicket.mutate({ ticketId: id, updates: { priority } });
  };

  const handleAssignToMe = () => {
    if (!id) return;
    assignToMe.mutate(id);
  };

  const handleResolve = () => {
    if (!id) return;
    updateTicket.mutate({
      ticketId: id,
      updates: { status: "resolved" },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ticket not found</p>
        <Button variant="link" onClick={() => navigate("/dispatch/support")}>
          Back to inbox
        </Button>
      </div>
    );
  }

  const isAssignedToMe = ticket.assigned_to === user?.id;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dispatch/support")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">
                {ticket.ticket_number || `#${ticket.id.slice(0, 8)}`}
              </h1>
              <TicketStatusBadge status={ticket.status || "open"} />
              <TicketPriorityBadge priority={ticket.priority || "normal"} />
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-md">
              {ticket.subject || "No subject"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ticket.status !== "resolved" && ticket.status !== "closed" && (
            <Button variant="outline" onClick={handleResolve}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isAssignedToMe && (
                <DropdownMenuItem onClick={handleAssignToMe}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign to me
                </DropdownMenuItem>
              )}
              {ticket.order_id && (
                <DropdownMenuItem asChild>
                  <Link to={`/dispatch/orders/${ticket.order_id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Order
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => handleStatusChange("closed")}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Close Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat Section */}
        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base">Conversation</CardTitle>
          </CardHeader>
          <TicketChat
            ticketId={ticket.id}
            isAdmin={true}
            ticketStatus={ticket.status || "open"}
          />
        </Card>

        {/* Ticket Details Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Status
                </label>
                <Select
                  value={ticket.status || "open"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Priority
                </label>
                <Select
                  value={ticket.priority || "normal"}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {format(new Date(ticket.created_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Activity</span>
                <span>
                  {ticket.last_message_at
                    ? formatDistanceToNow(new Date(ticket.last_message_at), {
                        addSuffix: true,
                      })
                    : "N/A"}
                </span>
              </div>
              {ticket.category && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline" className="capitalize">
                    {ticket.category.replace(/_/g, " ")}
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="secondary" className="capitalize">
                  {ticket.submitter_role || "Customer"}
                </Badge>
              </div>
              {ticket.sla_response_due_at && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Response SLA</span>
                  <SLACountdownBadge
                    dueAt={ticket.sla_response_due_at}
                    pausedAt={ticket.sla_paused_at}
                    pausedMinutes={ticket.sla_paused_duration_minutes || 0}
                    isBreached={ticket.sla_response_breached || false}
                    type="response"
                  />
                </div>
              )}
              {isAssignedToMe && (
                <div className="pt-2 border-t">
                  <Badge className="w-full justify-center">
                    <User className="h-3 w-3 mr-1" />
                    Assigned to you
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {ticket.user_id && (
                <p className="text-muted-foreground text-xs">
                  User ID: {ticket.user_id.slice(0, 8)}...
                </p>
              )}
              {ticket.driver_id && (
                <p className="text-muted-foreground text-xs">
                  Driver ticket
                </p>
              )}
              {ticket.restaurant_id && (
                <p className="text-muted-foreground text-xs">
                  Merchant ticket
                </p>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {ticket.description && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Initial Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatchSupportTicket;
