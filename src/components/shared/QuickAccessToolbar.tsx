import { Plane, Hotel, Car, Bookmark, Clock, Gift, Settings, HelpCircle, User, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const quickLinks = [
  { icon: Plane, label: "Flights", path: "/flight-booking", color: "text-sky-400" },
  { icon: Hotel, label: "Hotels", path: "/hotel-booking", color: "text-amber-400" },
  { icon: Car, label: "Cars", path: "/car-rental", color: "text-emerald-400" },
  { icon: Bookmark, label: "Saved", path: "#", color: "text-violet-400", badge: "3" },
  { icon: Clock, label: "History", path: "#", color: "text-pink-400" },
  { icon: Gift, label: "Rewards", path: "#", color: "text-orange-400", badge: "New" },
];

const QuickAccessToolbar = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/50 py-2 px-4 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {quickLinks.slice(0, 5).map((link) => (
           <button
            key={link.label}
            onClick={() => navigate(link.path)}
            className="relative flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted transition-all touch-manipulation active:scale-90 min-w-[48px] min-h-[48px]"
          >
            <div className="relative">
              <link.icon className={`w-5 h-5 ${link.color}`} />
              {link.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center">
                  {link.badge === "New" ? "!" : link.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{link.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessToolbar;
