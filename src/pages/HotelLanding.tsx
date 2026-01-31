import { useParams, useNavigate, Link } from "react-router-dom";
import { Hotel, Search, Star, MapPin, ArrowRight, Shield, Clock, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import TrustIndicators from "@/components/shared/TrustIndicators";
import { cn } from "@/lib/utils";
import { useState } from "react";

const popularCities = [
  { city: "New York", country: "USA", image: "🗽", hotels: 2450, avgPrice: 189 },
  { city: "Paris", country: "France", image: "🗼", hotels: 1890, avgPrice: 165 },
  { city: "London", country: "UK", image: "🎡", hotels: 1980, avgPrice: 175 },
  { city: "Tokyo", country: "Japan", image: "🏯", hotels: 2100, avgPrice: 142 },
  { city: "Dubai", country: "UAE", image: "🌴", hotels: 1250, avgPrice: 225 },
  { city: "Barcelona", country: "Spain", image: "⛪", hotels: 1120, avgPrice: 135 },
  { city: "Miami", country: "USA", image: "🏖️", hotels: 890, avgPrice: 168 },
  { city: "Sydney", country: "Australia", image: "🦘", hotels: 890, avgPrice: 168 },
];

const trustBadges = [
  { icon: Shield, text: "Secure booking with partners" },
  { icon: CheckCircle, text: "No booking fees on ZIVO" },
  { icon: Clock, text: "24/7 customer support" },
];

export default function HotelLanding() {
  const { city } = useParams<{ city?: string }>();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(city?.replace(/-/g, " ") || "");

  const formattedCity = city?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  const pageTitle = formattedCity 
    ? `Hotels in ${formattedCity} - Compare Prices | ZIVO`
    : "Compare Hotel Prices from 500+ Partners | ZIVO";
  
  const pageDescription = formattedCity
    ? `Find the best hotel deals in ${formattedCity}. Compare prices from Booking.com, Expedia, Hotels.com and more. No booking fees on ZIVO.`
    : "Compare hotel prices from 500+ trusted travel partners. Find the best rates on hotels worldwide. No booking fees on ZIVO.";

  const handleSearch = () => {
    if (destination) {
      navigate(`/book-hotel?destination=${encodeURIComponent(destination)}`);
    } else {
      navigate("/book-hotel");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={pageTitle} description={pageDescription} />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-amber-500/15 to-orange-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm font-medium mb-6">
                <Hotel className="w-4 h-4 text-amber-400" />
                <span className="text-muted-foreground">Compare hotel prices</span>
              </div>
              
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {formattedCity ? (
                  <>Hotels in <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{formattedCity}</span></>
                ) : (
                  <>Find the <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Best Hotel Deals</span></>
                )}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Compare prices from Booking.com, Expedia, Hotels.com and 500+ trusted partners. No booking fees on ZIVO.
              </p>

              {/* Search Form */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                  <Input
                    type="text"
                    placeholder="Where do you want to stay?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-12 h-14 text-lg rounded-2xl bg-card border-border/50 focus:border-amber-500/50"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  size="lg" 
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Hotels
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <badge.icon className="w-4 h-4 text-amber-400" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Cities */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-display text-2xl font-bold">Popular Destinations</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {popularCities.map((dest, index) => (
                <Link
                  key={dest.city}
                  to={`/hotels/in-${dest.city.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "group p-4 rounded-2xl border border-border/50 bg-card/50",
                    "hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10",
                    "transition-all duration-300 hover:-translate-y-1"
                  )}
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{dest.image}</div>
                  <h3 className="font-bold group-hover:text-amber-400 transition-colors">{dest.city}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{dest.country}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{dest.hotels.toLocaleString()} hotels</span>
                    <span className="font-bold text-amber-400">From ${dest.avgPrice}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-center mb-10">How ZIVO Works</h2>
            <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Search", desc: "Enter your destination and dates" },
                { step: "2", title: "Compare", desc: "See prices from 500+ partners" },
                { step: "3", title: "Book", desc: "Complete booking on partner site" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TrustIndicators />

        {/* Affiliate Disclaimer */}
        <section className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              ZIVO may earn a commission when you book through our partner links at no extra cost to you. 
              ZIVO does not sell hotel rooms directly. All bookings are completed on partner websites. 
              Prices are indicative and subject to change.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
