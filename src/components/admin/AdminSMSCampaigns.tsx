import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, Send, Users, DollarSign, CheckCircle2, 
  Clock, AlertTriangle, Plus
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const smsHistory = [
  { id: "1", message: "Your ride is 2 mins away!", type: "transactional", sent: 15000, delivered: 14850, cost: 148.50, date: "Today" },
  { id: "2", message: "Flash sale! Use code SAVE20", type: "promotional", sent: 25000, delivered: 24500, cost: 245.00, date: "Yesterday" },
  { id: "3", message: "Your order has been delivered", type: "transactional", sent: 8000, delivered: 7920, cost: 79.20, date: "2 days ago" },
  { id: "4", message: "We miss you! Come back for 15% off", type: "promotional", sent: 12000, delivered: 11760, cost: 117.60, date: "3 days ago" },
];

export default function AdminSMSCampaigns() {
  const totalSent = 180000;
  const deliveryRate = 98.5;
  const totalCost = 1800;
  const avgCostPerSMS = 0.01;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            SMS Campaigns
          </h2>
          <p className="text-muted-foreground">Send transactional and promotional SMS</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{(totalSent / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold">{deliveryRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${totalCost}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost/SMS</p>
                <p className="text-2xl font-bold">${avgCostPerSMS}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compose SMS</CardTitle>
            <CardDescription>Create a new SMS campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="inactive">Inactive (30+ days)</SelectItem>
                  <SelectItem value="premium">Premium Members</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Message</Label>
                <span className="text-xs text-muted-foreground">0/160 characters</span>
              </div>
              <Textarea placeholder="Type your SMS message..." rows={3} maxLength={160} />
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Estimated cost: $0.00 (0 recipients)
            </div>
            <Button className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send SMS Campaign
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent SMS Campaigns</CardTitle>
            <CardDescription>History of sent messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {smsHistory.map((sms) => (
              <div key={sms.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={sms.type === "transactional" ? "text-blue-500" : "text-purple-500"}>
                    {sms.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{sms.date}</span>
                </div>
                <p className="text-sm truncate">{sms.message}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{sms.sent.toLocaleString()} sent</span>
                  <span>{sms.delivered.toLocaleString()} delivered</span>
                  <span className="text-amber-500">${sms.cost.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
