import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountTrustLevel } from "@/hooks/useAccountTrustLevel";
import { TRUST_TIERS } from "@/config/trustLevel";
import { cn } from "@/lib/utils";

const colorMap: Record<string, { bg: string; text: string; progress: string; badge: string }> = {
  violet: { bg: "bg-violet-500/10", text: "text-violet-600", progress: "[&>div]:bg-violet-500", badge: "bg-violet-500/15 text-violet-700" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", progress: "[&>div]:bg-emerald-500", badge: "bg-emerald-500/15 text-emerald-700" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600", progress: "[&>div]:bg-amber-500", badge: "bg-amber-500/15 text-amber-700" },
  slate: { bg: "bg-slate-500/10", text: "text-slate-600", progress: "[&>div]:bg-slate-500", badge: "bg-slate-500/15 text-slate-700" },
};

export function TrustLevelCard() {
  const navigate = useNavigate();
  const { level, score, isLoading } = useAccountTrustLevel();

  if (isLoading) {
    return (
      <div className="px-4 pb-2">
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const tier = TRUST_TIERS[level];
  const colors = colorMap[tier.color] || colorMap.slate;
  const Icon = tier.icon;

  return (
    <div className="px-4 pb-2">
      <Card
        className="cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-200 touch-manipulation"
        onClick={() => navigate("/account/trust")}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={cn("p-2 rounded-xl", colors.bg)}>
                <Icon className={cn("w-5 h-5", colors.text)} />
              </div>
              <div>
                <p className="text-sm font-medium">Account Trust</p>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", colors.badge)}>
                  {tier.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-muted-foreground">{score}/100</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <Progress value={score} className={cn("h-2", colors.progress)} />
        </CardContent>
      </Card>
    </div>
  );
}
