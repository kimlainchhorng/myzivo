import { Bookmark, Bell, Trash2, ArrowRight, Plane, Hotel, Car, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const savedSearches = [
  {
    id: 1,
    type: "flight",
    title: "NYC → Paris",
    details: "Round trip • 2 adults • Economy",
    dates: "Mar 15 - Mar 22, 2024",
    currentPrice: 649,
    previousPrice: 720,
    priceChange: -10,
    alerts: true,
  },
  {
    id: 2,
    type: "hotel",
    title: "Hotels in Tokyo",
    details: "4+ stars • Central location",
    dates: "Apr 1 - Apr 7, 2024",
    currentPrice: 189,
    previousPrice: 175,
    priceChange: 8,
    alerts: true,
  },
  {
    id: 3,
    type: "car",
    title: "SUV in Los Angeles",
    details: "LAX Airport pickup",
    dates: "May 10 - May 15, 2024",
    currentPrice: 65,
    previousPrice: 65,
    priceChange: 0,
    alerts: false,
  },
];

const typeIcons = {
  flight: Plane,
  hotel: Hotel,
  car: Car,
};

const SavedSearches = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-violet-500/20 text-violet-400 border-violet-500/20">
            <Bookmark className="w-3 h-3 mr-1" /> Saved Searches
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Track Your Travel Plans
          </h2>
          <p className="text-muted-foreground">
            Get price alerts and never miss a deal
          </p>
        </div>

        <div className="space-y-4">
          {savedSearches.map((search) => {
            const TypeIcon = typeIcons[search.type as keyof typeof typeIcons];

            return (
              <div
                key={search.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl hover:border-violet-500/30 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TypeIcon className="w-6 h-6 text-violet-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg">{search.title}</h3>
                  <p className="text-sm text-muted-foreground">{search.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">{search.dates}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">${search.currentPrice}</span>
                      {search.priceChange !== 0 && (
                        <Badge className={`${
                          search.priceChange < 0
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        } border-0`}>
                          {search.priceChange < 0 ? (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          )}
                          {Math.abs(search.priceChange)}%
                        </Badge>
                      )}
                    </div>
                    {search.previousPrice !== search.currentPrice && (
                      <p className="text-xs text-muted-foreground line-through">
                        ${search.previousPrice}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <Switch checked={search.alerts} className="data-[state=checked]:bg-violet-500 touch-manipulation" />
                    </div>
                    <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-red-400 rounded-xl active:scale-90 transition-all duration-200 touch-manipulation">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-xl shadow-md active:scale-[0.97] transition-all duration-200 touch-manipulation">
                    Search <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Save any search to track prices and get instant alerts when they drop
          </p>
        </div>
      </div>
    </section>
  );
};

export default SavedSearches;
