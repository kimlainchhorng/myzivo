/**
 * Dispatch Disputes Page
 * Admin inbox for viewing and managing order disputes
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Shield,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDisputes, useDisputeCounts, useDisputesRealtime } from "@/hooks/useDisputes";
import { DisputeStatusBadge } from "@/components/disputes/DisputeStatusBadge";
import { DisputeReasonBadge } from "@/components/disputes/DisputeReasonBadge";
import { DisputePriorityBadge } from "@/components/disputes/DisputePriorityBadge";

const DispatchDisputes = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: disputes, isLoading, refetch } = useDisputes({
    status: statusFilter,
    search: search || undefined,
  });

  const { data: counts } = useDisputeCounts();

  // Real-time updates
  useDisputesRealtime(() => {
    refetch();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Disputes</h1>
          <p className="text-muted-foreground">
            Review and resolve order disputes
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all" className="gap-1">
                  All
                  {counts?.all ? (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {counts.all}
                    </Badge>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="open" className="gap-1">
                  Open
                  {counts?.open ? (
                    <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                      {counts.open}
                    </Badge>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="under_review">Under Review</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search disputes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : disputes?.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium">No disputes found</h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter === "all"
                  ? "No disputes have been opened yet"
                  : `No ${statusFilter.replace("_", " ")} disputes`}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispute</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputes?.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            #{dispute.id.slice(0, 8)}
                          </span>
                          {dispute.payout_hold && (
                            <Shield className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/dispatch/orders/${dispute.order_id}`}
                          className="font-mono text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {dispute.order_id.slice(0, 8)}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <DisputeReasonBadge reason={dispute.reason} />
                      </TableCell>
                      <TableCell>
                        <DisputeStatusBadge status={dispute.status} />
                      </TableCell>
                      <TableCell>
                        <DisputePriorityBadge priority={dispute.priority} />
                      </TableCell>
                      <TableCell>
                        {dispute.requested_refund_amount > 0 ? (
                          <span className="font-medium">
                            ${dispute.requested_refund_amount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(dispute.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/dispatch/disputes/${dispute.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchDisputes;
