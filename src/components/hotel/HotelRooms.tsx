import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BedDouble, Plus, Edit, Users, Sparkles, Wifi, Wind, Tv } from "lucide-react";
import { motion } from "framer-motion";

const HotelRooms = () => {
  const rooms = [
    { id: 1, name: "Standard Room", type: "standard", beds: "1 King Bed", maxGuests: 2, price: 129, available: 8, total: 15, amenities: ["wifi", "ac", "tv"] },
    { id: 2, name: "Deluxe Room", type: "deluxe", beds: "1 King Bed", maxGuests: 2, price: 179, available: 5, total: 10, amenities: ["wifi", "ac", "tv"] },
    { id: 3, name: "Suite", type: "suite", beds: "1 King + Sofa Bed", maxGuests: 4, price: 299, available: 2, total: 5, amenities: ["wifi", "ac", "tv"] },
    { id: 4, name: "Family Room", type: "family", beds: "2 Queen Beds", maxGuests: 4, price: 229, available: 3, total: 8, amenities: ["wifi", "ac", "tv"] },
    { id: 5, name: "Presidential Suite", type: "presidential", beds: "1 King Bed", maxGuests: 2, price: 599, available: 1, total: 2, amenities: ["wifi", "ac", "tv"] },
  ];

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "standard": return { bg: "bg-muted", gradient: "from-slate-500 to-slate-600" };
      case "deluxe": return { bg: "bg-blue-500/10", gradient: "from-blue-500 to-indigo-600" };
      case "suite": return { bg: "bg-amber-500/10", gradient: "from-amber-500 to-orange-600" };
      case "family": return { bg: "bg-emerald-500/10", gradient: "from-emerald-500 to-green-600" };
      case "presidential": return { bg: "bg-purple-500/10", gradient: "from-purple-500 to-pink-600" };
      default: return { bg: "bg-muted", gradient: "from-slate-500 to-slate-600" };
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Room Management
          </h1>
          <p className="text-muted-foreground">Manage room types and availability</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-primary to-teal-400 shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="h-4 w-4" />
          Add Room Type
        </Button>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {rooms.map((room) => {
          const typeConfig = getTypeConfig(room.type);
          const occupancyPercent = ((room.total - room.available) / room.total) * 100;
          
          return (
            <motion.div key={room.id} variants={item}>
              <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${typeConfig.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                      <BedDouble className="h-6 w-6 text-white" />
                    </div>
                    <Badge className={`${typeConfig.bg} capitalize`}>{room.type}</Badge>
                  </div>
                  
                  <h3 className="font-bold text-xl mb-1">{room.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{room.beds}</p>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Max {room.maxGuests}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      <Wind className="h-4 w-4 text-muted-foreground" />
                      <Tv className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-2xl font-bold">
                      ${room.price}
                      <span className="text-sm font-normal text-muted-foreground">/night</span>
                    </p>
                    <span className={`text-sm font-medium ${room.available > 3 ? 'text-emerald-500' : room.available > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                      {room.available}/{room.total} available
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div 
                        className={`h-2 rounded-full bg-gradient-to-r ${typeConfig.gradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${occupancyPercent}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{Math.round(occupancyPercent)}% occupied</p>
                  </div>
                  
                  <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Edit className="h-4 w-4" />
                    Edit Room
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default HotelRooms;
