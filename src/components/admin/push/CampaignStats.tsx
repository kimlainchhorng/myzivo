/**
 * Campaign Stats
 * Display delivery statistics for a push campaign
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Users,
  TrendingUp,
} from "lucide-react";
import type { PushCampaign } from "@/lib/pushBroadcast";

interface CampaignStatsProps {
  campaign: PushCampaign;
}

export function CampaignStats({ campaign }: CampaignStatsProps) {
  const total = campaign.sent_count + campaign.failed_count + campaign.skipped_count;
  const deliveryRate = total > 0 ? (campaign.sent_count / total) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Delivery Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{campaign.targeted_count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Targeted</p>
          </div>
          
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <CheckCircle2 className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold text-green-600">{campaign.sent_count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Sent</p>
          </div>
          
          <div className="text-center p-3 bg-red-500/10 rounded-lg">
            <XCircle className="h-5 w-5 mx-auto text-red-600 mb-1" />
            <p className="text-2xl font-bold text-red-600">{campaign.failed_count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
          
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <MinusCircle className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
            <p className="text-2xl font-bold text-yellow-600">{campaign.skipped_count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Skipped</p>
          </div>
        </div>

        {/* Delivery rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Delivery Rate</span>
            <Badge variant={deliveryRate >= 90 ? "default" : deliveryRate >= 70 ? "secondary" : "destructive"}>
              {deliveryRate.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={deliveryRate} className="h-2" />
        </div>

        {/* Skip breakdown */}
        {campaign.skipped_count > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">Skip Reasons</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No subscription</span>
                <span>-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate limited</span>
                <span>-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unsubscribed</span>
                <span>-</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Detailed breakdown available in delivery logs
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          {campaign.sent_at && (
            <p>Sent: {new Date(campaign.sent_at).toLocaleString()}</p>
          )}
          {campaign.send_at && campaign.status === "scheduled" && (
            <p>Scheduled: {new Date(campaign.send_at).toLocaleString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CampaignStats;
