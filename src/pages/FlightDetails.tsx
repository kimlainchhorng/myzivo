import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plane,
  Clock,
  Luggage,
  ChevronLeft,
  ExternalLink,
  CheckCircle,
  XCircle,
  Info,
  MapPin,
  Calendar,
  Users,
  Armchair,
  Utensils,
  Wifi,
  Tv,
  PlugZap,
  AlertCircle,
  Star,
  Shield,
  Zap,
  RefreshCw,
  CreditCard,
  Percent,
  Heart,
  Share2,
  Printer,
  Bell,
  ChevronDown,
  Sparkles,
  Award,
  Globe,
  Lock,
  Phone,
  Briefcase,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { getAirlineLogo } from "@/data/airlines";
import type { GeneratedFlight } from "@/data/flightGenerator";
import { FLIGHT_CTA_TEXT, FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import { 
  FlightDetailStickyCTA, 
  HowBookingWorks, 
  FlightTrustBadgesBar,
  FlightStickyHeader,
  FlightItineraryTimeline,
  FlightBookingSidebar,
  FlightConsentCheckbox,
} from "@/components/flight";
import { toast } from "@/hooks/use-toast";

const FlightDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [flight, setFlight] = useState<GeneratedFlight | null>(null);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("itinerary");
  const [isSaved, setIsSaved] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const storedFlight = sessionStorage.getItem("selectedFlight");
    const storedParams = sessionStorage.getItem("flightSearchParams");

    if (storedFlight) {
      setFlight(JSON.parse(storedFlight));
    }
    if (storedParams) {
      setSearchParams(JSON.parse(storedParams));
    }
  }, []);

  if (!flight) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-6">
                <Plane className="w-10 h-10 text-sky-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Flight not found</h2>
              <p className="text-muted-foreground mb-6">This flight may have expired or been removed. Please search for flights again.</p>
              <Button onClick={() => navigate("/flights")} size="lg" className="gap-2">
                <Plane className="w-5 h-5" />
                Search Flights
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleBookNow = () => {
    // Block if consent not given
    if (!consentChecked) {
      toast({
        title: "Consent Required",
        description: "Please agree to the Terms and Conditions before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsRedirecting(true);
    
    // Store flight data for traveler info page
    sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
    sessionStorage.setItem('flightSearchParams', JSON.stringify(searchParams));
    
    // Navigate to traveler info page (internal MoR flow)
    navigate(`/flights/traveler-info?offer=${flight.id}&passengers=${searchParams?.passengers || 1}`);
  };

  const handleChangeFlight = () => {
    navigate("/flights/results" + window.location.search);
  };

  const amenityList = flight.amenities || [];
  const amenities = [
    { icon: Wifi, label: "In-flight WiFi", available: amenityList.includes("wifi") || amenityList.includes("Wi-Fi"), desc: "Stay connected" },
    { icon: Tv, label: "Entertainment", available: amenityList.includes("entertainment") || amenityList.includes("IFE"), desc: "Movies & TV" },
    { icon: Utensils, label: "Meal Service", available: amenityList.includes("meals") || amenityList.includes("food"), desc: "Complimentary" },
    { icon: PlugZap, label: "Power Outlets", available: amenityList.includes("power") || amenityList.includes("USB"), desc: "USB & AC" },
    { icon: Armchair, label: "Extra Legroom", available: amenityList.includes("legroom") || flight.price > 400, desc: "34\" pitch" },
  ];

  const cabinClassLabel = searchParams?.cabinClass === "first" ? "First Class" :
    searchParams?.cabinClass === "business" ? "Business Class" :
    searchParams?.cabinClass === "premium" ? "Premium Economy" : "Economy";

  const baggageInfo = {
    carryOn: { allowed: true, weight: "7kg / 15lbs", size: "55x40x20 cm" },
    personal: { allowed: true, weight: "3kg / 7lbs", size: "40x30x15 cm" },
    checked: { 
      allowed: flight.price > 300, 
      weight: flight.price > 500 ? "2 x 23kg" : "1 x 23kg",
      fee: flight.price > 500 ? "Included" : flight.price > 300 ? "Included" : "From $30"
    },
  };

  // Sidebar baggage format
  const sidebarBaggage = {
    personalItem: true,
    carryOn: true,
    checkedBag: flight.price > 300,
    checkedBagWeight: flight.price > 500 ? "2 x 23kg" : "1 x 23kg",
  };

  // Fare rules (estimate based on price)
  const fareRules = {
    changeable: true,
    changeableFee: "Fee applies",
    refundable: flight.price > 400,
  };

  const passengerCount = parseInt(searchParams?.passengers || "1");
  const totalPrice = flight.price * passengerCount;
  const taxes = totalPrice * 0.12;
  const serviceFee = 0;
  const grandTotal = totalPrice + taxes + serviceFee;

  // Airline performance data will be fetched from backend when available
  // TODO: Connect to airline performance API
  const airlineFeatures: { label: string; value: string; icon: typeof Clock }[] = [];

  // Build itinerary segment
  const itinerarySegments = [{
    airline: flight.airline,
    airlineCode: flight.airlineCode,
    flightNumber: flight.flightNumber,
    departureTime: flight.departure.time,
    arrivalTime: flight.arrival.time,
    departureCode: flight.departure.code,
    departureCity: flight.departure.city || flight.departure.code,
    arrivalCode: flight.arrival.code,
    arrivalCity: flight.arrival.city || flight.arrival.code,
    duration: flight.duration,
  }];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Flight Summary Header */}
      <FlightStickyHeader
        origin={flight.departure.code}
        originCity={flight.departure.city}
        destination={flight.arrival.code}
        destinationCity={flight.arrival.city}
        departDate={searchParams?.departDate || ""}
        returnDate={searchParams?.returnDate}
        passengers={passengerCount}
        cabinClass={searchParams?.cabinClass || "economy"}
        onChangeFlight={handleChangeFlight}
      />

      <main className="pt-4 pb-32 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-sky-950 via-blue-900 to-slate-900 py-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/20 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Results
            </Button>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
                  <img
                    src={getAirlineLogo(flight.airlineCode)}
                    alt={flight.airline}
                    className="w-14 h-14 object-contain"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground">{flight.airline}</h1>
                  <p className="text-primary-foreground/70">Flight {flight.flightNumber}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {flight.isRealPrice && (
                      <Badge className="bg-emerald-500/30 text-emerald-300 border-emerald-500/50">
                        <Zap className="w-3 h-3 mr-1" />
                        Live Price
                      </Badge>
                    )}
                    <Badge className="bg-sky-500/30 text-sky-300 border-sky-500/50">
                      {cabinClassLabel}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20"
                  onClick={() => setIsSaved(!isSaved)}
                  aria-label={isSaved ? "Remove from saved" : "Save flight"}
                >
                  <Heart className={cn("w-5 h-5", isSaved && "fill-red-500 text-red-500")} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20"
                >
                  <Bell className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Flight Route Hero */}
            <div className="mt-8 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-5xl lg:text-6xl font-bold text-primary-foreground">{flight.departure.time}</p>
                  <p className="text-2xl font-semibold text-sky-400">{flight.departure.code}</p>
                  <p className="text-primary-foreground/70">{flight.departure.city}</p>
                </div>

                <div className="flex-1 max-w-md">
                  <div className="relative flex items-center justify-center">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className="absolute flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-sky-500/30 border-2 border-sky-400 flex items-center justify-center">
                        <Plane className="w-7 h-7 text-sky-400 -rotate-45" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <Badge className="bg-white/10 text-primary-foreground border-white/20">
                      <Clock className="w-3 h-3 mr-1" />
                      {flight.duration}
                    </Badge>
                    <Badge className={cn(
                      "border",
                      flight.stops === 0 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" : "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    )}>
                      {flight.stops === 0 ? "Direct Flight" : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
                    </Badge>
                  </div>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-5xl lg:text-6xl font-bold text-primary-foreground">{flight.arrival.time}</p>
                  <p className="text-2xl font-semibold text-sky-400">{flight.arrival.code}</p>
                  <p className="text-primary-foreground/70">{flight.arrival.city}</p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-primary-foreground/80">
                  <Calendar className="w-4 h-4" />
                  <span>{searchParams?.departDate ? format(parseISO(searchParams.departDate), "EEEE, MMMM d, yyyy") : "Date not specified"}</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/80">
                  <Users className="w-4 h-4" />
                  <span>{passengerCount} Passenger{passengerCount > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/80">
                  <Globe className="w-4 h-4" />
                  <span>{searchParams?.tripType === "roundtrip" ? "Round Trip" : "One Way"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs Navigation */}
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-12">
                  <TabsTrigger value="itinerary" className="gap-2">
                    <Plane className="w-4 h-4" />
                    <span className="hidden sm:inline">Itinerary</span>
                  </TabsTrigger>
                  <TabsTrigger value="baggage" className="gap-2">
                    <Luggage className="w-4 h-4" />
                    <span className="hidden sm:inline">Baggage</span>
                  </TabsTrigger>
                  <TabsTrigger value="amenities" className="gap-2">
                    <Wifi className="w-4 h-4" />
                    <span className="hidden sm:inline">Amenities</span>
                  </TabsTrigger>
                  <TabsTrigger value="policies" className="gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Policies</span>
                  </TabsTrigger>
                </TabsList>

                {/* Itinerary Tab */}
                <TabsContent value="itinerary" className="space-y-6 mt-6">
                  {/* Timeline Layout */}
                  <FlightItineraryTimeline
                    segments={itinerarySegments}
                    departDate={searchParams?.departDate}
                    returnDate={searchParams?.returnDate}
                  />

                  {/* Layover Info */}
                  {flight.stops > 0 && (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-500">
                          <MapPin className="w-5 h-5" />
                          Connection Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-semibold">This flight has {flight.stops} stop{flight.stops > 1 ? "s" : ""}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {flight.stopCities?.length ? `Via ${flight.stopCities.join(", ")}` : "Connection airport details provided at booking"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Layover duration and gate information will be confirmed in your booking.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Airline Stats - Only show when data available */}
                  {airlineFeatures.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-sky-500" />
                        Airline Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {airlineFeatures.map((feature) => (
                          <div key={feature.label} className="text-center p-4 rounded-xl bg-muted/50">
                            <feature.icon className="w-6 h-6 mx-auto mb-2 text-sky-500" />
                            <p className="text-2xl font-bold">{feature.value}</p>
                            <p className="text-xs text-muted-foreground">{feature.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  )}

                  {/* Quick Amenities Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-sky-500" />
                        What's Included
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {amenities.map((amenity) => (
                          <div
                            key={amenity.label}
                            className={cn(
                              "p-4 rounded-xl text-center transition-all",
                              amenity.available
                                ? "bg-emerald-500/10 border border-emerald-500/30"
                                : "bg-muted/50 border border-border opacity-60"
                            )}
                          >
                            <amenity.icon className={cn(
                              "w-6 h-6 mx-auto mb-2",
                              amenity.available ? "text-emerald-500" : "text-muted-foreground"
                            )} />
                            <p className="text-xs font-medium">{amenity.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Overview Tab - keeping old content */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                  {/* Layover Info */}
                  {flight.stops > 0 && (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-500">
                          <MapPin className="w-5 h-5" />
                          Connection Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-semibold">This flight has {flight.stops} stop{flight.stops > 1 ? "s" : ""}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Estimated layover: {Math.floor(Math.random() * 3) + 1}h {Math.floor(Math.random() * 50) + 10}m
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Connection details and gate information will be provided in your booking confirmation.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Airline Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-sky-500" />
                        Airline Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {airlineFeatures.map((feature) => (
                          <div key={feature.label} className="text-center p-4 rounded-xl bg-muted/50">
                            <feature.icon className="w-6 h-6 mx-auto mb-2 text-sky-500" />
                            <p className="text-2xl font-bold">{feature.value}</p>
                            <p className="text-xs text-muted-foreground">{feature.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Amenities Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-sky-500" />
                        What's Included
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {amenities.map((amenity) => (
                          <div
                            key={amenity.label}
                            className={cn(
                              "p-4 rounded-xl text-center transition-all",
                              amenity.available
                                ? "bg-emerald-500/10 border border-emerald-500/30"
                                : "bg-muted/50 border border-border opacity-60"
                            )}
                          >
                            <amenity.icon className={cn(
                              "w-6 h-6 mx-auto mb-2",
                              amenity.available ? "text-emerald-500" : "text-muted-foreground"
                            )} />
                            <p className="text-xs font-medium">{amenity.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Baggage Tab */}
                <TabsContent value="baggage" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Luggage className="w-5 h-5 text-sky-500" />
                        Baggage Allowance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Personal Item */}
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <Luggage className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <span className="font-semibold">Personal Item</span>
                              <p className="text-xs text-muted-foreground">Small bag under seat</p>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500 text-primary-foreground">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Free
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <p>Max Weight: {baggageInfo.personal.weight}</p>
                          <p>Max Size: {baggageInfo.personal.size}</p>
                        </div>
                      </div>

                      {/* Carry-on */}
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <Luggage className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <span className="font-semibold">Carry-on Bag</span>
                              <p className="text-xs text-muted-foreground">Overhead bin</p>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500 text-primary-foreground">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Included
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <p>Max Weight: {baggageInfo.carryOn.weight}</p>
                          <p>Max Size: {baggageInfo.carryOn.size}</p>
                        </div>
                      </div>

                      {/* Checked Bag */}
                      <div className={cn(
                        "p-4 rounded-xl border",
                        baggageInfo.checked.allowed 
                          ? "bg-emerald-500/10 border-emerald-500/30" 
                          : "bg-muted/50 border-border"
                      )}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              baggageInfo.checked.allowed ? "bg-emerald-500/20" : "bg-muted"
                            )}>
                              <Luggage className={cn(
                                "w-5 h-5",
                                baggageInfo.checked.allowed ? "text-emerald-500" : "text-muted-foreground"
                              )} />
                            </div>
                            <div>
                              <span className="font-semibold">Checked Baggage</span>
                              <p className="text-xs text-muted-foreground">Hold luggage</p>
                            </div>
                          </div>
                          <Badge className={baggageInfo.checked.allowed 
                            ? "bg-emerald-500 text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                          }>
                            {baggageInfo.checked.allowed ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> {baggageInfo.checked.fee}</>
                            ) : (
                              <><XCircle className="w-3 h-3 mr-1" /> Extra Fee</>
                            )}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <p>Allowance: {baggageInfo.checked.weight}</p>
                          <p>Extra bags available</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Amenities Tab */}
                <TabsContent value="amenities" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Armchair className="w-5 h-5 text-sky-500" />
                        {cabinClassLabel} Amenities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {amenities.map((amenity) => (
                          <div
                            key={amenity.label}
                            className={cn(
                              "p-4 rounded-xl flex items-center gap-4 transition-all",
                              amenity.available
                                ? "bg-emerald-500/10 border border-emerald-500/30"
                                : "bg-muted/50 border border-border"
                            )}
                          >
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                              amenity.available ? "bg-emerald-500/20" : "bg-muted"
                            )}>
                              <amenity.icon className={cn(
                                "w-6 h-6",
                                amenity.available ? "text-emerald-500" : "text-muted-foreground"
                              )} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{amenity.label}</p>
                              <p className="text-sm text-muted-foreground">{amenity.desc}</p>
                            </div>
                            {amenity.available ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Policies Tab */}
                <TabsContent value="policies" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-sky-500" />
                        Booking Policies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="font-semibold">Free Cancellation</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Cancel for free within 24 hours of booking</p>
                      </div>
                      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30">
                        <div className="flex items-center gap-3 mb-2">
                          <RefreshCw className="w-5 h-5 text-sky-500" />
                          <span className="font-semibold">Flexible Changes</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Change your flight for a fee (fare difference may apply)</p>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard className="w-5 h-5 text-amber-500" />
                          <span className="font-semibold">Secure Payment</span>
                        </div>
                        <p className="text-sm text-muted-foreground">All payments are encrypted and secure</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Booking Summary with Consent */}
            <div className="lg:col-span-1 hidden lg:block">
              <FlightBookingSidebar
                basePrice={flight.price}
                passengers={passengerCount}
                cabinClass={searchParams?.cabinClass || "economy"}
                baggage={sidebarBaggage}
                fareRules={fareRules}
                onContinue={handleBookNow}
                isLoading={isRedirecting}
              />
            </div>
          </div>
        </div>

        {/* How Booking Works */}
        <HowBookingWorks variant="horizontal" />

        {/* Trust Badges */}
        <FlightTrustBadgesBar variant="compact" className="py-6 border-y border-border/50" />

        {/* Support Notice - At Bottom */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center p-6 bg-muted/30 rounded-2xl">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-sky-500" />
              <h3 className="font-semibold">Need Help with Your Booking?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {FLIGHT_DISCLAIMERS.support}
            </p>
            <p className="text-xs text-muted-foreground">
              For website issues, contact{" "}
              <a href="mailto:info@hizivo.com" className="text-sky-500 hover:underline">
                info@hizivo.com
              </a>
            </p>
          </div>
        </section>
      </main>

      {/* Mobile Sticky CTA with Consent */}
      <FlightDetailStickyCTA
        price={flight.price}
        currency="USD"
        passengers={passengerCount}
        onContinue={() => {
          // For mobile CTA, the consent is handled inside the component
          setConsentChecked(true);
          handleBookNow();
        }}
        isLoading={isRedirecting}
        consentRequired={true}
      />

      <Footer />
    </div>
  );
};

export default FlightDetails;