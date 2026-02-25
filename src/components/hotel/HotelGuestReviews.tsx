import { Star, ThumbsUp, Quote, Verified, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const reviews = [
  {
    id: 1,
    name: "Alexandra M.",
    location: "New York, USA",
    avatar: "AM",
    rating: 5,
    date: "2 weeks ago",
    title: "Absolutely stunning property!",
    review: "The attention to detail was remarkable. From the moment we arrived, the staff made us feel like royalty. The room was immaculate and the view was breathtaking.",
    helpful: 24,
    verified: true,
    stayed: "Deluxe Suite",
  },
  {
    id: 2,
    name: "Marco R.",
    location: "Rome, Italy",
    avatar: "MR",
    rating: 5,
    date: "1 month ago",
    title: "Best hotel experience ever",
    review: "I've traveled extensively and this ranks among the top hotels I've stayed at. The spa was world-class and the restaurant exceeded expectations.",
    helpful: 18,
    verified: true,
    stayed: "Executive Room",
  },
  {
    id: 3,
    name: "Yuki T.",
    location: "Tokyo, Japan",
    avatar: "YT",
    rating: 4,
    date: "3 weeks ago",
    title: "Great location, wonderful service",
    review: "Perfect location for exploring the city. The concierge was incredibly helpful with restaurant recommendations. Will definitely return!",
    helpful: 12,
    verified: true,
    stayed: "Standard Room",
  },
];

const stats = [
  { label: "Cleanliness", score: 9.4 },
  { label: "Comfort", score: 9.2 },
  { label: "Location", score: 9.6 },
  { label: "Service", score: 9.5 },
  { label: "Value", score: 8.8 },
];

const HotelGuestReviews = () => {
  const overallScore = (stats.reduce((acc, s) => acc + s.score, 0) / stats.length).toFixed(1);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Guest Reviews</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            What Our Guests Say
          </h2>
          <p className="text-muted-foreground">Real reviews from verified guests</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Overview */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm sticky top-24 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-3">
                  <span className="text-3xl font-bold text-white">{overallScore}</span>
                </div>
                <p className="font-bold text-lg">Exceptional</p>
                <p className="text-sm text-muted-foreground">Based on 2,847 reviews</p>
              </div>

              <div className="space-y-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">{stat.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                        style={{ width: `${stat.score * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{stat.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className={cn(
                  "p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                  "animate-in fade-in slide-in-from-right-4"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                      {review.avatar}
                    </div>
                    {review.verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Verified className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold">{review.name}</h4>
                      <span className="text-xs text-muted-foreground">• {review.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span>•</span>
                      <span>{review.date}</span>
                    </div>
                  </div>
                </div>

                <h5 className="font-bold mb-2">{review.title}</h5>
                <p className="text-sm text-muted-foreground mb-4">{review.review}</p>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Stayed in: {review.stayed}</span>
                  </div>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelGuestReviews;
