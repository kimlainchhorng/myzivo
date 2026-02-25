/**
 * Flight Failures Table
 * Shows payment failures, ticketing failures, and auto-refunds
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { type FlightFailures } from "@/hooks/useFlightAnalytics";

interface FlightFailuresTableProps {
  data: FlightFailures | undefined;
  isLoading?: boolean;
}

export function FlightFailuresTable({ data, isLoading }: FlightFailuresTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Failure Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
            <div className="h-40 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Failure Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No failure data available</p>
        </CardContent>
      </Card>
    );
  }

  const hasFailures = data.zeroResultsCount > 0 || 
                      data.paymentFailures > 0 || 
                      data.ticketingFailures > 0 ||
                      data.autoRefundsTriggered > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Failure Monitoring
        </CardTitle>
        <CardDescription>
          Track payment issues, ticketing failures, and refunds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Zero Results</span>
            </div>
            <p className="text-2xl font-bold">{data.zeroResultsCount}</p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Payment Failures</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{data.paymentFailures}</p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Ticketing Failures</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{data.ticketingFailures}</p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Auto-Refunds</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{data.autoRefundsTriggered}</p>
          </div>
        </div>

        {/* Failed Bookings Table */}
        {data.failedBookings.length > 0 ? (
          <div>
            <h4 className="font-medium mb-3">Recent Failed Bookings</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.failedBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-sm">
                      {booking.booking_reference}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {booking.ticketing_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {booking.ticketing_error || "No error message"}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${booking.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(booking.created_at), "MMM d, HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : hasFailures ? (
          <p className="text-center text-muted-foreground py-4">
            Failures detected but no detailed records available
          </p>
        ) : (
          <div className="text-center py-8 text-emerald-600">
            <p className="font-medium">✓ No failures detected</p>
            <p className="text-sm text-muted-foreground mt-1">
              All payments and ticketing operations successful
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
