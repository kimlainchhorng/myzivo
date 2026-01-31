import { useParams, useNavigate, Link } from "react-router-dom";
import { CarFront, Search, MapPin, ArrowRight, Shield, Clock, CheckCircle, Sparkles, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import TrustIndicators from "@/components/shared/TrustIndicators";
import TravelFAQ from "@/components/shared/TravelFAQ";
import { cn } from "@/lib/utils";
import { useState } from "react";

const popularLocations = [
  { city: "Los Angeles", country: "USA", image: "🌴", avgPrice: 45 },
  { city: "Miami", country: "USA", image: "🏖️", avgPrice: 38 },
  { city: "Las Vegas", country: "USA", image: "🎰", avgPrice: 35 },
  { city: "New York", country: "USA", image: "🗽", avgPrice: 55 },
  { city: "Orlando", country: "USA", image: "🎢", avgPrice: 32 },
  { city: "San Francisco", country: "USA", image: "🌉", avgPrice: 48 },
  { city: "London", country: "UK", image: "🎡", avgPrice: 42 },
  { city: "Paris", country: "France", image: "🗼", avgPrice: 40 },
];

const carTypes = [
  { type: "Economy", example: "Toyota Corolla", price: 25, image: "🚗" },
  { type: "Compact", example: "Honda Civic", price: 35, image: "🚙" },
  { type: "SUV", example: "Toyota RAV4", price: 55, image: "🚐" },
  { type: "Luxury", example: "BMW 5 Series", price: 95, image: "🏎️" },
];

const trustBadges = [
  { icon: Shield, text: "Secure booking with partners" },
  { icon: CheckCircle, text: "No booking fees on ZIVO" },
  { icon: Clock, text: "Free cancellation available" },
];

export default function CarRentalLanding() {
  const { location } = useParams<{ location?: string }>();
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState(location?.replace(/-/g, " ") || "");

  const formattedLocation = location?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  const pageTitle = formattedLocation 
    ? `Car Rental in ${formattedLocation} - Compare Prices | ZIVO`
    : "Compare Car Rental Prices from Top Providers | ZIVO";
  
  const pageDescription = formattedLocation
    ? `Find the best car rental deals in ${formattedLocation}. Compare prices from Hertz, Enterprise, Avis and more. No booking fees on ZIVO.`
    : "Compare car rental prices from trusted providers. Find the best rates on rental cars worldwide. No booking fees on ZIVO.";

  const handleSearch = () => {
    if (pickupLocation) {
      navigate(`/rent-car?location=${encodeURIComponent(pickupLocation)}`);
    } else {
      navigate("/rent-car");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={pageTitle} description={pageDescription} />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-emerald-500/15 to-teal-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium mb-6">
                <CarFront className="w-4 h-4 text-emerald-400" />
                <span className="text-muted-foreground">Compare car rental prices</span>
              </div>
              
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {formattedLocation ? (
                  <>Car Rental in <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">{formattedLocation}</span></>
                ) : (
                  <>Find the <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Best Rental Car Deals</span></>
                )}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Compare prices from Hertz, Enterprise, Avis, Budget and more. No booking fees on ZIVO.
              </p>

              {/* Search Form */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                  <Input
                    type="text"
                    placeholder="Pick-up location"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="pl-12 h-14 text-lg rounded-2xl bg-card border-border/50 focus:border-emerald-500/50"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  size="lg" 
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Cars
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <badge.icon className="w-4 h-4 text-emerald-400" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Car Types */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-center mb-8">Browse by Car Type</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {carTypes.map((car) => (
                <button
                  key={car.type}
                  onClick={() => navigate("/rent-car")}
                  className={cn(
                    "group p-6 rounded-2xl border border-border/50 bg-card/50 text-center",
                    "hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10",
                    "transition-all duration-300 hover:-translate-y-1"
                  )}
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{car.image}</div>
                  <h3 className="font-bold group-hover:text-emerald-400 transition-colors">{car.type}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{car.example}</p>
                  <p className="text-sm font-bold text-emerald-400">From ${car.price}/day*</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Locations */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="font-display text-2xl font-bold">Popular Rental Locations</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {popularLocations.map((loc) => (
                <Link
                  key={loc.city}
                  to={`/car-rental/in-${loc.city.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "group p-4 rounded-2xl border border-border/50 bg-card/50",
                    "hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10",
                    "transition-all duration-300 hover:-translate-y-1"
                  )}
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{loc.image}</div>
                  <h3 className="font-bold group-hover:text-emerald-400 transition-colors">{loc.city}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{loc.country}</p>
                  <p className="text-sm font-bold text-emerald-400">From ${loc.avgPrice}/day*</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <TrustIndicators />

        {/* FAQ Section with Schema */}
        <TravelFAQ serviceType="cars" />

        {/* Redirect Notice */}
        <section className="py-6 bg-emerald-500/5 border-y border-emerald-500/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="w-4 h-4 text-emerald-500" />
              <span>You will be redirected to our trusted travel partner to complete your booking.</span>
            </div>
          </div>
        </section>

        {/* Affiliate Disclaimer */}
        <section className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              *Prices are indicative and subject to change. ZIVO may earn a commission when you book through our partner links at no extra cost to you. 
              ZIVO does not rent cars directly. All bookings are completed on partner websites.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
