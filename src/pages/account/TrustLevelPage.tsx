import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountTrustLevel } from "@/hooks/useAccountTrustLevel";
import { TRUST_TIERS } from "@/config/trustLevel";
import { cn } from "@/lib/utils";

const colorMap: Record<string, { bg: string; text: string; progress: string; ring: string }> = {
  violet: { bg: "bg-violet-500/10", text: "text-violet-600", progress: "[&>div]:bg-violet-500", ring: "border-violet-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", progress: "[&>div]:bg-emerald-500", ring: "border-emerald-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600", progress: "[&>div]:bg-amber-500", ring: "border-amber-500" },
  slate: { bg: "bg-slate-500/10", text: "text-slate-600", progress: "[&>div]:bg-slate-500", ring: "border-slate-500" },
};

export default function TrustLevelPage() {
  const navigate = useNavigate();
  const { level, score, signals, improvements, benefits, isLoading } = useAccountTrustLevel();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const tier = TRUST_TIERS[level];
  const colors = colorMap[tier.color] || colorMap.slate;
  const Icon = tier.icon;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 -ml-2 rounded-full hover:bg-muted touch-manipulation active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Account Trust Level</h1>
        </div>
      </div>

      {/* Score Hero */}
      <div className="px-4 pt-6 pb-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className={cn("w-20 h-20 rounded-full border-4 flex items-center justify-center mb-4", colors.ring, colors.bg)}>
              <Icon className={cn("w-10 h-10", colors.text)} />
            </div>
            <h2 className={cn("text-2xl font-bold mb-1", colors.text)}>{tier.label}</h2>
            <p className="text-sm text-muted-foreground mb-4">Trust Score: {score} / 100</p>
            <Progress value={score} className={cn("h-3 w-full max-w-xs", colors.progress)} />
          </CardContent>
        </Card>
      </div>

      {/* Benefits */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Your Benefits</h3>
        <Card>
          <CardContent className="p-4 space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <Sparkles className={cn("w-4 h-4 flex-shrink-0", colors.text)} />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Signal Breakdown */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Trust Signals</h3>
        <Card>
          <CardContent className="p-4 space-y-1">
            {signals.map((s, i) => (
              <div key={s.signal.id}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {s.earned ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span className={cn("text-sm", !s.earned && "text-muted-foreground")}>{s.signal.label}</span>
                  </div>
                  <span className={cn("text-xs font-medium", s.earned ? "text-emerald-600" : "text-muted-foreground")}>
                    +{s.signal.weight}
                  </span>
                </div>
                {i < signals.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Improve Your Score</h3>
          <Card>
            <CardContent className="p-4 space-y-1">
              {improvements.map((imp, i) => (
                <div key={i}>
                  <button
                    onClick={() => imp.path && navigate(imp.path)}
                    disabled={!imp.path}
                    className={cn(
                      "flex items-center justify-between w-full py-2.5 text-left",
                      imp.path && "hover:bg-muted/50 rounded-lg px-1 -mx-1 transition-colors"
                    )}
                  >
                    <span className="text-sm">{imp.label}</span>
                    {imp.path && <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />}
                  </button>
                  {i < improvements.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
