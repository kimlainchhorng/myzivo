/**
 * Group Order Banner
 * Shown on restaurant menu when user is browsing in group order mode
 */
import { useNavigate } from "react-router-dom";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GroupOrderBannerProps {
  inviteCode: string;
  hostName?: string;
  myItemCount: number;
}

export function GroupOrderBanner({ inviteCode, hostName, myItemCount }: GroupOrderBannerProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-violet-400" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-violet-300 truncate">
            {hostName ? `${hostName}'s Group Order` : "Group Order"}
          </p>
          <p className="text-xs text-muted-foreground">
            Adding items to shared cart
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {myItemCount > 0 && (
          <Badge className="bg-violet-500 text-white">{myItemCount} added</Badge>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/eats/group/${inviteCode}`)}
          className="gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </Button>
      </div>
    </div>
  );
}
