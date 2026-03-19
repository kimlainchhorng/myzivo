/**
 * Passenger Details Page — /flights/traveler-info
 * Collects traveler information for each passenger
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Plane } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { DuffelOffer } from "@/hooks/useDuffelFlights";

interface PassengerForm {
  title: string;
  given_name: string;
  family_name: string;
  gender: "m" | "f" | "";
  born_on: string;
  email: string;
  phone_number: string;
}

const emptyPassenger = (): PassengerForm => ({
  title: "mr",
  given_name: "",
  family_name: "",
  gender: "",
  born_on: "",
  email: "",
  phone_number: "",
});

const FlightTravelerInfo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const offerRaw = sessionStorage.getItem("zivo_selected_offer");
  const searchRaw = sessionStorage.getItem("zivo_search_params");
  const offer: DuffelOffer | null = offerRaw ? JSON.parse(offerRaw) : null;
  const search = searchRaw ? JSON.parse(searchRaw) : null;

  const totalPassengers = search ? (search.adults || 1) + (search.children || 0) + (search.infants || 0) : 1;

  const [passengers, setPassengers] = useState<PassengerForm[]>(() => {
    const saved = sessionStorage.getItem("zivo_passengers");
    if (saved) return JSON.parse(saved);
    const list = Array.from({ length: totalPassengers }, () => emptyPassenger());
    // Pre-fill first passenger from auth
    if (user?.email) list[0].email = user.email;
    return list;
  });

  useEffect(() => {
    if (!offer) navigate("/flights", { replace: true });
  }, [offer, navigate]);

  if (!offer || !search) return null;

  const updatePassenger = (index: number, field: keyof PassengerForm, value: string) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const validate = (): string | null => {
    const nameRegex = /^[a-zA-Z\s\-']{2,}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!nameRegex.test(p.given_name)) return `Passenger ${i + 1}: Enter a valid first name`;
      if (!nameRegex.test(p.family_name)) return `Passenger ${i + 1}: Enter a valid last name`;
      if (!p.gender) return `Passenger ${i + 1}: Select gender`;
      if (!p.born_on) return `Passenger ${i + 1}: Enter date of birth`;
      if (!emailRegex.test(p.email)) return `Passenger ${i + 1}: Enter a valid email`;
    }
    return null;
  };

  const handleContinue = () => {
    const err = validate();
    if (err) {
      toast({ title: "Missing Information", description: err, variant: "destructive" });
      return;
    }
    sessionStorage.setItem("zivo_passengers", JSON.stringify(passengers));
    navigate("/flights/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Traveler Details – ZIVO Flights" description="Enter passenger information for your flight booking." />
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Traveler Details</h1>
              <p className="text-sm text-muted-foreground">
                {offer.departure.code} → {offer.arrival.code} · {offer.airline}
              </p>
            </div>
          </div>

          {/* Flight summary mini card */}
          <Card className="mb-6 border-[hsl(var(--flights))]/20 bg-[hsl(var(--flights-light))]">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plane className="w-5 h-5 text-[hsl(var(--flights))]" />
                <div>
                  <p className="text-sm font-semibold">{offer.departure.time} → {offer.arrival.time}</p>
                  <p className="text-xs text-muted-foreground">{offer.duration} · {offer.stops === 0 ? "Direct" : `${offer.stops} stop`}</p>
                </div>
              </div>
              <p className="font-bold text-[hsl(var(--flights))]">${Math.round(offer.price)}<span className="text-xs font-normal text-muted-foreground">/person</span></p>
            </CardContent>
          </Card>

          {/* Passenger Forms */}
          <div className="space-y-4">
            {passengers.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="w-4 h-4 text-[hsl(var(--flights))]" />
                      Passenger {idx + 1}
                      {idx < (search.adults || 1) ? (
                        <span className="text-xs text-muted-foreground font-normal">(Adult)</span>
                      ) : idx < (search.adults || 1) + (search.children || 0) ? (
                        <span className="text-xs text-muted-foreground font-normal">(Child)</span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-normal">(Infant)</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={p.title} onValueChange={(v) => updatePassenger(idx, "title", v)}>
                        <SelectTrigger><SelectValue placeholder="Title" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mr">Mr</SelectItem>
                          <SelectItem value="ms">Ms</SelectItem>
                          <SelectItem value="mrs">Mrs</SelectItem>
                          <SelectItem value="miss">Miss</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={p.gender} onValueChange={(v) => updatePassenger(idx, "gender", v)}>
                        <SelectTrigger className={!p.gender ? "text-muted-foreground" : ""}>
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m">Male</SelectItem>
                          <SelectItem value="f">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="First name"
                        value={p.given_name}
                        onChange={(e) => updatePassenger(idx, "given_name", e.target.value)}
                      />
                      <Input
                        placeholder="Last name"
                        value={p.family_name}
                        onChange={(e) => updatePassenger(idx, "family_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Date of Birth</label>
                      <Input
                        type="date"
                        value={p.born_on}
                        onChange={(e) => updatePassenger(idx, "born_on", e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={p.email}
                        onChange={(e) => updatePassenger(idx, "email", e.target.value)}
                      />
                      <Input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={p.phone_number}
                        onChange={(e) => updatePassenger(idx, "phone_number", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Button
            size="lg"
            onClick={handleContinue}
            className="w-full mt-6 h-12 text-base font-semibold bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90"
          >
            Continue to Checkout
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightTravelerInfo;
