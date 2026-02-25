import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Coffee,
  Wifi,
  ShowerHead,
  Utensils,
  Armchair,
  Briefcase,
  Wine,
  Baby,
  Accessibility,
  Clock,
  Star,
  MapPin,
  Users,
  CheckCircle2,
  QrCode,
  CreditCard,
  Sparkles,
  Crown,
  Plane,
  Building2,
  Dumbbell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

interface Lounge {
  id: string;
  name: string;
  airport: string;
  terminal: string;
  tier: "standard" | "premium" | "luxury";
  price: number;
  rating: number;
  reviewCount: number;
  openHours: string;
  maxStay: number;
  capacity: number;
  currentOccupancy: number;
  amenities: string[];
  image: string;
  description: string;
  nearGates: string[];
}

interface LoungePass {
  id: string;
  loungeId: string;
  loungeName: string;
  validFrom: Date;
  validUntil: Date;
  guestCount: number;
  qrCode: string;
  status: "active" | "used" | "expired";
}

interface AirportLoungeAccessProps {
  airport: string;
  terminal: string;
  flightTime: Date;
  onLoungeBooked?: (loungeId: string, guests: number) => void;
}

const amenityIcons: Record<string, typeof Coffee> = {
  "Free WiFi": Wifi,
  "Hot Meals": Utensils,
  "Premium Bar": Wine,
  "Shower Suites": ShowerHead,
  "Business Center": Briefcase,
  "Quiet Zone": Armchair,
  "Kids Area": Baby,
  "Wheelchair Access": Accessibility,
  "Barista Coffee": Coffee,
  "Spa Services": Sparkles,
};

const mockLounges: Lounge[] = [
  {
    id: "lounge_1",
    name: "SkyView Executive Lounge",
    airport: "JFK",
    terminal: "Terminal 4",
    tier: "premium",
    price: 65,
    rating: 4.7,
    reviewCount: 1243,
    openHours: "5:00 AM - 11:00 PM",
    maxStay: 3,
    capacity: 120,
    currentOccupancy: 45,
    amenities: ["Free WiFi", "Hot Meals", "Premium Bar", "Shower Suites", "Business Center"],
    image: "executive",
    description: "Panoramic runway views with exceptional dining and spa services.",
    nearGates: ["B1-B15", "C1-C10"],
  },
  {
    id: "lounge_2",
    name: "First Class Retreat",
    airport: "JFK",
    terminal: "Terminal 4",
    tier: "luxury",
    price: 120,
    rating: 4.9,
    reviewCount: 567,
    openHours: "24 Hours",
    maxStay: 6,
    capacity: 50,
    currentOccupancy: 18,
    amenities: ["Free WiFi", "Hot Meals", "Premium Bar", "Shower Suites", "Spa Services", "Quiet Zone"],
    image: "luxury",
    description: "Ultra-exclusive sanctuary with private suites and à la carte dining.",
    nearGates: ["A1-A20"],
  },
  {
    id: "lounge_3",
    name: "Priority Pass Lounge",
    airport: "JFK",
    terminal: "Terminal 4",
    tier: "standard",
    price: 35,
    rating: 4.2,
    reviewCount: 2156,
    openHours: "6:00 AM - 10:00 PM",
    maxStay: 2,
    capacity: 200,
    currentOccupancy: 132,
    amenities: ["Free WiFi", "Hot Meals", "Barista Coffee", "Wheelchair Access"],
    image: "standard",
    description: "Comfortable space with essential amenities for the modern traveler.",
    nearGates: ["B20-B35", "D1-D15"],
  },
  {
    id: "lounge_4",
    name: "Wellness Sanctuary",
    airport: "JFK",
    terminal: "Terminal 4",
    tier: "premium",
    price: 85,
    rating: 4.8,
    reviewCount: 892,
    openHours: "24 Hours",
    maxStay: 4,
    capacity: 80,
    currentOccupancy: 28,
    amenities: ["Free WiFi", "Hot Meals", "Shower Suites", "Spa Services", "Quiet Zone", "Kids Area"],
    image: "wellness",
    description: "Focus on wellness with meditation rooms, yoga mats, and healthy cuisine.",
    nearGates: ["C15-C30"],
  },
];

const AirportLoungeAccess = ({
  airport,
  terminal,
  flightTime,
  onLoungeBooked,
}: AirportLoungeAccessProps) => {
  const [selectedLounge, setSelectedLounge] = useState<Lounge | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [activePasses, setActivePasses] = useState<LoungePass[]>([]);
  const [showPass, setShowPass] = useState<LoungePass | null>(null);
  const [tierFilter, setTierFilter] = useState<string>("all");

  const handleToggleComparison = (loungeId: string) => {
    setComparisonList((prev) =>
      prev.includes(loungeId)
        ? prev.filter((id) => id !== loungeId)
        : prev.length < 3
        ? [...prev, loungeId]
        : prev
    );
  };

  const handleBookLounge = (lounge: Lounge) => {
    const newPass: LoungePass = {
      id: `pass_${Date.now()}`,
      loungeId: lounge.id,
      loungeName: lounge.name,
      validFrom: new Date(),
      validUntil: new Date(flightTime.getTime() + lounge.maxStay * 60 * 60 * 1000),
      guestCount,
      qrCode: `LOUNGE-${lounge.id}-${Date.now()}`,
      status: "active",
    };

    setActivePasses((prev) => [...prev, newPass]);
    setShowPass(newPass);
    onLoungeBooked?.(lounge.id, guestCount);
  };

  const getOccupancyLevel = (lounge: Lounge) => {
    const percentage = (lounge.currentOccupancy / lounge.capacity) * 100;
    if (percentage < 50) return { label: "Quiet", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (percentage < 75) return { label: "Moderate", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { label: "Busy", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const filteredLounges =
    tierFilter === "all" ? mockLounges : mockLounges.filter((l) => l.tier === tierFilter);

  const comparisonLounges = mockLounges.filter((l) => comparisonList.includes(l.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Airport Lounge Access
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {airport} • {terminal}
          </p>
        </div>
        {activePasses.length > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowPass(activePasses[0])}>
            <QrCode className="h-4 w-4" />
            My Passes ({activePasses.length})
          </Button>
        )}
      </div>

      {/* Tier Filters */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {[
            { id: "all", label: "All Lounges" },
            { id: "standard", label: "Standard" },
            { id: "premium", label: "Premium" },
            { id: "luxury", label: "Luxury" },
          ].map((tier) => (
            <Button
              key={tier.id}
              variant={tierFilter === tier.id ? "default" : "outline"}
              size="sm"
              onClick={() => setTierFilter(tier.id)}
            >
              {tier.label}
            </Button>
          ))}
          {comparisonList.length >= 2 && (
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 ml-auto"
              onClick={() => setShowComparison(true)}
            >
              Compare ({comparisonList.length})
            </Button>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Lounge Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredLounges.map((lounge) => {
          const occupancy = getOccupancyLevel(lounge);
          const isInComparison = comparisonList.includes(lounge.id);

          return (
            <motion.div
              key={lounge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card
                className={`overflow-hidden transition-all ${
                  isInComparison ? "ring-2 ring-primary" : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-0">
                  {/* Header Banner */}
                  <div
                    className={`p-4 ${
                      lounge.tier === "luxury"
                        ? "bg-gradient-to-r from-amber-500/20 to-amber-600/20"
                        : lounge.tier === "premium"
                        ? "bg-gradient-to-r from-purple-500/20 to-purple-600/20"
                        : "bg-gradient-to-r from-blue-500/20 to-blue-600/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          {lounge.image === "luxury" ? <Crown className="w-5 h-5 text-amber-400" /> : lounge.image === "wellness" ? <Dumbbell className="w-5 h-5 text-emerald-400" /> : lounge.image === "executive" ? <Building2 className="w-5 h-5 text-purple-400" /> : <Plane className="w-5 h-5 text-sky-400" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{lounge.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {lounge.rating} ({lounge.reviewCount})
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={lounge.tier === "luxury" ? "default" : "secondary"}
                          className={`text-[10px] ${
                            lounge.tier === "luxury"
                              ? "bg-amber-500"
                              : lounge.tier === "premium"
                              ? "bg-purple-500 text-white"
                              : ""
                          }`}
                        >
                          {lounge.tier}
                        </Badge>
                        <p className="font-bold text-lg mt-1">${lounge.price}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {lounge.description}
                    </p>

                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {lounge.openHours}
                      </Badge>
                      <Badge variant="outline" className={`gap-1 ${occupancy.bg} ${occupancy.color} border-0`}>
                        <Users className="h-3 w-3" />
                        {occupancy.label}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        Near {lounge.nearGates[0]}
                      </Badge>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1.5">
                      {lounge.amenities.slice(0, 5).map((amenity) => {
                        const Icon = amenityIcons[amenity] || Coffee;
                        return (
                          <Badge key={amenity} variant="secondary" className="text-[10px] gap-1">
                            <Icon className="h-3 w-3" />
                            {amenity}
                          </Badge>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => setSelectedLounge(lounge)}
                      >
                        Book Now
                      </Button>
                      <Button
                        variant={isInComparison ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleToggleComparison(lounge.id)}
                      >
                        <Checkbox checked={isInComparison} className="pointer-events-none" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Booking Dialog */}
      <Dialog open={!!selectedLounge} onOpenChange={() => setSelectedLounge(null)}>
        <DialogContent className="max-w-md">
          {selectedLounge && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedLounge.image}</span>
                  {selectedLounge.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {/* Guest Selection */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm">Number of guests</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-bold">{guestCount}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGuestCount(Math.min(4, guestCount + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="space-y-2 p-4 rounded-xl border">
                  <div className="flex justify-between text-sm">
                    <span>Lounge access × {guestCount}</span>
                    <span>${selectedLounge.price * guestCount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Max stay</span>
                    <span>{selectedLounge.maxStay} hours</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${selectedLounge.price * guestCount}</span>
                  </div>
                </div>

                {/* Book Button */}
                <Button className="w-full gap-2" size="lg" onClick={() => handleBookLounge(selectedLounge)}>
                  <CreditCard className="h-4 w-4" />
                  Confirm Booking
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Digital Pass Dialog */}
      <Dialog open={!!showPass} onOpenChange={() => setShowPass(null)}>
        <DialogContent className="max-w-sm">
          {showPass && (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                <QRCodeSVG value={showPass.qrCode} size={200} className="mx-auto" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{showPass.loungeName}</h3>
                <p className="text-sm text-muted-foreground">
                  Valid for {showPass.guestCount} guest{showPass.guestCount > 1 && "s"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid from</span>
                  <span className="font-medium">
                    {showPass.validFrom.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Valid until</span>
                  <span className="font-medium">
                    {showPass.validUntil.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
              <Badge className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {showPass.status === "active" ? "Active Pass" : showPass.status}
              </Badge>
              <Button variant="outline" className="w-full gap-2" onClick={() => setShowPass(null)}>
                <Plane className="h-4 w-4" />
                Add to Wallet
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Compare Lounges</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${comparisonLounges.length}, 1fr)` }}>
            {comparisonLounges.map((lounge) => (
              <Card key={lounge.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{lounge.image}</span>
                    {lounge.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-bold">${lounge.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {lounge.rating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Stay</span>
                    <span>{lounge.maxStay}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hours</span>
                    <span className="text-xs">{lounge.openHours}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground text-xs">Amenities</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lounge.amenities.map((a) => (
                        <Badge key={a} variant="outline" className="text-[9px]">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full mt-2" size="sm" onClick={() => {
                    setShowComparison(false);
                    setSelectedLounge(lounge);
                  }}>
                    Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AirportLoungeAccess;
