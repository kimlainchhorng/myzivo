import { Users, TrendingUp, Clock, MapPin, Plane, CheckCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const recentSearches = [
  { user: "Alex T.", route: "LAX → JFK", savings: "$127", time: "1 min ago", avatar: "👨" },
  { user: "Maria G.", route: "SFO → LHR", savings: "$342", time: "3 mins ago", avatar: "👩" },
  { user: "James W.", route: "ORD → CDG", savings: "$289", time: "5 mins ago", avatar: "👨‍🦰" },
  { user: "Sophie L.", route: "MIA → CUN", savings: "$95", time: "8 mins ago", avatar: "👩‍🦱" },
  { user: "David K.", route: "SEA → NRT", savings: "$456", time: "12 mins ago", avatar: "👱" },
];

const liveStats = [
  { label: "Travelers searching now", value: 4892, icon: Users },
  { label: "Flights compared/hour", value: 12500, icon: Search },
  { label: "Avg savings found", value: "$187", icon: TrendingUp },
];

const FlightSocialProof = () => {
  const [currentSearch, setCurrentSearch] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentSearch((prev) => (prev + 1) % recentSearches.length);
        setIsVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-sky-500/5 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-green-500/10 text-green-400 border-green-500/20">
            <TrendingUp className="w-3 h-3 mr-1" /> Live Activity
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Join Millions Finding Better Flights
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {liveStats.map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl">
              <stat.icon className="w-6 h-6 text-sky-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-sky-400">
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className={`mx-auto max-w-md transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-4 p-4 bg-card/80 backdrop-blur-xl border border-sky-500/20 rounded-xl shadow-lg">
            <div className="text-3xl">{recentSearches[currentSearch].avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold">Savings Found!</span>
              </div>
              <p className="text-sm">
                <span className="font-semibold">{recentSearches[currentSearch].user}</span>
                {" saved "}
                <span className="text-green-400 font-bold">{recentSearches[currentSearch].savings}</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Plane className="w-3 h-3" />
                {recentSearches[currentSearch].route}
                <span>•</span>
                <Clock className="w-3 h-3" />
                {recentSearches[currentSearch].time}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightSocialProof;
