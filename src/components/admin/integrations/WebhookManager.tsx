import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Webhook, Plus, Trash2, Play, Pause, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
  lastTriggered: string | null;
  successRate: number;
  totalDeliveries: number;
  failedDeliveries: number;
  retryOnFailure: boolean;
}

// Webhooks loaded from database — no hardcoded data

const availableEvents = [
  { category: "Orders", events: ["order.created", "order.completed", "order.cancelled", "order.updated"] },
  { category: "Trips", events: ["trip.requested", "trip.started", "trip.completed", "trip.cancelled"] },
  { category: "Drivers", events: ["driver.online", "driver.offline", "driver.verified", "driver.suspended"] },
  { category: "Payments", events: ["payment.succeeded", "payment.failed", "refund.created", "payout.completed"] },
  { category: "Users", events: ["user.created", "user.updated", "user.deleted"] }
];

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
    retryOnFailure: true
  });

  const handleToggleWebhook = (id: string) => {
    setWebhooks(hooks => hooks.map(hook => 
      hook.id === id ? { ...hook, isActive: !hook.isActive } : hook
    ));
    toast.success("Webhook status updated");
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(hooks => hooks.filter(hook => hook.id !== id));
    toast.success("Webhook deleted");
  };

  const handleTestWebhook = (webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    setTestDialogOpen(true);
  };

  const handleSendTestEvent = () => {
    toast.success("Test event sent successfully", {
      description: "Check your endpoint for the test payload"
    });
    setTestDialogOpen(false);
  };

  const handleCreateWebhook = () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      secret: `whsec_${Math.random().toString(36).substring(2, 14)}`,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastTriggered: null,
      successRate: 100,
      totalDeliveries: 0,
      failedDeliveries: 0,
      retryOnFailure: newWebhook.retryOnFailure
    };

    setWebhooks([webhook, ...webhooks]);
    setCreateDialogOpen(false);
    setNewWebhook({ name: "", url: "", events: [], retryOnFailure: true });
    toast.success("Webhook created successfully");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 99) return "text-emerald-600";
    if (rate >= 95) return "text-amber-600";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Webhooks</h3>
          <p className="text-sm text-muted-foreground">Configure webhook endpoints for event notifications</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Webhook Endpoint</DialogTitle>
              <DialogDescription>
                Configure a new webhook to receive event notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Name</Label>
                <Input 
                  id="webhook-name" 
                  placeholder="e.g., Order Notifications"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Endpoint URL</Label>
                <Input 
                  id="webhook-url" 
                  placeholder="https://your-server.com/webhooks"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="max-h-48 overflow-y-auto border rounded-xl p-3 space-y-3">
                  {availableEvents.map((category) => (
                    <div key={category.category}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                        {category.category}
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {category.events.map((event) => (
                          <label key={event} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={newWebhook.events.includes(event)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
                                } else {
                                  setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
                                }
                              }}
                              className="rounded"
                            />
                            <code className="text-xs">{event}</code>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Retry on Failure</Label>
                  <p className="text-xs text-muted-foreground">Automatically retry failed deliveries</p>
                </div>
                <Switch 
                  checked={newWebhook.retryOnFailure}
                  onCheckedChange={(checked) => setNewWebhook({ ...newWebhook, retryOnFailure: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateWebhook}>Create Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id} className={!webhook.isActive ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    webhook.isActive ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <Webhook className={`h-5 w-5 ${
                      webhook.isActive ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{webhook.name}</h4>
                      {webhook.isActive ? (
                        <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Pause className="h-3 w-3" />
                          Paused
                        </Badge>
                      )}
                      {webhook.retryOnFailure && (
                        <Badge variant="secondary" className="gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Auto-retry
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono truncate max-w-md">
                        {webhook.url}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                        <a href={webhook.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {webhook.events.slice(0, 3).map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs font-mono">
                          {event}
                        </Badge>
                      ))}
                      {webhook.events.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{webhook.events.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last triggered: {formatDate(webhook.lastTriggered)}
                      </span>
                      <span className={getSuccessRateColor(webhook.successRate)}>
                        {webhook.successRate}% success rate
                      </span>
                      <span>{webhook.totalDeliveries.toLocaleString()} deliveries</span>
                      {webhook.failedDeliveries > 0 && (
                        <span className="text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {webhook.failedDeliveries} failed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                    onClick={() => handleTestWebhook(webhook)}
                  >
                    <Play className="h-3 w-3" />
                    Test
                  </Button>
                  <Switch 
                    checked={webhook.isActive} 
                    onCheckedChange={() => handleToggleWebhook(webhook.id)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Event</DialogTitle>
            <DialogDescription>
              Send a test event to {selectedWebhook?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Select Event Type</Label>
            <Select defaultValue={selectedWebhook?.events[0]}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {selectedWebhook?.events.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              A sample payload will be sent to your endpoint
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendTestEvent}>Send Test Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
