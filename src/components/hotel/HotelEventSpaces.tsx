import { Users, Calendar, Utensils, Music, Gift, Sparkles, ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const eventTypes = [
  { icon: Users, title: "Business Meetings", capacity: "2-500 guests", color: "text-blue-400", bgColor: "bg-blue-500/10" },
  { icon: Gift, title: "Weddings", capacity: "50-1000 guests", color: "text-pink-400", bgColor: "bg-pink-500/10" },
  { icon: Music, title: "Celebrations", capacity: "10-200 guests", color: "text-purple-400", bgColor: "bg-purple-500/10" },
  { icon: Utensils, title: "Banquets", capacity: "20-500 guests", color: "text-amber-400", bgColor: "bg-amber-500/10" },
];

const HotelEventSpaces = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-pink-500/20 text-pink-400 border-pink-500/20">
            <Sparkles className="w-3 h-3 mr-1" /> Event Spaces
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Host Your Perfect Event
          </h2>
          <p className="text-muted-foreground">
            From intimate gatherings to grand celebrations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {eventTypes.map((event) => (
            <div
              key={event.title}
              className="p-5 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl hover:border-pink-500/50 transition-all text-center group cursor-pointer"
            >
              <div className={`w-14 h-14 ${event.bgColor} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                <event.icon className={`w-7 h-7 ${event.color}`} />
              </div>
              <h3 className="font-bold mb-1">{event.title}</h3>
              <p className="text-xs text-muted-foreground">{event.capacity}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Grand Ballroom", size: "5,000 sq ft", capacity: "500 guests", rating: 4.9, price: "from $2,500" },
            { name: "Garden Terrace", size: "3,000 sq ft", capacity: "200 guests", rating: 4.8, price: "from $1,500" },
            { name: "Executive Suite", size: "1,000 sq ft", capacity: "50 guests", rating: 4.9, price: "from $800" },
          ].map((space) => (
            <div key={space.name} className="p-5 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{space.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold">{space.rating}</span>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                <span>{space.size}</span>
                <span>•</span>
                <span>{space.capacity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">{space.price}</span>
                <Button size="sm" variant="outline">
                  Inquire <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotelEventSpaces;
