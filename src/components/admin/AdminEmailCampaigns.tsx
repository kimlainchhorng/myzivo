import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, Send, Users, BarChart3, Clock, Eye, 
  MousePointer, AlertCircle, CheckCircle2, Plus
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const campaigns = [
  { id: "1", name: "Weekly Newsletter", status: "sent", sent: 45000, delivered: 44100, opened: 15435, clicked: 3087, bounced: 900, date: "Jan 15" },
  { id: "2", name: "New Feature Announcement", status: "sent", sent: 38000, delivered: 37240, opened: 14896, clicked: 4469, bounced: 760, date: "Jan 12" },
  { id: "3", name: "Promo Code Campaign", status: "scheduled", sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, date: "Jan 20" },
  { id: "4", name: "Re-engagement Series", status: "draft", sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, date: "-" },
  { id: "5", name: "Driver Onboarding", status: "active", sent: 1200, delivered: 1176, opened: 940, clicked: 564, bounced: 24, date: "Ongoing" },
];

export default function AdminEmailCampaigns() {
  const totalSent = 250000;
  const avgOpenRate = 38.5;
  const avgCTR = 8.2;
  const deliveryRate = 98.2;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      sent: { icon: <CheckCircle2 className="h-3 w-3" />, class: "bg-green-500/10 text-green-500" },
      scheduled: { icon: <Clock className="h-3 w-3" />, class: "bg-blue-500/10 text-blue-500" },
      draft: { icon: <Mail className="h-3 w-3" />, class: "bg-muted text-muted-foreground" },
      active: { icon: <Send className="h-3 w-3" />, class: "bg-amber-500/10 text-amber-500" }
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
            <Mail className="h-6 w-6 text-primary" />
            Email Campaigns
          </h2>
          <p className="text-muted-foreground">Manage email marketing campaigns</p>
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
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{avgOpenRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MousePointer className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{avgCTR}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <CheckCircle2 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold">{deliveryRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Email campaigns and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 rounded-lg bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{campaign.name}</span>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <span className="text-sm text-muted-foreground">{campaign.date}</span>
                </div>
                {campaign.status === "sent" || campaign.status === "active" ? (
                  <>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sent</p>
                        <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Delivered</p>
                        <p className="font-medium">{campaign.delivered.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Opened</p>
                        <p className="font-medium text-green-500">
                          {campaign.opened.toLocaleString()} ({((campaign.opened / campaign.delivered) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clicked</p>
                        <p className="font-medium text-blue-500">
                          {campaign.clicked.toLocaleString()} ({((campaign.clicked / campaign.delivered) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bounced</p>
                        <p className="font-medium text-red-500">
                          {campaign.bounced.toLocaleString()} ({((campaign.bounced / campaign.sent) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <Progress value={(campaign.opened / campaign.delivered) * 100} className="h-2" />
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    {campaign.status === "scheduled" && <Button size="sm">Send Now</Button>}
                    {campaign.status === "draft" && <Button size="sm">Schedule</Button>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
