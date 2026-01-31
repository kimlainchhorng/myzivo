import { Users, TrendingUp, Clock, MapPin, Car, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const recentRentals = [
  { guest: "David K.", car: "Tesla Model 3", location: "LAX", time: "3 mins ago", avatar: "👨" },
  { guest: "Jennifer L.", car: "BMW X5", location: "SFO", time: "7 mins ago", avatar: "👩" },
  { guest: "Robert M.", car: "Jeep Wrangler", location: "MIA", time: "11 mins ago", avatar: "👨‍🦰" },
  { guest: "Amanda S.", car: "Mercedes E-Class", location: "JFK", time: "15 mins ago", avatar: "👩‍🦱" },
  { guest: "Chris P.", car: "Ford Mustang", location: "LAS", time: "18 mins ago", avatar: "👱" },
];

const liveStats = [
  { label: "Renters online now", value: 1523, icon: Users },
  { label: "Rentals in last hour", value: 89, icon: TrendingUp },
  { label: "Avg pickup time", value: "5 mins", icon: Clock },
];

const CarSocialProof = () => {
  const [currentRental, setCurrentRental] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentRental((prev) => (prev + 1) % recentRentals.length);
        setIsVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-emerald-500/5 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-green-500/10 text-green-400 border-green-500/20">
            <TrendingUp className="w-3 h-3 mr-1" /> Live Activity
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Join Thousands of Happy Drivers
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {liveStats.map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl">
              <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-emerald-400">
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className={`mx-auto max-w-md transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-4 p-4 bg-card/80 backdrop-blur-xl border border-emerald-500/20 rounded-xl shadow-lg">
            <div className="text-3xl">{recentRentals[currentRental].avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold">New Rental!</span>
              </div>
              <p className="text-sm">
                <span className="font-semibold">{recentRentals[currentRental].guest}</span>
                {" rented "}
                <span className="text-emerald-400">{recentRentals[currentRental].car}</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                {recentRentals[currentRental].location}
                <span>•</span>
                <Clock className="w-3 h-3" />
                {recentRentals[currentRental].time}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarSocialProof;
