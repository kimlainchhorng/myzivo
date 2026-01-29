import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Star, Search, MoreVertical, Flag, MessageSquare, 
  ThumbsUp, ThumbsDown, TrendingUp, AlertTriangle
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const reviews = [
  { id: "1", user: "John Smith", rating: 5, comment: "Excellent service! Driver was very professional and the car was clean.", target: "Driver: Mike Brown", service: "rides", date: "2 hours ago", status: "published", helpful: 12 },
  { id: "2", user: "Sarah Johnson", rating: 2, comment: "Food arrived cold and the order was wrong. Very disappointed.", target: "Restaurant: Pizza Palace", service: "eats", date: "5 hours ago", status: "flagged", helpful: 3 },
  { id: "3", user: "Mike Brown", rating: 4, comment: "Great car, easy pickup. Minor issue with cleanliness.", target: "Car Rental: Toyota Camry", service: "rentals", date: "1 day ago", status: "published", helpful: 8 },
  { id: "4", user: "Emma Wilson", rating: 1, comment: "Driver was rude and took a longer route. Never using again!", target: "Driver: Tom Wilson", service: "rides", date: "1 day ago", status: "under_review", helpful: 2 },
  { id: "5", user: "David Lee", rating: 5, comment: "Perfect hotel stay! Room was exactly as described.", target: "Hotel: Grand Plaza", service: "hotels", date: "2 days ago", status: "published", helpful: 24 },
];

export default function AdminReviewsManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const totalReviews = 45000;
  const avgRating = 4.3;
  const flaggedReviews = 28;
  const responseRate = 82;

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      published: "bg-green-500/10 text-green-500",
      flagged: "bg-red-500/10 text-red-500",
      under_review: "bg-amber-500/10 text-amber-500",
      hidden: "bg-muted text-muted-foreground"
    };
    return <Badge className={config[status]}>{status.replace("_", " ")}</Badge>;
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} 
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500" />
            Reviews Management
          </h2>
          <p className="text-muted-foreground">Monitor and moderate customer reviews</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{(totalReviews / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{avgRating}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Flag className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Flagged</p>
                <p className="text-2xl font-bold">{flaggedReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{responseRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Reviews</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
            <TabsTrigger value="negative">Negative (1-2★)</TabsTrigger>
            <TabsTrigger value="pending">Pending Response</TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reviews..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>

        <TabsContent value="all" className="mt-4 space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {review.user.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user}</span>
                        {renderStars(review.rating)}
                        {getStatusBadge(review.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.target}</p>
                      <p className="mt-2">{review.comment}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{review.date}</span>
                        <Badge variant="outline">{review.service}</Badge>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {review.helpful} helpful
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Respond</DropdownMenuItem>
                      <DropdownMenuItem>Flag for Review</DropdownMenuItem>
                      <DropdownMenuItem>Hide Review</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
