import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Users,
  ThumbsUp,
  ThumbsDown,
  Award,
  AlertTriangle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";

const ratingDistribution = [
  { rating: "5 Star", count: 12500, percentage: 62 },
  { rating: "4 Star", count: 4800, percentage: 24 },
  { rating: "3 Star", count: 1600, percentage: 8 },
  { rating: "2 Star", count: 800, percentage: 4 },
  { rating: "1 Star", count: 400, percentage: 2 }
];

const trendData = [
  { month: "Jan", rider: 4.72, driver: 4.85, restaurant: 4.65 },
  { month: "Feb", rider: 4.75, driver: 4.82, restaurant: 4.68 },
  { month: "Mar", rider: 4.78, driver: 4.88, restaurant: 4.72 },
  { month: "Apr", rider: 4.76, driver: 4.86, restaurant: 4.70 },
  { month: "May", rider: 4.80, driver: 4.90, restaurant: 4.75 },
  { month: "Jun", rider: 4.82, driver: 4.92, restaurant: 4.78 }
];

const AdminRatingOverview = () => {
  const totalRatings = ratingDistribution.reduce((sum, r) => sum + r.count, 0);
  const avgRating = 4.78;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500" />
            Rating Overview
          </h2>
          <p className="text-muted-foreground">Platform-wide rating analytics</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgRating}</p>
                <p className="text-xs text-muted-foreground">Avg Platform Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalRatings / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">86%</p>
                <p className="text-xs text-muted-foreground">Positive (4-5 Star)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <ThumbsDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">6%</p>
                <p className="text-xs text-muted-foreground">Negative (1-2 Star)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratingDistribution.map((item) => (
              <div key={item.rating} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{item.rating}</span>
                    <div className="flex">
                      {Array.from({ length: parseInt(item.rating) }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.count.toLocaleString()}</span>
                    <span className="text-muted-foreground">({item.percentage}%)</span>
                  </div>
                </div>
                <Progress 
                  value={item.percentage} 
                  className={cn(
                    "h-2",
                    parseInt(item.rating) >= 4 ? "[&>div]:bg-green-500" :
                    parseInt(item.rating) === 3 ? "[&>div]:bg-amber-500" :
                    "[&>div]:bg-red-500"
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Rating Trend by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[4.5, 5]} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="rider" stroke="#3b82f6" strokeWidth={2} name="Rider Ratings" />
                  <Line type="monotone" dataKey="driver" stroke="#22c55e" strokeWidth={2} name="Driver Ratings" />
                  <Line type="monotone" dataKey="restaurant" stroke="#f59e0b" strokeWidth={2} name="Restaurant Ratings" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Award className="h-5 w-5 text-green-500" />
              <h4 className="font-semibold">Top Rated Drivers</h4>
            </div>
            <p className="text-3xl font-bold">4.92</p>
            <p className="text-xs text-muted-foreground">Average rating (Top 10%)</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-blue-500" />
              <h4 className="font-semibold">Review Response Rate</h4>
            </div>
            <p className="text-3xl font-bold">72%</p>
            <p className="text-xs text-muted-foreground">Businesses responding to reviews</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h4 className="font-semibold">Flagged Reviews</h4>
            </div>
            <p className="text-3xl font-bold">28</p>
            <p className="text-xs text-muted-foreground">Pending moderation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRatingOverview;
