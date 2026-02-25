/**
 * EmailAutomationDashboard - Admin panel for managing automated email flows
 */

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Mail,
  Settings,
  Play,
  Pause,
  Clock,
  Users,
  BarChart3,
  Eye,
  Send,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Calendar,
  ArrowRight,
  Plane,
  Hotel,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface EmailFlow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  timing: string;
  enabled: boolean;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
  };
  lastSent?: string;
}

const emailFlows: EmailFlow[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Sent immediately after signup",
    trigger: "User signup",
    timing: "Immediate",
    enabled: true,
    stats: { sent: 1250, opened: 875, clicked: 312 },
    lastSent: "2 hours ago",
  },
  {
    id: "abandoned_search",
    name: "Abandoned Search",
    description: "Reminder for incomplete searches",
    trigger: "Search without booking",
    timing: "30 minutes",
    enabled: true,
    stats: { sent: 890, opened: 445, clicked: 178 },
    lastSent: "45 minutes ago",
  },
  {
    id: "booking_confirmation",
    name: "Booking Confirmation",
    description: "Confirmation after successful booking",
    trigger: "Booking completed",
    timing: "Immediate",
    enabled: true,
    stats: { sent: 567, opened: 510, clicked: 234 },
    lastSent: "1 hour ago",
  },
  {
    id: "trip_reminder",
    name: "Trip Reminder",
    description: "Reminder before trip departure",
    trigger: "24h before departure",
    timing: "24 hours before",
    enabled: true,
    stats: { sent: 234, opened: 211, clicked: 89 },
    lastSent: "3 hours ago",
  },
  {
    id: "checkin_reminder",
    name: "Check-in Reminder",
    description: "Airline check-in reminder",
    trigger: "48h before departure",
    timing: "48 hours before",
    enabled: false,
    stats: { sent: 0, opened: 0, clicked: 0 },
  },
  {
    id: "post_trip_feedback",
    name: "Post-Trip Feedback",
    description: "Request feedback after trip completion",
    trigger: "Trip end date",
    timing: "24 hours after",
    enabled: true,
    stats: { sent: 156, opened: 78, clicked: 45 },
    lastSent: "6 hours ago",
  },
  {
    id: "price_alert",
    name: "Price Drop Alert",
    description: "Notify when saved search prices drop",
    trigger: "Price decrease",
    timing: "Real-time",
    enabled: true,
    stats: { sent: 432, opened: 346, clicked: 189 },
    lastSent: "20 minutes ago",
  },
];

export default function EmailAutomationDashboard() {
  const [flows, setFlows] = useState(emailFlows);
  const [testEmail, setTestEmail] = useState("");
  const { toast } = useToast();

  const toggleFlow = (id: string) => {
    setFlows((prev) =>
      prev.map((flow) =>
        flow.id === id ? { ...flow, enabled: !flow.enabled } : flow
      )
    );
    toast({
      title: "Email flow updated",
      description: `Flow has been ${flows.find((f) => f.id === id)?.enabled ? "disabled" : "enabled"}`,
    });
  };

  const sendTestEmail = (flowId: string) => {
    if (!testEmail) {
      toast({
        title: "Email required",
        description: "Please enter a test email address",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Test email sent",
      description: `Test email sent to ${testEmail}`,
    });
  };

  const totalStats = flows.reduce(
    (acc, flow) => ({
      sent: acc.sent + flow.stats.sent,
      opened: acc.opened + flow.stats.opened,
      clicked: acc.clicked + flow.stats.clicked,
    }),
    { sent: 0, opened: 0, clicked: 0 }
  );

  const openRate = totalStats.sent > 0 ? ((totalStats.opened / totalStats.sent) * 100).toFixed(1) : "0";
  const clickRate = totalStats.opened > 0 ? ((totalStats.clicked / totalStats.opened) * 100).toFixed(1) : "0";

  return (
    <>
      <Helmet>
        <title>Email Automation | ZIVO Admin</title>
      </Helmet>

      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">Email Automation</h1>
              <p className="text-muted-foreground">
                Manage automated email flows and triggers
              </p>
            </div>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sent</p>
                    <p className="text-2xl font-bold">{totalStats.sent.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Rate</p>
                    <p className="text-2xl font-bold">{openRate}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Click Rate</p>
                    <p className="text-2xl font-bold">{clickRate}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Flows</p>
                    <p className="text-2xl font-bold">
                      {flows.filter((f) => f.enabled).length}/{flows.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Flows Table */}
          <Card>
            <CardHeader>
              <CardTitle>Email Flows</CardTitle>
              <CardDescription>
                Configure automated email triggers and timing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Flow</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Timing</TableHead>
                    <TableHead className="text-center">Sent</TableHead>
                    <TableHead className="text-center">Open Rate</TableHead>
                    <TableHead className="text-center">Click Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flows.map((flow) => {
                    const flowOpenRate = flow.stats.sent > 0
                      ? ((flow.stats.opened / flow.stats.sent) * 100).toFixed(0)
                      : "0";
                    const flowClickRate = flow.stats.opened > 0
                      ? ((flow.stats.clicked / flow.stats.opened) * 100).toFixed(0)
                      : "0";

                    return (
                      <TableRow key={flow.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{flow.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {flow.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{flow.trigger}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {flow.timing}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {flow.stats.sent.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={parseInt(flowOpenRate) > 50 ? "text-emerald-600" : ""}>
                            {flowOpenRate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={parseInt(flowClickRate) > 30 ? "text-emerald-600" : ""}>
                            {flowClickRate}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={flow.enabled}
                            onCheckedChange={() => toggleFlow(flow.id)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendTestEmail(flow.id)}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Compliance Notice */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-500" />
              All emails are informational and booking-related only. Users can manage preferences in their account settings.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
