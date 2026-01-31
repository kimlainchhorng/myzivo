import { Users, TrendingUp, Clock, MapPin, Star, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const recentBookings = [
  { guest: "Sarah M.", hotel: "Grand Hyatt", location: "New York", time: "2 mins ago", avatar: "👩" },
  { guest: "Michael R.", hotel: "Marriott Resort", location: "Miami", time: "5 mins ago", avatar: "👨" },
  { guest: "Emma L.", hotel: "Four Seasons", location: "Los Angeles", time: "8 mins ago", avatar: "👩‍🦰" },
  { guest: "James K.", hotel: "Hilton Garden", location: "Chicago", time: "12 mins ago", avatar: "👨‍🦱" },
  { guest: "Lisa P.", hotel: "Ritz Carlton", location: "Boston", time: "15 mins ago", avatar: "👱‍♀️" },
];

const liveStats = [
  { label: "Travelers online now", value: 2847, icon: Users },
  { label: "Bookings in last hour", value: 156, icon: TrendingUp },
  { label: "Avg booking time", value: "3 mins", icon: Clock },
];

const HotelSocialProof = () => {
  const [currentBooking, setCurrentBooking] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentBooking((prev) => (prev + 1) % recentBookings.length);
        setIsVisible(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-green-500/10 text-green-400 border-green-500/20">
            <TrendingUp className="w-3 h-3 mr-1" /> Live Activity
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Join Thousands of Happy Travelers
          </h2>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {liveStats.map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl">
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Booking Toast */}
        <div className={`mx-auto max-w-md transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-4 p-4 bg-card/80 backdrop-blur-xl border border-primary/20 rounded-xl shadow-lg">
            <div className="text-3xl">{recentBookings[currentBooking].avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold">New Booking!</span>
              </div>
              <p className="text-sm">
                <span className="font-semibold">{recentBookings[currentBooking].guest}</span>
                {" booked "}
                <span className="text-primary">{recentBookings[currentBooking].hotel}</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                {recentBookings[currentBooking].location}
                <span>•</span>
                <Clock className="w-3 h-3" />
                {recentBookings[currentBooking].time}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Feed */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
          {recentBookings.map((booking, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl border ${
                index === currentBooking
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card/30 border-border/30"
              } transition-all`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{booking.avatar}</span>
                <span className="text-xs font-medium truncate">{booking.guest}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{booking.hotel}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="w-2.5 h-2.5" />
                {booking.location}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotelSocialProof;
