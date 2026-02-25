/**
 * AchievementsPage — /account/achievements
 * Shows earned badges, in-progress badges, and locked badges.
 */

import { ArrowLeft, Trophy, Lock, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCustomerAchievements, AchievementBadge } from "@/hooks/useCustomerAchievements";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const tierColors: Record<string, { bg: string; border: string; text: string }> = {
  bronze: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-500" },
  silver: { bg: "bg-slate-400/10", border: "border-slate-400/30", text: "text-slate-400" },
  gold: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-500" },
};

function BadgeIcon({ badge, size = "lg" }: { badge: AchievementBadge; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-16 h-16 text-3xl" : "w-12 h-12 text-2xl";
  const colors = tierColors[badge.tier] || tierColors.bronze;

  return (
    <div
      className={cn(
        "rounded-2xl flex items-center justify-center relative",
        dim,
        badge.earned
          ? `${colors.bg} ${colors.border} border-2 shadow-lg`
          : badge.claimable
          ? `${colors.bg} ${colors.border} border-2 ring-2 ring-primary/50 animate-pulse`
          : "bg-muted/50 border border-border/50"
      )}
    >
      <span className={badge.earned || badge.claimable ? "" : "opacity-30 grayscale"}>
        {badge.icon}
      </span>
      {badge.earned && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      {!badge.earned && !badge.claimable && badge.progress === 0 && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center border border-border">
          <Lock className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { badges, totalEarned, totalAvailable, isLoading, claimBadge, isClaiming } =
    useCustomerAchievements();

  const earned = badges.filter((b) => b.earned);
  const inProgress = badges.filter((b) => !b.earned && b.progress > 0);
  const locked = badges.filter((b) => !b.earned && b.progress === 0);
  const claimable = badges.filter((b) => b.claimable);

  return (
    <div className="min-h-screen bg-background pb-20 safe-area-top safe-area-bottom">
      <div className="container max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl hover:bg-muted/50 -ml-2 touch-manipulation active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Achievements
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Track your progress & earn rewards
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary Card */}
            <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {totalEarned}{" "}
                      <span className="text-base font-normal text-muted-foreground">
                        / {totalAvailable}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">Badges Earned</p>
                    {claimable.length > 0 && (
                      <Badge className="mt-1 bg-primary/20 text-primary border-primary/30 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {claimable.length} ready to claim!
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Claimable Badges */}
            {claimable.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-base mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Ready to Claim
                </h2>
                <div className="space-y-3">
                  {claimable.map((badge) => (
                    <Card
                      key={badge.id}
                      className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg ring-1 ring-primary/20"
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <BadgeIcon badge={badge} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                          <p className="text-xs text-primary font-medium mt-1">
                            +{badge.tier === "gold" ? 250 : badge.tier === "silver" ? 100 : 50} points
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => claimBadge(badge.id)}
                          disabled={isClaiming}
                          className="bg-gradient-to-r from-primary to-teal-400 text-white rounded-xl text-xs px-4"
                        >
                          Claim
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Earned Badges */}
            {earned.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-base mb-3">Earned</h2>
                <div className="grid grid-cols-4 gap-3">
                  {earned.map((badge) => (
                    <div key={badge.id} className="flex flex-col items-center gap-1.5 text-center">
                      <BadgeIcon badge={badge} size="sm" />
                      <p className="text-[10px] font-medium leading-tight">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* In Progress */}
            {inProgress.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-base mb-3">In Progress</h2>
                <div className="space-y-3">
                  {inProgress.map((badge) => (
                    <Card key={badge.id} className="border-0 bg-card/90 shadow-lg">
                      <CardContent className="p-4 flex items-center gap-4">
                        <BadgeIcon badge={badge} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm">{badge.name}</p>
                            <span className="text-xs text-muted-foreground">
                              {badge.currentValue}/{badge.threshold}
                            </span>
                          </div>
                          <Progress value={badge.progress} className="h-2" />
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {badge.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Locked */}
            {locked.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-base mb-3 text-muted-foreground">
                  Locked
                </h2>
                <div className="grid grid-cols-4 gap-3">
                  {locked.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center gap-1.5 text-center opacity-50"
                    >
                      <BadgeIcon badge={badge} size="sm" />
                      <p className="text-[10px] font-medium leading-tight text-muted-foreground">
                        {badge.name}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {badges.length === 0 && (
              <Card className="border-0 bg-card/90 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-semibold">No achievements yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start ordering to unlock badges and earn rewards!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
