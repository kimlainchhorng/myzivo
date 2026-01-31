import { Star, ThumbsUp, MessageSquare, ChevronRight, Verified, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const reviews = [
  {
    id: 1,
    author: "Sarah M.",
    avatar: "👩",
    rating: 5,
    route: "NYC → Paris",
    date: "2 days ago",
    title: "Amazing flight experience!",
    content: "Smooth booking, great prices, and the seat selection tool was super helpful. Will definitely use again!",
    helpful: 24,
    verified: true,
  },
  {
    id: 2,
    author: "James L.",
    avatar: "👨",
    rating: 5,
    route: "LAX → Tokyo",
    date: "1 week ago",
    title: "Best prices I found anywhere",
    content: "Compared prices across multiple sites and ZIVO had the best deals. Price lock feature saved me $200!",
    helpful: 18,
    verified: true,
  },
  {
    id: 3,
    author: "Emma K.",
    avatar: "👩‍🦰",
    rating: 4,
    route: "London → Dubai",
    date: "2 weeks ago",
    title: "Great service overall",
    content: "Easy to use platform with lots of filter options. Found exactly what I was looking for.",
    helpful: 12,
    verified: true,
  },
];

const ratingBreakdown = [
  { stars: 5, percentage: 78 },
  { stars: 4, percentage: 15 },
  { stars: 3, percentage: 5 },
  { stars: 2, percentage: 1 },
  { stars: 1, percentage: 1 },
];

const FlightReviewsWidget = () => {
  const [helpfulClicked, setHelpfulClicked] = useState<number[]>([]);

  const handleHelpful = (id: number) => {
    if (!helpfulClicked.includes(id)) {
      setHelpfulClicked([...helpfulClicked, id]);
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < count ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
      />
    ));
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-amber-500/20 text-amber-400 border-amber-500/20">
            <MessageSquare className="w-3 h-3 mr-1" /> Customer Reviews
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            What Travelers Say
          </h2>
          <p className="text-muted-foreground">
            Real experiences from verified customers
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Rating Summary */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
            <div className="text-center mb-6">
              <p className="text-5xl font-display font-bold mb-1">4.9</p>
              <div className="flex justify-center gap-1 mb-2">
                {renderStars(5)}
              </div>
              <p className="text-sm text-muted-foreground">Based on 15,842 reviews</p>
            </div>

            <div className="space-y-3">
              {ratingBreakdown.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-8">{item.stars}★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-10">{item.percentage}%</span>
                </div>
              ))}
            </div>

            <Button className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500">
              Write a Review
            </Button>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{review.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{review.author}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                          <Verified className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                      <span>•</span>
                      <span>{review.route}</span>
                      <span>•</span>
                      <span>{review.date}</span>
                    </div>
                    <h4 className="font-medium mb-1">{review.title}</h4>
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => handleHelpful(review.id)}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          helpfulClicked.includes(review.id)
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Helpful ({review.helpful + (helpfulClicked.includes(review.id) ? 1 : 0)})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full">
              View All Reviews <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightReviewsWidget;
