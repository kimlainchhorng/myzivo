/**
 * RideBookingHome — Uber/Lyft-style ride booking with map-first layout
 * Route / Price / Pay tabs, "Where to?" prompt, smart feature toggles
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Navigation, Route, DollarSign, CreditCard,
  Clock, Dog, Accessibility, Music, ChevronRight,
  ArrowLeft, Home, Building2, Plane, Car, Crown,
  Users, Shield, Zap, CheckCircle, Sparkles, History,
  ChevronDown, Target
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Data ─── */
const savedPlaces = [
  { id: "home", name: "Home", address: "123 Main St, Apt 4B", icon: Home, color: "text-emerald-500" },
  { id: "work", name: "Work", address: "400 Tech Blvd, Floor 12", icon: Building2, color: "text-sky-500" },
  { id: "airport", name: "Airport", address: "JFK Terminal 4", icon: Plane, color: "text-violet-500" },
];

const recentDestinations = [
  { id: "1", address: "Downtown Gym, 55 Fitness Ave", time: "Yesterday" },
  { id: "2", address: "Grand Hotel, 200 Park Ave", time: "3 days ago" },
  { id: "3", address: "Central Mall, 88 Shopping Dr", time: "Last week" },
];

const autocompleteResults = [
  { id: "a1", primary: "Downtown Convention Center", secondary: "100 Convention Way" },
  { id: "a2", primary: "Downtown Gym & Fitness", secondary: "55 Fitness Ave" },
  { id: "a3", primary: "Downtown Medical Center", secondary: "200 Health Blvd" },
];

const vehicleOptions = [
  { id: "economy", name: "Economy", eta: "3 min", price: "$8–12", icon: Car, capacity: 4 },
  { id: "premium", name: "Premium", eta: "5 min", price: "$15–22", icon: Crown, capacity: 4 },
  { id: "xl", name: "XL", eta: "7 min", price: "$18–28", icon: Users, capacity: 6 },
  { id: "elite", name: "Elite", eta: "8 min", price: "$35–55", icon: Shield, capacity: 4 },
];

const paymentMethods = [
  { id: "visa", label: "Visa •••• 4242", icon: CreditCard },
  { id: "apple", label: "Apple Pay", icon: CreditCard },
  { id: "wallet", label: "ZIVO Wallet — $24.50", icon: DollarSign },
];

type MainTab = "route" | "price" | "pay";
type ProfileMode = "personal" | "business";
type ViewStep = "home" | "search" | "vehicle" | "confirm";

/* ─── Nearby Drivers Animation ─── */
function NearbyDrivers() {
  const [drivers] = useState([
    { id: 1, x: 30, y: 45 },
    { id: 2, x: 55, y: 35 },
    { id: 3, x: 20, y: 60 },
    { id: 4, x: 70, y: 50 },
  ]);

  return (
    <>
      {drivers.map((d) => (
        <motion.div
          key={d.id}
          className="absolute z-10"
          animate={{
            left: `${d.x + (Math.random() - 0.5) * 4}%`,
            top: `${d.y + (Math.random() - 0.5) * 4}%`,
          }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
        >
          <div className="w-7 h-7 rounded-full bg-primary border-2 border-card shadow-lg flex items-center justify-center">
            <Car className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        </motion.div>
      ))}
    </>
  );
}

/* ─── Map Placeholder ─── */
function MapArea({ onBack }: { onBack?: () => void }) {
  return (
    <div className="relative w-full h-[42vh] min-h-[260px] bg-gradient-to-br from-muted/60 via-muted/30 to-muted/10 overflow-hidden">
      {/* Grid streets */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 100" preserveAspectRatio="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 8.5} x2="100" y2={i * 8.5} stroke="currentColor" strokeWidth="0.4" className="text-foreground" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 8.5} y1="0" x2={i * 8.5} y2="100" stroke="currentColor" strokeWidth="0.4" className="text-foreground" />
        ))}
        {/* Diagonal roads */}
        <line x1="10" y1="90" x2="80" y2="15" stroke="currentColor" strokeWidth="0.6" className="text-foreground" />
        <line x1="30" y1="95" x2="95" y2="30" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
      </svg>

      {/* Fake labels */}
      <span className="absolute text-[9px] font-bold text-muted-foreground/40 tracking-wider" style={{ left: "8%", top: "30%" }}>DOWNTOWN</span>
      <span className="absolute text-[8px] font-medium text-muted-foreground/30" style={{ left: "55%", top: "20%" }}>MIDTOWN</span>
      <span className="absolute text-[8px] font-medium text-muted-foreground/30" style={{ left: "15%", top: "65%" }}>FINANCIAL DISTRICT</span>
      <span className="absolute text-[8px] font-medium text-muted-foreground/30" style={{ left: "60%", top: "70%" }}>EAST SIDE</span>

      {/* Nearby drivers */}
      <NearbyDrivers />

      {/* Center pickup marker with pulse */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute inset-0 w-12 h-12 -m-1.5 rounded-full bg-primary/20"
        />
        <div className="w-9 h-9 rounded-full bg-primary border-[3px] border-card shadow-xl flex items-center justify-center">
          <Target className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
        <button className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm border border-border/30 shadow-sm flex items-center justify-center text-foreground font-bold text-sm hover:bg-card">+</button>
        <button className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm border border-border/30 shadow-sm flex items-center justify-center text-foreground font-bold text-sm hover:bg-card">−</button>
      </div>

      {/* ZIVO badge */}
      <div className="absolute top-3 right-3 z-20">
        <div className="w-8 h-8 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-md">
          <Navigation className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>

      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm border border-border/30 shadow-sm flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
      )}
    </div>
  );
}

/* ─── Feature Toggle ─── */
function FeatureToggle({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  checked,
  onCheckedChange,
}: {
  icon: any;
  iconColor: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/20 last:border-0">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      <div className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
        <Icon className={cn("w-4.5 h-4.5", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function RideBookingHome() {
  const [viewStep, setViewStep] = useState<ViewStep>("home");
  const [mainTab, setMainTab] = useState<MainTab>("route");
  const [profileMode, setProfileMode] = useState<ProfileMode>("personal");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [focusedInput, setFocusedInput] = useState<"pickup" | "destination" | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState("economy");
  const [selectedPayment, setSelectedPayment] = useState("visa");

  // Feature toggles
  const [departureReminder, setDepartureReminder] = useState(false);
  const [smartPickup, setSmartPickup] = useState(true);
  const [petFriendly, setPetFriendly] = useState(false);
  const [wheelchair, setWheelchair] = useState(false);
  const [rideMusic, setRideMusic] = useState(false);

  const isLive = true; // drivers available indicator

  const filteredSuggestions = autocompleteResults.filter((r) =>
    r.primary.toLowerCase().includes(
      (focusedInput === "pickup" ? pickup : destination).toLowerCase()
    )
  );

  const selectAddress = useCallback((address: string) => {
    if (focusedInput === "pickup") setPickup(address);
    else setDestination(address);
    setFocusedInput(null);
  }, [focusedInput]);

  const handleContinue = () => {
    if (!pickup && !destination) {
      setViewStep("search");
      return;
    }
    if (pickup && destination) {
      setViewStep("vehicle");
    } else {
      setViewStep("search");
    }
  };

  const currentVehicle = vehicleOptions.find((v) => v.id === selectedVehicle)!;

  /* ─── Render ─── */
  return (
    <div className="flex flex-col min-h-[calc(100vh-7rem)]">
      {/* Map */}
      <MapArea onBack={viewStep !== "home" ? () => setViewStep("home") : undefined} />

      {/* Bottom sheet area */}
      <div className="flex-1 bg-background rounded-t-3xl -mt-5 relative z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="w-10 h-1 rounded-full bg-border/60 mx-auto mt-2.5 mb-3" />

        <AnimatePresence mode="wait">
          {/* ─── HOME VIEW ─── */}
          {viewStep === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-0"
            >
              {/* Route / Price / Pay tabs */}
              <div className="flex items-center justify-center gap-8 px-4 pb-3 border-b border-border/20">
                {([
                  { id: "route" as MainTab, label: "Route", icon: MapPin },
                  { id: "price" as MainTab, label: "Price", icon: DollarSign },
                  { id: "pay" as MainTab, label: "Pay", icon: CreditCard },
                ] as const).map((tab) => {
                  const Icon = tab.icon;
                  const active = mainTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setMainTab(tab.id)}
                      className="flex flex-col items-center gap-1 relative"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                          active
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted/30 text-muted-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold transition-colors",
                          active ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              {mainTab === "route" && (
                <div className="pt-4">
                  {/* Where to? + profile toggle */}
                  <div className="px-4 flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black text-foreground">Where to?</h2>
                    <div className="flex items-center gap-2">
                      {(["personal", "business"] as ProfileMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setProfileMode(mode)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                            profileMode === mode
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {mode === "personal" ? (
                            <CreditCard className="w-3.5 h-3.5" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5" />
                          )}
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                      ))}
                      {/* Live indicator */}
                      <div className="flex items-center gap-1 ml-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-600">Live</span>
                      </div>
                    </div>
                  </div>

                  {/* Feature toggles */}
                  <div className="bg-card rounded-2xl mx-4 border border-border/30 overflow-hidden">
                    <FeatureToggle
                      icon={Clock}
                      iconColor="text-sky-500"
                      title="Set departure reminder"
                      subtitle="Get notified 15 min before scheduled ride"
                      checked={departureReminder}
                      onCheckedChange={(v) => {
                        setDepartureReminder(v);
                        if (v) toast.success("Departure reminder enabled");
                      }}
                    />
                    <FeatureToggle
                      icon={Target}
                      iconColor="text-emerald-500"
                      title="Smart pickup pin"
                      subtitle="Auto-adjust to nearest safe pickup spot"
                      checked={smartPickup}
                      onCheckedChange={(v) => {
                        setSmartPickup(v);
                        toast.success(v ? "Smart pickup enabled" : "Smart pickup off");
                      }}
                    />
                    <FeatureToggle
                      icon={Dog}
                      iconColor="text-amber-600"
                      title="Pet-friendly ride"
                      subtitle="Bring your furry friend along · +$3.00"
                      checked={petFriendly}
                      onCheckedChange={(v) => {
                        setPetFriendly(v);
                        toast.success(v ? "Pet-friendly selected" : "Pet-friendly removed");
                      }}
                    />
                    <FeatureToggle
                      icon={Accessibility}
                      iconColor="text-blue-500"
                      title="Wheelchair accessible"
                      subtitle="Vehicle with ramp or lift"
                      checked={wheelchair}
                      onCheckedChange={(v) => {
                        setWheelchair(v);
                        toast.success(v ? "Wheelchair-accessible selected" : "Standard vehicle");
                      }}
                    />
                  </div>

                  {/* Ride music row */}
                  <div className="mx-4 mt-3 bg-card rounded-2xl border border-border/30 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <div className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center">
                        <Music className="w-4.5 h-4.5 text-violet-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Ride Music</p>
                      </div>
                      <span className="text-xs text-muted-foreground">No Preference</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="p-4 pt-5">
                    <Button
                      className="w-full h-13 rounded-2xl text-base font-bold gap-2 shadow-lg"
                      onClick={handleContinue}
                    >
                      <Route className="w-5 h-5" />
                      Set Destination
                    </Button>
                  </div>
                </div>
              )}

              {mainTab === "price" && (
                <div className="px-4 pt-4 space-y-3">
                  <h3 className="text-lg font-black text-foreground">Fare Estimate</h3>
                  <p className="text-sm text-muted-foreground">Set your route first to see pricing for each ride type.</p>
                  <div className="space-y-2 pt-2">
                    {vehicleOptions.map((v) => {
                      const Icon = v.icon;
                      return (
                        <div
                          key={v.id}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/30"
                        >
                          <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">{v.name}</p>
                            <p className="text-[10px] text-muted-foreground">{v.eta} · {v.capacity} seats</p>
                          </div>
                          <p className="text-sm font-black text-foreground">{v.price}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {mainTab === "pay" && (
                <div className="px-4 pt-4 space-y-3">
                  <h3 className="text-lg font-black text-foreground">Payment</h3>
                  <div className="space-y-2">
                    {paymentMethods.map((pm) => {
                      const Icon = pm.icon;
                      const active = selectedPayment === pm.id;
                      return (
                        <button
                          key={pm.id}
                          onClick={() => setSelectedPayment(pm.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                            active
                              ? "border-primary/40 bg-primary/5"
                              : "border-border/30 bg-card hover:border-primary/20"
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", active ? "bg-primary/15" : "bg-muted/30")}>
                            <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-muted-foreground")} />
                          </div>
                          <span className="flex-1 text-sm font-semibold text-foreground">{pm.label}</span>
                          {active && <CheckCircle className="w-5 h-5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                  <button className="w-full text-center text-sm text-primary font-semibold py-2 hover:underline">
                    + Add Payment Method
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── SEARCH VIEW ─── */}
          {viewStep === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-4 space-y-4"
            >
              <h2 className="text-lg font-black text-foreground">Where to?</h2>

              {/* Route inputs */}
              <div className="rounded-2xl bg-card border border-border/30 p-3 space-y-0">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-500/30" />
                    <div className="w-0.5 h-8 bg-border/50" />
                    <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-500/30" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Pickup location"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      onFocus={() => setFocusedInput("pickup")}
                      className="h-11 rounded-xl text-sm font-medium bg-muted/20 border-0 focus:bg-muted/40"
                      autoFocus
                    />
                    <Input
                      placeholder="Where to?"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onFocus={() => setFocusedInput("destination")}
                      className="h-11 rounded-xl text-sm font-medium bg-muted/20 border-0 focus:bg-muted/40"
                    />
                  </div>
                </div>
              </div>

              {/* Autocomplete */}
              <AnimatePresence>
                {focusedInput && (pickup || destination) && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="rounded-2xl bg-card border border-border/30 overflow-hidden shadow-lg"
                  >
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => selectAddress(s.primary)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors border-b border-border/10 last:border-0"
                      >
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{s.primary}</p>
                          <p className="text-xs text-muted-foreground">{s.secondary}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Saved places */}
              {!focusedInput && (
                <>
                  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                    {savedPlaces.map((place) => {
                      const Icon = place.icon;
                      return (
                        <button
                          key={place.id}
                          onClick={() => {
                            setDestination(place.address);
                            toast.success(`Destination: ${place.name}`);
                          }}
                          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border border-border/30 shrink-0 active:scale-[0.97] transition-transform"
                        >
                          <Icon className={cn("w-4 h-4", place.color)} />
                          <div className="text-left">
                            <p className="text-xs font-bold text-foreground">{place.name}</p>
                            <p className="text-[9px] text-muted-foreground truncate max-w-[120px]">{place.address}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Recent */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3 h-3" /> Recent
                    </h3>
                    {recentDestinations.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => {
                          setDestination(dest.address.split(",")[0]);
                          toast.success(`Destination set`);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30 text-left hover:border-primary/20 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{dest.address}</p>
                          <p className="text-xs text-muted-foreground">{dest.time}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Continue */}
              {pickup && destination && !focusedInput && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button
                    className="w-full h-13 rounded-2xl text-base font-bold gap-2 shadow-lg"
                    onClick={() => setViewStep("vehicle")}
                  >
                    <Route className="w-5 h-5" /> Choose Your Ride
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── VEHICLE VIEW ─── */}
          {viewStep === "vehicle" && (
            <motion.div
              key="vehicle"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4 space-y-4"
            >
              {/* Route summary */}
              <div className="rounded-2xl bg-card border border-border/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div className="w-0.5 h-5 bg-border/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{pickup}</p>
                    <p className="text-xs text-muted-foreground truncate">{destination}</p>
                  </div>
                  <button onClick={() => setViewStep("search")} className="text-xs text-primary font-bold">
                    Edit
                  </button>
                </div>
              </div>

              {/* Vehicle selection */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Choose a ride</h3>
                {vehicleOptions.map((v, i) => {
                  const Icon = v.icon;
                  const selected = selectedVehicle === v.id;
                  return (
                    <motion.button
                      key={v.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => setSelectedVehicle(v.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all",
                        selected
                          ? "border-primary/40 bg-primary/5 shadow-md"
                          : "border-border/30 bg-card hover:border-primary/20"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", selected ? "bg-primary/15" : "bg-muted/30")}>
                        <Icon className={cn("w-6 h-6", selected ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-foreground">{v.name}</span>
                        <p className="text-[10px] text-muted-foreground">{v.eta} · {v.capacity} seats</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-foreground">{v.price}</p>
                      </div>
                      {selected && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>

              <Button
                className="w-full h-13 rounded-2xl text-base font-bold gap-2 shadow-lg"
                onClick={() => setViewStep("confirm")}
              >
                <DollarSign className="w-5 h-5" /> Review & Confirm
              </Button>
            </motion.div>
          )}

          {/* ─── CONFIRM VIEW ─── */}
          {viewStep === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 space-y-4"
            >
              {/* Fare breakdown */}
              <div className="rounded-2xl bg-card border border-border/30 p-5 space-y-3">
                <h3 className="text-sm font-bold text-foreground">Fare Breakdown</h3>
                <div className="space-y-2">
                  {[
                    { label: "Base fare", value: "$3.00" },
                    { label: "Distance (4.2 mi)", value: "$6.30" },
                    { label: "Time (12 min)", value: "$2.40" },
                    { label: "Platform fee", value: "$1.50" },
                    ...(petFriendly ? [{ label: "Pet-friendly", value: "$3.00" }] : []),
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-border/30 pt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Estimated Total</span>
                    <span className="text-xl font-black text-primary">{currentVehicle.price.split("–")[0]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/20">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] text-muted-foreground">Final price confirmed when trip ends.</span>
                </div>
              </div>

              {/* Route + vehicle + payment summary */}
              <div className="rounded-2xl bg-muted/20 border border-border/20 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-foreground truncate">{pickup}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-medium text-foreground truncate">{destination}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-border/20 mt-1">
                  <currentVehicle.icon className="w-4 h-4 text-primary" />
                  <span className="font-bold text-foreground">{currentVehicle.name}</span>
                  <span className="text-muted-foreground">· {currentVehicle.eta}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {paymentMethods.find((p) => p.id === selectedPayment)?.label}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-13 rounded-2xl text-sm font-bold"
                  onClick={() => setViewStep("vehicle")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 h-13 rounded-2xl text-base font-bold gap-2 shadow-lg"
                  onClick={() => {
                    toast.success("Ride confirmed! Finding your driver...");
                    setTimeout(() => setViewStep("home"), 2000);
                  }}
                >
                  <Zap className="w-5 h-5" /> Confirm Ride
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pb-6" />
      </div>
    </div>
  );
}
