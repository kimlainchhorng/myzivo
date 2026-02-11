import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, ArrowRight, Sparkles, RefreshCw, PlaneTakeoff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FlightSchedules = () => {
  const schedules = [
    { flight: "DL 1234", route: "NYC → LAX", departure: "08:00", arrival: "11:30", aircraft: "Boeing 737", status: "on_time", gate: "A12" },
    { flight: "UA 5678", route: "LAX → SFO", departure: "10:15", arrival: "11:30", aircraft: "Airbus A320", status: "on_time", gate: "B5" },
    { flight: "AA 9012", route: "MIA → NYC", departure: "14:30", arrival: "17:45", aircraft: "Boeing 777", status: "delayed", gate: "C8" },
    { flight: "B6 3456", route: "BOS → JFK", departure: "16:00", arrival: "17:15", aircraft: "Embraer 190", status: "on_time", gate: "D3" },
    { flight: "SW 7890", route: "DEN → PHX", departure: "18:45", arrival: "20:00", aircraft: "Boeing 737 MAX", status: "cancelled", gate: "-" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "on_time": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", label: "On Time", dot: "bg-emerald-500" };
      case "delayed": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", label: "Delayed", dot: "bg-amber-500" };
      case "cancelled": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", label: "Cancelled", dot: "bg-red-500" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", label: status, dot: "bg-muted-foreground" };
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
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Decorations */}
      <motion.div
        className="absolute -top-2 right-16 pointer-events-none hidden md:block opacity-30"
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center backdrop-blur-sm">
          <Plane className="w-6 h-6 text-sky-400/60" />
        </div>
      </motion.div>
      <motion.div
        className="absolute top-20 right-4 pointer-events-none hidden md:block opacity-30"
        animate={{ y: [0, 10, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-teal-400/15 flex items-center justify-center backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-primary/50" />
        </div>
      </motion.div>
      <motion.div
        className="absolute top-40 right-8 pointer-events-none hidden lg:block opacity-30"
        animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-500/15 to-indigo-500/15 flex items-center justify-center backdrop-blur-sm">
          <PlaneTakeoff className="w-4 h-4 text-sky-400/50" />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-6 w-6 text-sky-500" />
            </motion.div>
            Flight Schedules
          </h1>
          <p className="text-muted-foreground">Today's flight schedule</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button variant="outline" size="sm" className="gap-2 bg-card/50 hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/30 transition-all">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl overflow-hidden">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <Plane className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <CardTitle>Today's Flights</CardTitle>
                  <CardDescription>Live flight status and schedules</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-emerald-500">Live Updates</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="divide-y divide-border/50"
            >
              {schedules.map((flight, index) => {
                const statusConfig = getStatusConfig(flight.status);
                return (
                  <motion.div 
                    key={index}
                    variants={item}
                    className={`flex items-center justify-between p-5 hover:bg-muted/30 transition-colors ${flight.status === 'cancelled' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-xl ${flight.status === 'cancelled' ? 'bg-muted' : 'bg-gradient-to-br from-sky-500 to-blue-600'} shadow-lg`}>
                        <Plane className={`h-6 w-6 ${flight.status === 'cancelled' ? 'text-muted-foreground' : 'text-white'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg">{flight.flight}</span>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${flight.status === 'on_time' ? 'animate-pulse' : ''}`} />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{flight.route}</p>
                        <p className="text-xs text-muted-foreground mt-1">{flight.aircraft}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{flight.departure}</p>
                        <p className="text-xs text-muted-foreground">Departure</p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        <div className="w-16 h-0.5 bg-gradient-to-r from-primary/50 to-primary rounded-full" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{flight.arrival}</p>
                        <p className="text-xs text-muted-foreground">Arrival</p>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-semibold text-primary">{flight.gate}</p>
                        <p className="text-xs text-muted-foreground">Gate</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FlightSchedules;
