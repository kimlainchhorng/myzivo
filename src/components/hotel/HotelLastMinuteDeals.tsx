import { Clock, Zap, TrendingDown, ArrowRight, Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const deals = [
  { id: 1, name: "The Ritz Carlton", location: "Miami Beach", image: "🏨", originalPrice: 599, discountPrice: 299, discount: 50, rating: 4.9, timeLeft: 7200, rooms: 3 },
  { id: 2, name: "Four Seasons Resort", location: "Maui", image: "🌴", originalPrice: 799, discountPrice: 449, discount: 44, rating: 4.8, timeLeft: 3600, rooms: 1 },
  { id: 3, name: "Waldorf Astoria", location: "New York", image: "🗽", originalPrice: 699, discountPrice: 399, discount: 43, rating: 4.9, timeLeft: 5400, rooms: 2 },
  { id: 4, name: "Mandarin Oriental", location: "Las Vegas", image: "🎰", originalPrice: 499, discountPrice: 249, discount: 50, rating: 4.7, timeLeft: 1800, rooms: 5 },
];

const HotelLastMinuteDeals = () => {
  const [timeLefts, setTimeLefts] = useState<Record<number, number>>({});

  useEffect(() => {
    const initial: Record<number, number> = {};
    deals.forEach(d => initial[d.id] = d.timeLeft);
    setTimeLefts(initial);

    const interval = setInterval(() => {
      setTimeLefts(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[Number(key)] > 0) {
            updated[Number(key)] -= 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="mb-3 bg-red-500/10 text-red-400 border-red-500/20 animate-pulse">
              <Zap className="w-3 h-3 mr-1" /> Flash Sale
            </Badge>
            <h2 className="text-2xl md:text-3xl font-display font-bold">
              Last Minute Deals
            </h2>
            <p className="text-muted-foreground">
              Exclusive savings on tonight's stays
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            View All Deals <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="group relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all"
            >
              {/* Urgency Banner */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs py-1.5 px-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono font-bold">{formatTime(timeLefts[deal.id] || 0)}</span>
                </div>
                <span className="font-semibold">{deal.rooms} rooms left!</span>
              </div>

              <div className="p-4 pt-10">
                <div className="text-5xl text-center mb-3">{deal.image}</div>
                <h3 className="font-bold text-center mb-1">{deal.name}</h3>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-3">
                  <MapPin className="w-3 h-3" />
                  {deal.location}
                </div>

                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{deal.rating}</span>
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-muted-foreground line-through">${deal.originalPrice}</span>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {deal.discount}% OFF
                    </Badge>
                  </div>
                  <span className="text-2xl font-bold text-primary">${deal.discountPrice}</span>
                  <span className="text-muted-foreground">/night</span>
                </div>

                <Button className="w-full" size="sm">
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotelLastMinuteDeals;
