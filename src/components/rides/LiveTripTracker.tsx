/**
 * LiveTripTracker — Enhanced real-time trip tracking experience
 * Route progress, share ETA, arrival notifications, trip timeline
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Phone, MessageSquare, Share2, Shield, Star, Navigation, Clock, MapPin, Bell, Copy, Route, Zap, ChevronUp, ChevronDown, Music, Thermometer, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tripPhases = [
  { id: "driver_assigned", label: "Driver assigned", time: "2:14 PM", done: true },
  { id: "en_route", label: "Driver en route", time: "2:15 PM", done: true },
  { id: "arrived", label: "Arrived at pickup", time: "", done: false },
  { id: "trip_started", label: "Trip started", time: "", done: false },
  { id: "destination", label: "Arrived at destination", time: "", done: false },
];

export default function LiveTripTracker() {
  const [phase, setPhase] = useState(1);
  const [countdown, setCountdown] = useState(240);
  const [carProgress, setCarProgress] = useState(20);
  const [expanded, setExpanded] = useState(false);
  const [shareETA, setShareETA] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    const p = setInterval(() => setCarProgress(c => Math.min(95, c + 0.3)), 300);
    return () => { clearInterval(t); clearInterval(p); };
  }, []);

  // Auto-advance phases
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 8000);
    const t2 = setTimeout(() => setPhase(3), 16000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  const phaseLabels = ["En Route to You", "Driver Has Arrived", "On the Way", "Almost There!"];
  const phaseColors = ["text-primary", "text-amber-500", "text-emerald-500", "text-primary"];

  return (
    <div className="space-y-4">
      {/* Map with animated route */}
      <div className="relative h-48 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40 overflow-hidden shadow-lg">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 8 82 C 20 70, 35 55, 50 45 C 65 35, 80 28, 92 18" stroke="hsl(var(--primary))" strokeWidth="0.6" strokeDasharray="2 2" fill="none" opacity={0.3} />
          <path d="M 8 82 C 20 70, 35 55, 50 45 C 65 35, 80 28, 92 18" stroke="hsl(var(--primary))" strokeWidth="1.2" fill="none" strokeDasharray={`${carProgress} 200`} opacity={0.9} />
        </svg>

        {/* Pickup */}
        <div className="absolute bottom-4 left-[6%] flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-card shadow-lg" />
          <span className="text-[7px] font-bold text-muted-foreground mt-1 bg-card/80 px-1 rounded">Pickup</span>
        </div>

        {/* Dropoff */}
        <div className="absolute top-3 right-[6%] flex flex-col items-center">
          <MapPin className="w-5 h-5 text-red-500 drop-shadow-lg" />
          <span className="text-[7px] font-bold text-muted-foreground mt-0.5 bg-card/80 px-1 rounded">Dropoff</span>
        </div>

        {/* Animated car */}
        <motion.div
          className="absolute z-10"
          style={{
            left: `${8 + (carProgress / 100) * 84}%`,
            top: `${82 - (carProgress / 100) * 64}%`,
          }}
          animate={{ y: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-xl border-2 border-primary-foreground">
              <Car className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 rounded-full bg-primary/30" />
          </div>
        </motion.div>

        {/* ETA overlay */}
        <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm rounded-xl px-3 py-2 border border-border/30 shadow-md">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-xl font-black text-foreground font-mono">{mins}:{secs.toString().padStart(2, "0")}</span>
          </div>
          <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">ETA</span>
        </div>

        {/* Live badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-red-500/90 text-white border-0 text-[9px] font-bold gap-1 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </Badge>
        </div>
      </div>

      {/* Status + driver */}
      <div className="rounded-2xl bg-card border border-border/40 overflow-hidden">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className={cn("text-sm font-bold", phaseColors[Math.min(phase, 3)])}>{phaseLabels[Math.min(phase, 3)]}</span>
            <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary bg-primary/5">
              <Navigation className="w-2.5 h-2.5 mr-1" /> Tracking
            </Badge>
          </div>
          <Progress value={20 + phase * 22} className="h-1.5" />
        </div>

        {/* Driver */}
        <div className="px-4 py-3 flex items-center gap-3">
          <Avatar className="w-13 h-13 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">MT</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Marcus T.</span>
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold">4.92</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground">Silver Camry</span>
              <Badge variant="outline" className="text-[9px] font-bold h-4">ABC 1234</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toast.info("Calling driver...")}
              className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
              aria-label="Call driver"
            >
              <Phone className="w-4 h-4 text-emerald-500" />
            </button>
            <button
              onClick={() => toast.info("Opening chat...")}
              className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
              aria-label="Message driver"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-4 pb-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs rounded-xl"
            onClick={() => {
              navigator.clipboard.writeText(`My ZIVO ride is ${mins} min away! Track: hizovo.com/track/demo`);
              toast.success("ETA link copied to clipboard!");
            }}
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share ETA
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/5"
            onClick={() => toast.info("Safety center opened")}
          >
            <Shield className="w-3.5 h-3.5 mr-1.5" /> Safety
          </Button>
        </div>

        {/* Trip timeline toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-2.5 border-t border-border/30 text-[11px] font-bold text-muted-foreground hover:bg-muted/20 transition-colors min-h-[44px]"
        >
          {expanded ? "Hide timeline" : "Trip timeline"}
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-0">
                {tripPhases.map((tp, i) => {
                  const isDone = i <= phase;
                  return (
                    <div key={tp.id} className="flex items-start gap-3 relative">
                      {i < tripPhases.length - 1 && (
                        <div className={cn("absolute left-[9px] top-5 w-0.5 h-full", isDone ? "bg-primary" : "bg-border/40")} />
                      )}
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 relative z-10",
                        isDone ? "bg-primary" : "bg-muted border border-border/40"
                      )}>
                        {isDone ? <CheckCircle className="w-3 h-3 text-primary-foreground" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                      </div>
                      <div className="pb-4">
                        <p className={cn("text-xs font-medium", isDone ? "text-foreground" : "text-muted-foreground/50")}>{tp.label}</p>
                        {tp.time && <p className="text-[10px] text-muted-foreground">{tp.time}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ride preferences active */}
      <div className="rounded-2xl bg-card border border-border/40 p-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Active Preferences</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: Music, label: "Music Off" },
            { icon: Thermometer, label: "Cool AC" },
            { icon: Route, label: "Direct Route" },
          ].map(pref => (
            <Badge key={pref.label} variant="outline" className="text-[10px] font-bold gap-1 py-1 px-2.5 border-primary/20 text-primary bg-primary/5">
              <pref.icon className="w-3 h-3" /> {pref.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
