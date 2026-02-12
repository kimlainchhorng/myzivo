/**
 * DriverRatingDashboard
 * Shows driver's rating stats, distribution, trends, and recent feedback
 */

import { Star, TrendingUp, TrendingDown, Minus, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDriverRatings, DriverRatingStats } from "@/hooks/useDriverRatings";
import { format } from "date-fns";

interface DriverRatingDashboardProps {
  driverId?: string;
}

const CategoryBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-white/60">{label}</span>
      <span className="text-white font-medium">{value > 0 ? value.toFixed(1) : "—"}</span>
    </div>
    <Progress value={value > 0 ? (value / 5) * 100 : 0} className="h-2" />
  </div>
);

const DriverRatingDashboard = ({ driverId }: DriverRatingDashboardProps) => {
  const { data: stats, isLoading } = useDriverRatings(driverId);

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/80 border-white/10 animate-pulse">
        <CardContent className="p-6 h-48" />
      </Card>
    );
  }

  if (!stats || stats.totalRated === 0) {
    return (
      <Card className="bg-zinc-900/80 border-white/10">
        <CardContent className="p-6 text-center">
          <Star className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-white/40 text-sm">No ratings yet</p>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = stats.trend7d > 0 ? TrendingUp : stats.trend7d < 0 ? TrendingDown : Minus;
  const trendColor = stats.trend7d > 0 ? "text-green-400" : stats.trend7d < 0 ? "text-red-400" : "text-white/40";

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="bg-zinc-900/80 border-white/10">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-bold text-white">{stats.avgRating.toFixed(1)}</span>
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-xs text-white/40 mt-1">{stats.totalRated} rated trips</p>
            </div>
            <div className={cn("flex items-center gap-1", trendColor)}>
              <TrendIcon className="w-5 h-5" />
              <span className="text-sm font-medium">
                {stats.trend7d > 0 ? "+" : ""}{stats.trend7d.toFixed(2)}
              </span>
              <span className="text-xs text-white/40 ml-1">7d</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Star Distribution */}
      <Card className="bg-zinc-900/80 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white/60">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star - 1];
            const pct = stats.totalRated > 0 ? (count / stats.totalRated) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-white/60 w-4">{star}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400/70 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-white/40 w-6 text-right">{count}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Category Averages */}
      <Card className="bg-zinc-900/80 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white/60">Category Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CategoryBar label="Driving Quality" value={stats.categoryAverages.driving} />
          <CategoryBar label="Cleanliness" value={stats.categoryAverages.cleanliness} />
          <CategoryBar label="Friendliness" value={stats.categoryAverages.friendliness} />
          <CategoryBar label="Navigation" value={stats.categoryAverages.navigation} />
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      {stats.recentFeedback.length > 0 && (
        <Card className="bg-zinc-900/80 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/60 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Recent Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentFeedback.map((fb) => (
              <div key={fb.id} className="p-3 bg-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "w-3 h-3",
                          s <= fb.rating ? "text-yellow-400 fill-yellow-400" : "text-white/10"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-white/30">
                    {format(new Date(fb.createdAt), "MMM d")}
                  </span>
                </div>
                <p className="text-sm text-white/80">{fb.feedback}</p>
                {fb.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {fb.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-white/10 text-white/50">
                        {tag.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DriverRatingDashboard;
