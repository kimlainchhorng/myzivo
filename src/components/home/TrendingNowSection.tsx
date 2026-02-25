import { useState } from "react";
import { TrendingUp, MapPin, Calendar, Users, ArrowRight, Flame, Star, Landmark, Palmtree, Plane, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const trendingItems = [
  {
    id: 1,
    type: "destination",
    title: "Tokyo, Japan",
    subtitle: "Cherry Blossom Season",
    icon: Landmark,
    discount: "25% OFF",
    rating: 4.9,
    reviews: 2840,
    price: "From $899",
    tag: "Most Popular",
  },
  {
    id: 2,
    type: "hotel",
    title: "Maldives Resort",
    subtitle: "Overwater Villas",
    icon: Palmtree,
    discount: "30% OFF",
    rating: 4.8,
    reviews: 1562,
    price: "From $450/night",
    tag: "Trending",
  },
  {
    id: 3,
    type: "experience",
    title: "Paris City Tour",
    subtitle: "Skip-the-line Eiffel Tower",
    icon: Landmark,
    discount: "15% OFF",
    rating: 4.9,
    reviews: 3210,
    price: "From $129",
    tag: "Best Seller",
  },
  {
    id: 4,
    type: "flight",
    title: "NYC → London",
    subtitle: "Direct Flights",
    icon: Plane,
    discount: "20% OFF",
    rating: 4.7,
    reviews: 890,
    price: "From $399",
    tag: "Flash Deal",
  },
];

const categories = ["All", "Destinations", "Hotels", "Flights", "Experiences"];

const TrendingNowSection = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
              <Flame className="w-4 h-4" />
              Hot Right Now
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              Trending <span className="text-primary">Deals</span>
            </h2>
          </div>
          
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 overflow-hidden hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image Area */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-teal-500/30 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-primary/80" />
                </div>
                
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">
                  {item.discount}
                </div>
                
                {/* Tag Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium">
                  {item.tag}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-all duration-200">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{item.subtitle}</p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="font-medium">{item.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({item.reviews.toLocaleString()} reviews)
                  </span>
                </div>
                
                {/* Price & CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">{item.price}</div>
                  <Button size="sm" variant="ghost" className="gap-1">
                    View <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <Button variant="outline" size="lg" className="rounded-full px-8">
            View All Trending Deals
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingNowSection;
