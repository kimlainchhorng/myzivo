import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { 
  Car,
  Search,
  CalendarDays,
  Clock,
  User,
  ShieldCheck,
  Users,
  ArrowRight,
  Sparkles,
  Star,
  Heart,
  MapPin,
  Shield,
  CheckCircle,
  Crown,
  Zap,
  ChevronRight,
  DollarSign,
  Award,
  Bell,
  Truck,
  Key,
  Fuel,
} from "lucide-react";
import { useP2PVehicleCount } from "@/hooks/useP2PBooking";
import P2PDiscoveryBanner from "@/components/car/P2PDiscoveryBanner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AirportAutocomplete, { getAirportByCode } from "@/components/car/AirportAutocomplete";
import CarResultCardPro from "@/components/car/CarResultCardPro";
import CarPartnerSelector from "@/components/car/CarPartnerSelector";
import AffiliateRedirectNotice from "@/components/shared/AffiliateRedirectNotice";
import CarTopSearchCTA from "@/components/car/CarTopSearchCTA";
import CarStickyBookingCTA from "@/components/car/CarStickyBookingCTA";
import ImageHero from "@/components/shared/ImageHero";
import BigSearchCard from "@/components/shared/BigSearchCard";
import DestinationCardsGrid from "@/components/shared/DestinationCardsGrid";
import TrustSection from "@/components/shared/TrustSection";
import { EnhanceYourTrip } from "@/components/travel-extras";
import TravelFAQ from "@/components/shared/TravelFAQ";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { TrustFeatureCards, OGImageMeta } from "@/components/marketing";
import { SEOContentBlock, InternalLinkGrid } from "@/components/seo";
import { carAffiliatePartners } from "@/data/carAffiliatePartners";
import CarCategoryTiles from "@/components/car/CarCategoryTiles";
import { CarCategory } from "@/config/photos";
import { Airport } from "@/data/airports";
import { CAR_DISCLAIMERS } from "@/config/carCompliance";

/**
 * ZIVO CAR RENTAL - Top-Tier Car Search
 * Uses IATA codes for location handling
 */

const carCategories = [
  { name: "Economy", passengers: 4, bags: 2, priceFrom: 25, transmission: 'Automatic' as const, hasAC: true },
  { name: "Compact", passengers: 5, bags: 2, priceFrom: 30, transmission: 'Automatic' as const, hasAC: true },
  { name: "Midsize", passengers: 5, bags: 3, priceFrom: 38, transmission: 'Automatic' as const, hasAC: true },
  { name: "Full-size", passengers: 5, bags: 4, priceFrom: 42, transmission: 'Automatic' as const, hasAC: true },
  { name: "SUV", passengers: 7, bags: 4, priceFrom: 55, transmission: 'Automatic' as const, hasAC: true },
  { name: "Luxury", passengers: 5, bags: 3, priceFrom: 95, transmission: 'Automatic' as const, hasAC: true },
];

const CarRentalBooking = () => {
  const navigate = useNavigate();
  
  // Location state with IATA code
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [pickupDisplayValue, setPickupDisplayValue] = useState("");
  
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [driverAge, setDriverAge] = useState("25");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // === NEW: Turo-inspired features ===
  const [deliveryToYou, setDeliveryToYou] = useState(false);
  const [instantBook, setInstantBook] = useState(true);
  const [longTermDiscount, setLongTermDiscount] = useState(false);
  const [showTripProtection, setShowTripProtection] = useState(false);
  const [selectedProtection, setSelectedProtection] = useState<"none" | "basic" | "standard" | "premium">("standard");
  const [showHostProfile, setShowHostProfile] = useState(false);
  const [savedCars, setSavedCars] = useState<string[]>([]);
  const [showCarFeatureFilter, setShowCarFeatureFilter] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [unlimitedMileage, setUnlimitedMileage] = useState(true);
  const [showElectricOnly, setShowElectricOnly] = useState(false);
  const [freeDelivery] = useState(true);
  const [hostRating] = useState(4.9);
  const [hostTrips] = useState(342);
  const [responseRate] = useState("99%");
  const [responseTime] = useState("< 1 hour");

  // Trip protection tiers (Turo)
  const protectionTiers = [
    { id: "none" as const, name: "Decline", price: "$0", features: ["No coverage", "You're responsible for all damage"] },
    { id: "basic" as const, name: "Basic", price: "$9/day", features: ["$2,500 deductible", "Liability coverage", "24/7 roadside"] },
    { id: "standard" as const, name: "Standard", price: "$19/day", features: ["$500 deductible", "Liability coverage", "24/7 roadside", "Lost key replacement"], badge: "Popular" },
    { id: "premium" as const, name: "Premium", price: "$35/day", features: ["$0 deductible", "Full liability", "24/7 concierge", "Lost key", "Tire & windshield"], badge: "Best Value" },
  ];

  // Car feature filters (Turo)
  const carFeatures = [
    { id: "bluetooth", label: "Bluetooth", icon: "📱" },
    { id: "gps", label: "GPS", icon: "📍" },
    { id: "backup-camera", label: "Backup Camera", icon: "📷" },
    { id: "heated-seats", label: "Heated Seats", icon: "🔥" },
    { id: "sunroof", label: "Sunroof", icon: "☀️" },
    { id: "apple-carplay", label: "Apple CarPlay", icon: "🍎" },
    { id: "android-auto", label: "Android Auto", icon: "🤖" },
    { id: "keyless", label: "Keyless Entry", icon: "🔑" },
  ];

  // Mock host profiles (Turo)
  const hostProfiles = [
    { name: "Michael S.", rating: 4.9, trips: 342, responseTime: "< 1 hour", superhost: true, joined: "2021" },
    { name: "Sarah K.", rating: 4.8, trips: 189, responseTime: "< 2 hours", superhost: true, joined: "2022" },
    { name: "James R.", rating: 4.7, trips: 98, responseTime: "< 3 hours", superhost: false, joined: "2023" },
  ];

  // Handle airport selection from autocomplete
  const handleAirportChange = (airport: Airport | null, displayValue: string) => {
    setSelectedAirport(airport);
    setPickupDisplayValue(displayValue);
  };

  const handleSearch = () => {
    // Get pickup code - either from selected airport or extract from display value
    const pickupCode = selectedAirport?.code || pickupDisplayValue.match(/\(([A-Z]{3})\)/)?.[1];
    
    if (!pickupCode || !pickupDate || !returnDate) return;
    
    // Navigate to results page with proper URL params
    const params = new URLSearchParams({
      pickup: pickupCode,
      pickup_date: format(pickupDate, 'yyyy-MM-dd'),
      pickup_time: pickupTime,
      dropoff_date: format(returnDate, 'yyyy-MM-dd'),
      dropoff_time: returnTime,
      age: driverAge,
    });
    
    navigate(`/rent-car/results?${params.toString()}`);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setTimeout(() => {
      document.getElementById('partner-selector')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCategoryTileSelect = (category: CarCategory) => {
    const categoryMap: Record<CarCategory, string> = {
      economy: "Economy",
      compact: "Compact",
      midsize: "Midsize",
      suv: "SUV",
      luxury: "Luxury",
      van: "Full-size",
      electric: "Electric",
    };
    setSelectedCategory(categoryMap[category] || category);
    setHasSearched(true);
  };

  const handleRentCar = (categoryName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const partner = carAffiliatePartners[0];
    const pickupCode = selectedAirport?.code || pickupDisplayValue.match(/\(([A-Z]{3})\)/)?.[1] || '';
    const url = partner.urlTemplate({
      pickupLocation: pickupCode,
      pickupDate: pickupDate ? format(pickupDate, "yyyy-MM-dd") : undefined,
      returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
      pickupTime,
      returnTime,
      driverAge: parseInt(driverAge),
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleLocationSelect = (city: string) => {
    setPickupDisplayValue(city);
  };

  // Calculate days for pricing
  const daysCount = pickupDate && returnDate 
    ? Math.max(1, Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)))
    : undefined;

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <SEOHead 
        title="ZIVO Car Rentals – Compare & Rent Cars Worldwide"
        description="Compare car rental prices from top providers worldwide. Find the best deals on economy, SUV, luxury and more. Book with trusted partners."
      />
      <OGImageMeta pageType="cars" />
      <Header />
      
      <main className="pb-32 lg:pb-20">
        {/* Car Rental Disclaimer Banner - LOCKED TEXT */}
        <section className="border-b border-violet-500/20 py-2.5 bg-violet-500/5">
          <div className="container mx-auto px-4">
            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
              {CAR_DISCLAIMERS.partnerBooking}
            </p>
          </div>
        </section>

        {/* Hero with Big Search */}
        <ImageHero service="cars" icon={Car}>
          <BigSearchCard service="cars">
            {/* Main Search Fields */}
            <div className="space-y-4">
              {/* Row 1: Location - Airport Autocomplete */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Pickup Location</label>
                <AirportAutocomplete
                  value={pickupDisplayValue}
                  onChange={handleAirportChange}
                  placeholder="Airport or city (e.g., LAX, Miami)"
                />
              </div>

              {/* Row 2: Dates */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Pickup Date */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Pickup Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start">
                        <CalendarDays className="mr-2 h-4 w-4 text-violet-500" />
                        {pickupDate ? format(pickupDate, "MMM d") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={pickupDate}
                        onSelect={setPickupDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Pickup Time */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Pickup Time</label>
                  <Select value={pickupTime} onValueChange={setPickupTime}>
                    <SelectTrigger className="h-12">
                      <Clock className="w-4 h-4 mr-2 text-violet-500" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>{hour}:00</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Return Date */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Return Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start">
                        <CalendarDays className="mr-2 h-4 w-4 text-purple-500" />
                        {returnDate ? format(returnDate, "MMM d") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Return Time */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Return Time</label>
                  <Select value={returnTime} onValueChange={setReturnTime}>
                    <SelectTrigger className="h-12">
                      <Clock className="w-4 h-4 mr-2 text-purple-500" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>{hour}:00</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Driver Age */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Driver Age</label>
                  <Select value={driverAge} onValueChange={setDriverAge}>
                    <SelectTrigger className="h-12">
                      <User className="w-4 h-4 mr-2 text-violet-500" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="21">21-24 years</SelectItem>
                      <SelectItem value="25">25-29 years</SelectItem>
                      <SelectItem value="30">30-64 years</SelectItem>
                      <SelectItem value="65">65+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Search Button - Big & Prominent */}
            <Button 
              onClick={handleSearch}
              disabled={!selectedAirport && !pickupDisplayValue.match(/\([A-Z]{3}\)/)}
              size="lg"
              className={cn(
                "w-full h-14 font-bold text-lg mt-6",
                "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700",
                "shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40",
                "transition-all duration-300 active:scale-[0.98]"
              )}
            >
              <Search className="w-5 h-5 mr-2" />
              Search Cars
            </Button>
          </BigSearchCard>
        </ImageHero>

        {/* Search Results */}
        {hasSearched && (
          <section className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">
                Car Rentals in {selectedAirport?.city || pickupDisplayValue}
              </h2>
              <p className="text-sm text-muted-foreground">
                {carCategories.length} categories available • Compare prices across rental sites
              </p>
            </div>

            <CarTopSearchCTA
              pickupLocation={selectedAirport?.code || pickupDisplayValue}
              pickupDate={pickupDate ? format(pickupDate, "yyyy-MM-dd") : undefined}
              returnDate={returnDate ? format(returnDate, "yyyy-MM-dd") : undefined}
              pickupTime={pickupTime}
              returnTime={returnTime}
              driverAge={parseInt(driverAge)}
              className="mb-6"
            />

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {carCategories.map((category) => (
                  <CarResultCardPro
                    key={category.name}
                    id={category.name}
                    category={category.name}
                    passengers={category.passengers}
                    bags={category.bags}
                    transmission={category.transmission}
                    hasAC={category.hasAC}
                    mileage="Unlimited"
                    fuelPolicy="Full to Full"
                    pricePerDay={category.priceFrom}
                    totalPrice={daysCount ? category.priceFrom * daysCount : undefined}
                    daysCount={daysCount}
                    isSelected={selectedCategory === category.name}
                    onSelect={() => handleCategorySelect(category.name)}
                    onBook={() => handleRentCar(category.name)}
                  />
                ))}
              </div>

              <div className="space-y-6">
                {selectedCategory && (
                  <div id="partner-selector">
                    <CarPartnerSelector
                      carName={selectedCategory}
                      pickupLocation={selectedAirport?.code || pickupDisplayValue}
                      pickupDate={pickupDate ? format(pickupDate, "yyyy-MM-dd") : undefined}
                      returnDate={returnDate ? format(returnDate, "yyyy-MM-dd") : undefined}
                      pickupTime={pickupTime}
                      returnTime={returnTime}
                      driverAge={parseInt(driverAge)}
                    />
                  </div>
                )}

                <AffiliateRedirectNotice variant="banner" />
              </div>
            </div>

            {/* Price Disclaimer - LOCKED TEXT */}
            <div className="mt-6 p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
              <p className="text-xs text-muted-foreground text-center font-medium mb-1">
                {CAR_DISCLAIMERS.partnerBooking}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                {CAR_DISCLAIMERS.price} {CAR_DISCLAIMERS.insurance}
              </p>
            </div>
          </section>
        )}

        {/* P2P Discovery Banner */}
        <P2PDiscoveryBanner city={selectedAirport?.city || pickupDisplayValue} />

        {/* === TURO-INSPIRED FEATURES === */}

        {/* Delivery & Instant Book Toggles */}
        <section className="py-6 border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="rounded-2xl bg-card border border-border/40 p-4 flex items-center gap-3">
                <button onClick={() => { setDeliveryToYou(!deliveryToYou); if (!deliveryToYou) toast.success("🚗 Car will be delivered to your location!"); }}
                  className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", deliveryToYou ? "bg-emerald-500" : "bg-muted/60")}>
                  <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", deliveryToYou ? "left-[18px]" : "left-0.5")} />
                </button>
                <div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> Delivery to You</p>
                  <p className="text-[10px] text-muted-foreground">{freeDelivery ? "Free delivery!" : "From $15"}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-card border border-border/40 p-4 flex items-center gap-3">
                <button onClick={() => setInstantBook(!instantBook)}
                  className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", instantBook ? "bg-primary" : "bg-muted/60")}>
                  <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", instantBook ? "left-[18px]" : "left-0.5")} />
                </button>
                <div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> Instant Book</p>
                  <p className="text-[10px] text-muted-foreground">Skip approval, book instantly</p>
                </div>
              </div>
              <div className="rounded-2xl bg-card border border-border/40 p-4 flex items-center gap-3">
                <button onClick={() => setShowElectricOnly(!showElectricOnly)}
                  className={cn("w-10 h-6 rounded-full transition-all relative shrink-0", showElectricOnly ? "bg-emerald-500" : "bg-muted/60")}>
                  <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", showElectricOnly ? "left-[18px]" : "left-0.5")} />
                </button>
                <div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5 text-emerald-500" /> Electric Only</p>
                  <p className="text-[10px] text-muted-foreground">Tesla, Rivian, Lucid & more</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Car Feature Filters (Turo) */}
        <section className="py-6 border-b border-border/30 bg-muted/5">
          <div className="container mx-auto px-4">
            <button onClick={() => setShowCarFeatureFilter(!showCarFeatureFilter)}
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all mb-4">
              <Key className="w-4 h-4 text-violet-500" /> Car Features
              <ChevronRight className={cn("w-4 h-4 transition-transform", showCarFeatureFilter && "rotate-90")} />
            </button>
            {showCarFeatureFilter && (
              <div className="flex gap-2 flex-wrap">
                {carFeatures.map(f => (
                  <button key={f.id} onClick={() => setSelectedFeatures(prev => prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id])}
                    className={cn("px-3 py-2 rounded-xl text-[10px] font-bold transition-all",
                      selectedFeatures.includes(f.id) ? "bg-violet-500/10 text-violet-500 border border-violet-500/30" : "bg-card text-muted-foreground border border-border/40")}>
                    {f.icon} {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Trip Protection Plans (Turo) */}
        <section className="py-8 border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-violet-500" /> Trip Protection Plans
              </h2>
              <p className="text-sm text-muted-foreground">Choose your coverage level</p>
            </div>
            <div className="grid md:grid-cols-4 gap-3 max-w-5xl mx-auto">
              {protectionTiers.map(tier => (
                <button key={tier.id} onClick={() => setSelectedProtection(tier.id)}
                  className={cn("rounded-2xl p-4 text-left transition-all border relative",
                    selectedProtection === tier.id ? "border-violet-500 bg-violet-500/5 shadow-lg" : "border-border/40 bg-card hover:border-border")}>
                  {"badge" in tier && tier.badge && (
                    <span className="absolute -top-2 right-3 text-[8px] font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full">{tier.badge}</span>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-foreground">{tier.name}</h3>
                    <span className="text-xs font-bold text-violet-500">{tier.price}</span>
                  </div>
                  <ul className="space-y-1">
                    {tier.features.map(f => (
                      <li key={f} className="text-[10px] text-muted-foreground flex items-start gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Host Profiles (Turo) */}
        <section className="py-8 border-b border-border/30 bg-muted/5">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-violet-500" /> Top-Rated Hosts
            </h2>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {hostProfiles.map(host => (
                <div key={host.name} className="rounded-2xl bg-card border border-border/40 p-5 text-center hover:border-violet-500/30 transition-all">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-2xl font-bold text-violet-500">
                    {host.name.charAt(0)}
                  </div>
                  <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
                    {host.name}
                    {host.superhost && <Badge className="bg-amber-500/10 text-amber-500 border-0 text-[8px] ml-1">⭐ Superhost</Badge>}
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {host.rating}</span>
                    <span>{host.trips} trips</span>
                    <span>Since {host.joined}</span>
                  </div>
                  <p className="text-[10px] text-emerald-500 font-bold mt-1">Responds {host.responseTime}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Long-Term Discount Banner (Turo) */}
        <section className="py-6 border-b border-border/30 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground">Long-Term Discounts Available</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Save up to 25% on weekly rentals and 40% on monthly rentals</p>
            <div className="flex justify-center gap-3">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">3+ days: 10% off</span>
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">7+ days: 25% off</span>
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">30+ days: 40% off</span>
            </div>
          </div>
        </section>

        {/* Discovery Sections (shown when no search) */}
        {!hasSearched && (
          <>
            <CarCategoryTiles onSelect={handleCategoryTileSelect} selectedCategory={null} />
            <SEOContentBlock serviceType="cars" className="bg-muted/5" />
            <DestinationCardsGrid service="cars" onSelect={handleLocationSelect} />
            <TrustFeatureCards columns={4} />
            <TrustSection service="cars" />
            <EnhanceYourTrip currentService="cars" destination={selectedAirport?.city || pickupDisplayValue} />
            <InternalLinkGrid currentService="cars" />
            <TravelFAQ serviceType="cars" className="bg-muted/20" />
          </>
        )}

        {/* Sticky CTA */}
        {hasSearched && (
          <CarStickyBookingCTA
            pickupLocation={selectedAirport?.code || pickupDisplayValue}
            pickupDate={pickupDate ? format(pickupDate, "yyyy-MM-dd") : undefined}
            returnDate={returnDate ? format(returnDate, "yyyy-MM-dd") : undefined}
            pickupTime={pickupTime}
            returnTime={returnTime}
            driverAge={parseInt(driverAge)}
          />
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CarRentalBooking;
