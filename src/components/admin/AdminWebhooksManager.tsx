import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Webhook, Plus, CheckCircle2, XCircle, Clock, 
  MoreVertical, Send, RefreshCw, Key, Globe
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const webhooks = [
  { id: "1", name: "Order Notifications", url: "https://api.partner.com/orders", events: ["order.created", "order.completed"], status: "active", lastDelivery: "2 min ago", successRate: 99.8 },
  { id: "2", name: "Trip Updates", url: "https://tracking.service.io/trips", events: ["trip.started", "trip.completed", "trip.cancelled"], status: "active", lastDelivery: "5 min ago", successRate: 98.5 },
  { id: "3", name: "Payment Events", url: "https://accounting.internal/webhooks", events: ["payment.received", "refund.processed"], status: "active", lastDelivery: "1 hour ago", successRate: 100 },
  { id: "4", name: "Driver Status", url: "https://fleet.manager.com/hooks", events: ["driver.online", "driver.offline"], status: "paused", lastDelivery: "1 day ago", successRate: 95.2 },
  { id: "5", name: "Analytics Sync", url: "https://analytics.bi/ingest", events: ["trip.completed", "order.completed"], status: "error", lastDelivery: "3 hours ago", successRate: 42.5 },
];

const availableEvents = [
  { category: "Trips", events: ["trip.created", "trip.started", "trip.completed", "trip.cancelled"] },
  { category: "Orders", events: ["order.created", "order.accepted", "order.completed", "order.cancelled"] },
  { category: "Payments", events: ["payment.received", "payment.failed", "refund.processed"] },
  { category: "Drivers", events: ["driver.online", "driver.offline", "driver.verified"] },
  { category: "Users", events: ["user.registered", "user.updated"] },
];

export default function AdminWebhooksManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const totalWebhooks = webhooks.length;
  const activeWebhooks = webhooks.filter(w => w.status === "active").length;
  const totalDeliveries = 125000;
  const avgSuccessRate = 97.2;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      active: { icon: <CheckCircle2 className="h-3 w-3" />, class: "bg-green-500/10 text-green-500" },
      paused: { icon: <Clock className="h-3 w-3" />, class: "bg-amber-500/10 text-amber-500" },
      error: { icon: <XCircle className="h-3 w-3" />, class: "bg-red-500/10 text-red-500" }
    };
    return (
      <Badge className={config[status].class}>
        {config[status].icon}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Webhook className="h-6 w-6 text-primary" />
            Webhooks Manager
          </h2>
          <p className="text-muted-foreground">Configure and monitor webhook endpoints</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Webhook className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Webhooks</p>
                <p className="text-2xl font-bold">{totalWebhooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeWebhooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Send className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deliveries</p>
                <p className="text-2xl font-bold">{(totalDeliveries / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <RefreshCw className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{avgSuccessRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Webhooks</CardTitle>
          <CardDescription>All webhook endpoints and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{webhook.url}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.slice(0, 2).map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                      ))}
                      {webhook.events.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{webhook.events.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                  <TableCell>
                    <span className={webhook.successRate >= 95 ? "text-green-500" : webhook.successRate >= 80 ? "text-amber-500" : "text-red-500"}>
                      {webhook.successRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{webhook.lastDelivery}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Test Delivery</DropdownMenuItem>
                        <DropdownMenuItem>View Logs</DropdownMenuItem>
                        <DropdownMenuItem>Regenerate Secret</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>Configure a new webhook endpoint</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="My Webhook" />
            </div>
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <Input placeholder="https://api.example.com/webhook" />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {availableEvents.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <p className="text-sm font-medium">{category.category}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {category.events.map((event) => (
                        <div key={event} className="flex items-center gap-2">
                          <Checkbox id={event} />
                          <label htmlFor={event} className="text-sm">{event}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button>Create Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
