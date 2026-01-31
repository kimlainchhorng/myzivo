import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Plane, Hotel, CarFront, ArrowRight, MapPin, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const tabs = [
  { id: "rides", label: "Rides", icon: Car, color: "text-primary", href: "/ride" },
  { id: "flights", label: "Flights", icon: Plane, color: "text-sky-400", href: "/book-flight" },
  { id: "hotels", label: "Hotels", icon: Hotel, color: "text-amber-400", href: "/book-hotel" },
  { id: "cars", label: "Cars", icon: CarFront, color: "text-emerald-400", href: "/rent-car" },
];

const QuickBookingWidget = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("rides");
  const [destination, setDestination] = useState("");

  const handleQuickBook = () => {
    const tab = tabs.find(t => t.id === activeTab);
    if (tab) {
      navigate(tab.href);
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 border border-border/50 backdrop-blur-xl shadow-2xl">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-muted/30 mb-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all",
                      isActive 
                        ? "bg-background shadow-lg" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive && tab.color)} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Form */}
            <div className="space-y-4">
              {activeTab === "rides" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="Pickup location" 
                      className="pl-12 h-12 rounded-xl"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input 
                      placeholder="Where to?" 
                      className="pl-12 h-12 rounded-xl"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "flights" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground rotate-[-45deg]" />
                    <Input placeholder="From" className="pl-12 h-12 rounded-xl" />
                  </div>
                  <div className="relative">
                    <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400 rotate-45" />
                    <Input placeholder="To" className="pl-12 h-12 rounded-xl" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Depart" className="pl-12 h-12 rounded-xl" />
                  </div>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Travelers" className="pl-12 h-12 rounded-xl" />
                  </div>
                </div>
              )}

              {activeTab === "hotels" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative md:col-span-2">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                    <Input placeholder="Destination or hotel name" className="pl-12 h-12 rounded-xl" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Check-in" className="pl-12 h-12 rounded-xl" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Check-out" className="pl-12 h-12 rounded-xl" />
                  </div>
                </div>
              )}

              {activeTab === "cars" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative md:col-span-2">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <Input placeholder="Pickup location" className="pl-12 h-12 rounded-xl" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Pickup date" className="pl-12 h-12 rounded-xl" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Return date" className="pl-12 h-12 rounded-xl" />
                  </div>
                </div>
              )}

              <Button 
                onClick={handleQuickBook}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-teal-400 hover:opacity-90 text-white font-bold"
              >
                Search {tabs.find(t => t.id === activeTab)?.label}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickBookingWidget;
