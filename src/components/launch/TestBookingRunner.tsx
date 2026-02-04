/**
 * Test Booking Runner
 * Execute and verify real test bookings for production validation
 */
import { useState } from "react";
import { Play, CheckCircle2, XCircle, Loader2, Clock, DollarSign, Mail, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProductionTestBookings, useRunTestBooking } from "@/hooks/useProductionLaunch";
import type { TestBookingServiceType, TestBookingStatus } from "@/types/productionLaunch";

const SERVICE_LABELS: Record<TestBookingServiceType, { label: string; icon: string }> = {
  hotel: { label: "Hotel", icon: "🏨" },
  activity: { label: "Activity", icon: "🎯" },
  transfer: { label: "Transfer", icon: "🚐" },
  flight: { label: "Flight", icon: "✈️" },
};

const STATUS_CONFIG: Record<TestBookingStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "outline" },
  running: { label: "Running...", variant: "secondary" },
  success: { label: "Success", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
};

interface RunTestButtonProps {
  serviceType: TestBookingServiceType;
  isRunning: boolean;
  onRun: () => void;
}

function RunTestButton({ serviceType, isRunning, onRun }: RunTestButtonProps) {
  const service = SERVICE_LABELS[serviceType];

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isRunning}>
          {isRunning ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Test {service.label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Run Live {service.label} Test?</AlertDialogTitle>
          <AlertDialogDescription>
            This will create a real, low-value booking with our suppliers. A small charge (typically $10-50) will be made to a test card and refunded. 
            <br /><br />
            The test will verify:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Stripe payment capture</li>
              <li>Supplier booking confirmation</li>
              <li>Confirmation email delivery</li>
              <li>My Trips display</li>
              <li>Admin dashboard visibility</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onRun}>Run Test Booking</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function TestBookingRunner() {
  const { data: testBookings, isLoading } = useProductionTestBookings();
  const runTest = useRunTestBooking();
  const [runningService, setRunningService] = useState<TestBookingServiceType | null>(null);

  const handleRunTest = async (serviceType: TestBookingServiceType) => {
    setRunningService(serviceType);
    try {
      await runTest.mutateAsync({ serviceType });
    } finally {
      setRunningService(null);
    }
  };

  // Get latest test for each service type
  const latestTests = Object.keys(SERVICE_LABELS).reduce((acc, type) => {
    const serviceType = type as TestBookingServiceType;
    const latest = testBookings
      ?.filter((t) => t.service_type === serviceType)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    acc[serviceType] = latest || null;
    return acc;
  }, {} as Record<TestBookingServiceType, typeof testBookings extends (infer T)[] ? T : never>);

  const allServicesSuccessful = Object.values(latestTests).every(
    (test) => test?.test_status === 'success'
  );

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <Card className={allServicesSuccessful ? "border-green-500/50 bg-green-500/5" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allServicesSuccessful ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Clock className="h-5 w-5 text-muted-foreground" />
            )}
            Live Booking Verification
          </CardTitle>
          <CardDescription>
            {allServicesSuccessful
              ? "All service types have been successfully tested with live bookings"
              : "Run test bookings for each service type to verify production integration"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Run Test Bookings</CardTitle>
          <CardDescription>
            Execute real low-value bookings to verify end-to-end integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(SERVICE_LABELS) as TestBookingServiceType[]).map((serviceType) => (
              <RunTestButton
                key={serviceType}
                serviceType={serviceType}
                isRunning={runningService === serviceType}
                onRun={() => handleRunTest(serviceType)}
              />
            ))}
            <Button
              variant="default"
              size="sm"
              disabled={!!runningService}
              onClick={async () => {
                for (const type of Object.keys(SERVICE_LABELS) as TestBookingServiceType[]) {
                  if (type === 'flight') continue; // Flight handled by Duffel partner
                  await handleRunTest(type);
                }
              }}
            >
              Run All Tests
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Latest Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(SERVICE_LABELS) as TestBookingServiceType[]).map((serviceType) => {
              const service = SERVICE_LABELS[serviceType];
              const test = latestTests[serviceType];
              const status = test ? STATUS_CONFIG[test.test_status] : null;

              return (
                <div
                  key={serviceType}
                  className={`p-4 rounded-lg border ${
                    test?.test_status === 'success'
                      ? 'border-green-500/20 bg-green-500/5'
                      : test?.test_status === 'failed'
                      ? 'border-destructive/20 bg-destructive/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{service.icon}</span>
                    <span className="font-medium">{service.label}</span>
                  </div>

                  {test ? (
                    <div className="space-y-2">
                      <Badge variant={status?.variant}>{status?.label}</Badge>
                      
                      {test.test_status === 'success' && (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${((test.amount_cents || 0) / 100).toFixed(2)} {test.currency}
                          </div>
                          <div className="flex items-center gap-1">
                            {test.payment_captured ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-destructive" />
                            )}
                            Payment
                          </div>
                          <div className="flex items-center gap-1">
                            {test.email_sent ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-destructive" />
                            )}
                            <Mail className="h-3 w-3" />
                            Email
                          </div>
                          <div className="flex items-center gap-1">
                            {test.admin_visible ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-destructive" />
                            )}
                            <Eye className="h-3 w-3" />
                            Admin
                          </div>
                        </div>
                      )}

                      {test.test_status === 'failed' && test.error_message && (
                        <p className="text-xs text-destructive">{test.error_message}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not tested yet</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Full History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test History</CardTitle>
          <CardDescription>Complete log of all test bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : !testBookings?.length ? (
            <div className="py-8 text-center text-muted-foreground">
              No test bookings yet. Run a test above to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tested At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testBookings.slice(0, 20).map((test) => {
                  const service = SERVICE_LABELS[test.service_type];
                  const status = STATUS_CONFIG[test.test_status];

                  return (
                    <TableRow key={test.id}>
                      <TableCell>
                        <span className="mr-2">{service.icon}</span>
                        {service.label}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {test.booking_reference || '-'}
                      </TableCell>
                      <TableCell>
                        {test.amount_cents
                          ? `$${(test.amount_cents / 100).toFixed(2)}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {test.tested_at
                          ? new Date(test.tested_at).toLocaleString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
