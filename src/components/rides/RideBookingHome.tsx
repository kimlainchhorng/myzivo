/**
 * RideBookingHome — Uber-style ride booking with 3 screens
 * Screen 1: Map + nearby cars + "Hello, User" + "Where to?" + saved places
 * Screen 2: Map with route + "Choose a ride" vehicle list
 * Screen 3: Map with route labels + confirmed vehicle selection
 */
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Navigation, ChevronRight, ArrowLeft, Home,
  Building2, Plane, Car, Crown, Users, Shield, Zap,
  CheckCircle, History, ChevronDown, Menu, Clock,
  CreditCard, User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Data ─── */
const savedPlaces = [
  { id: "home", name: "Home", address: "1234 Main St", icon: Home },
  { id: "work", name: "Work", address: "400 Tech Blvd", icon: Building2 },
];

const recentDestinations = [
  { id: "1", address: "Downtown Gym, 55 Fitness Ave", time: "Yesterday, 6:30 PM" },
  { id: "2", address: "Grand Hotel, 200 Park Ave", time: "3 days ago" },
  { id: "3", address: "Central Mall, 88 Shopping Dr", time: "Last week" },
];

const autocompleteResults = [
  { id: "a1", primary: "Downtown Convention Center", secondary: "100 Convention Way, Downtown" },
  { id: "a2", primary: "Downtown Gym & Fitness", secondary: "55 Fitness Ave, Downtown" },
  { id: "a3", primary: "Downtown Medical Center", secondary: "200 Health Blvd, Suite 300" },
];

const vehicleOptions = [
  {
    id: "zivoX",
    name: "ZivoX",
    desc: "Affordable rides, all to yourself",
    eta: "7:45",
    price: "$12.20",
    capacity: 4,
    icon: Car,
  },
  {
    id: "black",
    name: "Black",
    desc: "Luxury rides with professional drivers",
    eta: "7:47",
    price: "$35.10",
    capacity: 4,
    icon: Crown,
  },
  {
    id: "zivoXL",
    name: "ZivoXL",
    desc: "Fits up to 6 passengers",
    eta: "7:50",
    price: "$19.90",
    capacity: 6,
    icon: Users,
  },
];

type ViewStep = "home" | "search" | "vehicle" | "confirm";

/* ─── Nearby Cars (animated) ─── */
function NearbyCars() {
  const [cars, setCars] = useState([
    { id: 1, x: 22, y: 38, rot: 45 },
    { id: 2, x: 58, y: 28, rot: -30 },
    { id: 3, x: 35, y: 62, rot: 120 },
    { id: 4, x: 72, y: 55, rot: -60 },
    { id: 5, x: 15, y: 52, rot: 90 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCars((prev) =>
        prev.map((c) => ({
          ...c,
          x: Math.max(5, Math.min(90, c.x + (Math.random() - 0.5) * 3)),
          y: Math.max(5, Math.min(90, c.y + (Math.random() - 0.5) * 3)),
          rot: c.rot + (Math.random() - 0.5) * 20,
        }))
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {cars.map((c) => (
        <motion.div
          key={c.id}
          className="absolute z-10"
          animate={{ left: `${c.x}%`, top: `${c.y}%`, rotate: c.rot }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <Car className="w-5 h-5 text-foreground" />
          </div>
        </motion.div>
      ))}
    </>
  );
}

/* ─── Map Component ─── */
function MapView({
  showRoute = false,
  showLabels = false,
  pickup,
  dropoff,
  onBack,
  showMenu = false,
  compact = false,
}: {
  showRoute?: boolean;
  showLabels?: boolean;
  pickup?: string;
  dropoff?: string;
  onBack?: () => void;
  showMenu?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn(
      "relative w-full overflow-hidden",
      compact ? "h-[40vh] min-h-[240px]" : "h-[48vh] min-h-[280px]",
      "bg-muted/20"
    )}>
      {/* Street grid */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none">
        {/* Horizontal streets */}
        {[20, 45, 70, 95, 120, 145, 170].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} stroke="hsl(var(--border))" strokeWidth="0.8" opacity="0.3" />
        ))}
        {/* Vertical streets */}
        {[25, 55, 85, 115, 145, 175].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="200" stroke="hsl(var(--border))" strokeWidth="0.8" opacity="0.3" />
        ))}
        {/* Diagonal avenue */}
        <line x1="10" y1="190" x2="180" y2="20" stroke="hsl(var(--border))" strokeWidth="1.2" opacity="0.2" />

        {/* Route polyline (when showing route) */}
        {showRoute && (
          <>
            <motion.path
              d="M 65 140 L 65 110 L 90 80 L 120 55 L 145 35"
              stroke="hsl(var(--foreground))"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {/* Route shadow */}
            <path
              d="M 65 140 L 65 110 L 90 80 L 120 55 L 145 35"
              stroke="hsl(var(--foreground))"
              strokeWidth="6"
              fill="none"
              opacity="0.08"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>

      {/* Street labels */}
      <span className="absolute text-[8px] font-semibold text-muted-foreground/30 tracking-wide" style={{ left: "10%", top: "25%" }}>SOHO</span>
      <span className="absolute text-[8px] font-semibold text-muted-foreground/30 tracking-wide" style={{ left: "50%", top: "15%" }}>EAST VILLAGE</span>
      <span className="absolute text-[8px] font-semibold text-muted-foreground/30 tracking-wide" style={{ left: "8%", top: "55%" }}>FINANCIAL DISTRICT</span>
      <span className="absolute text-[8px] font-semibold text-muted-foreground/30 tracking-wide" style={{ left: "55%", top: "65%" }}>DOWNTOWN</span>

      {/* Route markers */}
      {showRoute && (
        <>
          {/* Pickup marker */}
          <div className="absolute z-20" style={{ left: "32%", top: "68%" }}>
            <div className="-translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 rounded-full bg-foreground border-[3px] border-card shadow-lg" />
            </div>
            {showLabels && pickup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <div className="bg-card border border-border/30 rounded-lg px-2.5 py-1 shadow-md text-[10px] font-bold text-foreground flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  {pickup}
                  <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Dropoff marker */}
          <div className="absolute z-20" style={{ left: "72%", top: "17%" }}>
            <div className="-translate-x-1/2 -translate-y-1/2">
              <div className="w-5 h-5 rounded-sm bg-foreground shadow-lg flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-sm bg-card" />
              </div>
            </div>
            {showLabels && dropoff && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <div className="bg-card border border-border/30 rounded-lg px-2.5 py-1 shadow-md text-[10px] font-bold text-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {dropoff}
                  <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}

      {/* Center user marker (home screen only) */}
      {!showRoute && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.25, 0, 0.25] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute inset-0 w-8 h-8 -m-1 rounded-full bg-primary/30"
          />
          <div className="w-6 h-6 rounded-full bg-primary border-[3px] border-card shadow-xl" />
        </div>
      )}

      {/* Nearby cars (home only) */}
      {!showRoute && <NearbyCars />}

      {/* Navigation controls */}
      <div className="absolute right-3 bottom-3 z-20 flex flex-col gap-1">
        <button className="w-9 h-9 rounded-lg bg-card border border-border/30 shadow-sm flex items-center justify-center text-foreground font-bold text-base hover:bg-card/80 transition-colors">+</button>
        <button className="w-9 h-9 rounded-lg bg-card border border-border/30 shadow-sm flex items-center justify-center text-foreground font-bold text-base hover:bg-card/80 transition-colors">−</button>
      </div>

      {/* ZIVO locator */}
      <div className="absolute top-3 right-3 z-20">
        <div className="w-9 h-9 rounded-full bg-card border border-border/30 shadow-sm flex items-center justify-center">
          <Navigation className="w-4 h-4 text-primary" />
        </div>
      </div>

      {/* Menu / Back button */}
      <div className="absolute top-3 left-3 z-20">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-card border border-border/30 shadow-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
        ) : showMenu ? (
          <button className="w-9 h-9 rounded-full bg-card border border-border/30 shadow-sm flex items-center justify-center">
            <Menu className="w-4 h-4 text-foreground" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ─── Vehicle Row (Uber-style) ─── */
function VehicleRow({
  vehicle,
  selected,
  onSelect,
}: {
  vehicle: (typeof vehicleOptions)[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = vehicle.icon;
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-4 text-left transition-all border-b border-border/15 last:border-0",
        selected ? "bg-muted/30" : "hover:bg-muted/10"
      )}
    >
      {/* Car icon area */}
      <div className="w-16 h-12 flex items-center justify-center shrink-0">
        <Icon className="w-10 h-10 text-foreground" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground">{vehicle.name}</span>
          <div className="flex items-center gap-0.5">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{vehicle.capacity}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {vehicle.eta}
          {vehicle.desc && <span className="hidden sm:inline"> · {vehicle.desc}</span>}
        </p>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="text-base font-bold text-foreground">{vehicle.price}</p>
      </div>

      {/* Selection indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0 ml-1"
        >
          <CheckCircle className="w-3.5 h-3.5 text-background" />
        </motion.div>
      )}
    </button>
  );
}

/* ─── Main Component ─── */
export default function RideBookingHome() {
  const [viewStep, setViewStep] = useState<ViewStep>("home");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [focusedInput, setFocusedInput] = useState<"pickup" | "destination" | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState("zivoX");

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const filteredSuggestions = autocompleteResults.filter((r) =>
    r.primary.toLowerCase().includes(
      (focusedInput === "pickup" ? pickup : destination).toLowerCase()
    )
  );

  const selectAddress = useCallback(
    (address: string) => {
      if (focusedInput === "pickup") setPickup(address);
      else setDestination(address);
      setFocusedInput(null);
    },
    [focusedInput]
  );

  const currentVehicle = vehicleOptions.find((v) => v.id === selectedVehicle)!;

  return (
    <div className="flex flex-col min-h-[calc(100vh-7rem)]">
      <AnimatePresence mode="wait">
        {/* ═══════ HOME SCREEN ═══════ */}
        {viewStep === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            {/* Map */}
            <MapView showMenu />

            {/* Bottom content */}
            <div className="flex-1 bg-background relative z-10 px-5 pt-5 pb-4">
              {/* Greeting */}
              <h2 className="text-xl font-black text-foreground">{greeting}, Anton</h2>

              {/* Where to? bar */}
              <button
                onClick={() => setViewStep("search")}
                className="w-full mt-4 flex items-center gap-3 bg-muted/30 border border-border/30 rounded-2xl px-4 py-3.5 transition-colors hover:bg-muted/40 active:scale-[0.98]"
              >
                <MapPin className="w-5 h-5 text-foreground" />
                <span className="flex-1 text-left text-sm font-semibold text-foreground">Where to?</span>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border/30">
                  <Clock className="w-3.5 h-3.5 text-foreground" />
                  <span className="text-xs font-semibold text-foreground">Now</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </div>
              </button>

              {/* Saved places */}
              <div className="mt-5 space-y-0">
                {savedPlaces.map((place, i) => {
                  const Icon = place.icon;
                  return (
                    <button
                      key={place.id}
                      onClick={() => {
                        setDestination(place.address);
                        setPickup("Current Location");
                        setViewStep("vehicle");
                        toast.success(`Going to ${place.name}`);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-1 py-3.5 text-left transition-colors hover:bg-muted/10",
                        i < savedPlaces.length - 1 && "border-b border-border/15"
                      )}
                    >
                      <div className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{place.name}</p>
                        <p className="text-xs text-muted-foreground">{place.address}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ SEARCH SCREEN ═══════ */}
        {viewStep === "search" && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col flex-1 bg-background"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-2">
              <button
                onClick={() => setViewStep("home")}
                className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
              <h2 className="text-lg font-black text-foreground">Where to?</h2>
            </div>

            {/* Route inputs */}
            <div className="px-4 pt-2">
              <div className="rounded-2xl bg-muted/15 border border-border/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-3 h-3 rounded-full bg-foreground" />
                    <div className="w-0.5 h-8 bg-border/50" />
                    <div className="w-3 h-3 rounded-sm bg-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Pickup location"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      onFocus={() => setFocusedInput("pickup")}
                      className="h-11 rounded-xl text-sm font-semibold bg-card border-0 focus:ring-2 focus:ring-primary/20"
                      autoFocus
                    />
                    <Input
                      placeholder="Where to?"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onFocus={() => setFocusedInput("destination")}
                      className="h-11 rounded-xl text-sm font-semibold bg-card border-0 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Autocomplete results */}
            <div className="flex-1 overflow-y-auto px-4 pt-3">
              <AnimatePresence>
                {focusedInput && (pickup || destination) && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-0"
                  >
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => selectAddress(s.primary)}
                        className="w-full flex items-center gap-3 px-1 py-3 text-left hover:bg-muted/10 transition-colors border-b border-border/10 last:border-0"
                      >
                        <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{s.primary}</p>
                          <p className="text-xs text-muted-foreground">{s.secondary}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Saved + Recent (when no search active) */}
              {!focusedInput && (
                <div className="space-y-0">
                  {savedPlaces.map((place) => {
                    const Icon = place.icon;
                    return (
                      <button
                        key={place.id}
                        onClick={() => {
                          setDestination(place.address);
                          toast.success(`Destination: ${place.name}`);
                        }}
                        className="w-full flex items-center gap-3 px-1 py-3 text-left hover:bg-muted/10 transition-colors border-b border-border/10"
                      >
                        <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">{place.name}</p>
                          <p className="text-xs text-muted-foreground">{place.address}</p>
                        </div>
                      </button>
                    );
                  })}
                  {recentDestinations.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => {
                        setDestination(dest.address.split(",")[0]);
                        toast.success("Destination set");
                      }}
                      className="w-full flex items-center gap-3 px-1 py-3 text-left hover:bg-muted/10 transition-colors border-b border-border/10"
                    >
                      <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                        <History className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{dest.address}</p>
                        <p className="text-xs text-muted-foreground">{dest.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Continue button */}
            {pickup && destination && !focusedInput && (
              <div className="px-4 pb-4 pt-2">
                <Button
                  className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                  onClick={() => setViewStep("vehicle")}
                >
                  Choose a ride
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════ VEHICLE SELECTION SCREEN ═══════ */}
        {viewStep === "vehicle" && (
          <motion.div
            key="vehicle"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-1"
          >
            {/* Map with route */}
            <MapView
              showRoute
              pickup={pickup || "Home"}
              dropoff={destination || "Destination"}
              onBack={() => setViewStep("search")}
            />

            {/* Vehicle list */}
            <div className="flex-1 bg-background relative z-10">
              <div className="px-5 pt-4 pb-2">
                <h3 className="text-base font-bold text-foreground">Choose a ride</h3>
              </div>

              <div className="border-t border-border/15">
                {vehicleOptions.map((v) => (
                  <VehicleRow
                    key={v.id}
                    vehicle={v}
                    selected={selectedVehicle === v.id}
                    onSelect={() => setSelectedVehicle(v.id)}
                  />
                ))}
              </div>

              {/* Payment row */}
              <div className="px-4 py-3 border-t border-border/15 flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground flex-1">Visa •••• 4242</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* CTA */}
              <div className="px-4 pb-4 pt-2">
                <Button
                  className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                  onClick={() => setViewStep("confirm")}
                >
                  Confirm {currentVehicle.name} · {currentVehicle.price}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ CONFIRM / RIDE CONFIRMED ═══════ */}
        {viewStep === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col flex-1"
          >
            {/* Map with labeled route */}
            <MapView
              showRoute
              showLabels
              pickup={pickup || "Home"}
              dropoff={destination || "Destination"}
              onBack={() => setViewStep("vehicle")}
            />

            {/* Confirmation content */}
            <div className="flex-1 bg-background relative z-10">
              <div className="px-5 pt-4 pb-2">
                <h3 className="text-base font-bold text-foreground">Choose a ride</h3>
              </div>

              <div className="border-t border-border/15">
                {vehicleOptions.map((v) => (
                  <VehicleRow
                    key={v.id}
                    vehicle={v}
                    selected={selectedVehicle === v.id}
                    onSelect={() => setSelectedVehicle(v.id)}
                  />
                ))}
              </div>

              {/* Confirm CTA */}
              <div className="px-4 pb-4 pt-2">
                <Button
                  className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg gap-2"
                  onClick={() => {
                    toast.success("Ride confirmed! Finding your driver...");
                    setTimeout(() => {
                      setViewStep("home");
                      setPickup("");
                      setDestination("");
                    }, 2000);
                  }}
                >
                  <Zap className="w-5 h-5" />
                  Confirm {currentVehicle.name}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
