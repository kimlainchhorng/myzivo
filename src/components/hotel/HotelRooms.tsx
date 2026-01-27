import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BedDouble, Plus, Edit, Users, Sparkles, Wifi, Wind, Tv, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const HotelRooms = () => {
  const rooms = [
    { id: 1, name: "Standard Room", type: "standard", beds: "1 King Bed", maxGuests: 2, price: 129, available: 8, total: 15, amenities: ["wifi", "ac", "tv"], emoji: "🛏️" },
    { id: 2, name: "Deluxe Room", type: "deluxe", beds: "1 King Bed", maxGuests: 2, price: 179, available: 5, total: 10, amenities: ["wifi", "ac", "tv"], emoji: "🛋️" },
    { id: 3, name: "Suite", type: "suite", beds: "1 King + Sofa Bed", maxGuests: 4, price: 299, available: 2, total: 5, amenities: ["wifi", "ac", "tv"], emoji: "🌟" },
    { id: 4, name: "Family Room", type: "family", beds: "2 Queen Beds", maxGuests: 4, price: 229, available: 3, total: 8, amenities: ["wifi", "ac", "tv"], emoji: "👨‍👩‍👧‍👦" },
    { id: 5, name: "Presidential Suite", type: "presidential", beds: "1 King Bed", maxGuests: 2, price: 599, available: 1, total: 2, amenities: ["wifi", "ac", "tv"], emoji: "👑" },
  ];

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "standard": return { bg: "bg-muted", gradient: "from-slate-500 to-slate-600", glow: "shadow-slate-500/20" };
      case "deluxe": return { bg: "bg-blue-500/10", gradient: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/20" };
      case "suite": return { bg: "bg-amber-500/10", gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20" };
      case "family": return { bg: "bg-emerald-500/10", gradient: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/20" };
      case "presidential": return { bg: "bg-purple-500/10", gradient: "from-purple-500 to-pink-600", glow: "shadow-purple-500/20" };
      default: return { bg: "bg-muted", gradient: "from-slate-500 to-slate-600", glow: "shadow-slate-500/20" };
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
    <div className="space-y-6 relative">
      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-0 right-12 text-3xl pointer-events-none opacity-20 hidden lg:block"
      >
        🛏️
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        className="absolute top-24 right-0 text-2xl pointer-events-none opacity-15 hidden lg:block"
      >
        🔑
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-6 w-6 text-blue-500" />
            </motion.div>
            Room Management
          </h1>
          <p className="text-muted-foreground">Manage room types and availability</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-primary to-teal-400 shadow-lg hover:shadow-xl transition-shadow rounded-xl">
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
              <Card className={`border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl ${typeConfig.glow} transition-all duration-300 overflow-hidden group`}>
                <div className={`h-1.5 bg-gradient-to-r ${typeConfig.gradient}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`p-3 rounded-xl bg-gradient-to-br ${typeConfig.gradient} shadow-lg`}
                    >
                      <BedDouble className="h-6 w-6 text-white" />
                    </motion.div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{room.emoji}</span>
                      <Badge className={`${typeConfig.bg} capitalize`}>{room.type}</Badge>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-xl mb-1">{room.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{room.beds}</p>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                      <Users className="h-4 w-4" />
                      <span>Max {room.maxGuests}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-muted/50">
                        <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="p-1.5 rounded-md bg-muted/50">
                        <Wind className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="p-1.5 rounded-md bg-muted/50">
                        <Tv className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-2xl font-bold flex items-center">
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                      <span className="text-emerald-500">{room.price}</span>
                      <span className="text-sm font-normal text-muted-foreground ml-1">/night</span>
                    </p>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${room.available > 3 ? 'bg-emerald-500/10 text-emerald-500' : room.available > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                      {room.available}/{room.total}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        className={`h-2.5 rounded-full bg-gradient-to-r ${typeConfig.gradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${occupancyPercent}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{Math.round(occupancyPercent)}% occupied</p>
                  </div>
                  
                  <Button variant="outline" className="w-full gap-2 rounded-xl group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-teal-400 group-hover:text-white group-hover:border-transparent transition-all">
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
