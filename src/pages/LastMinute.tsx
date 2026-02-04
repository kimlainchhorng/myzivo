/**
 * Last Minute Deals Page
 * Flights departing within 7 days, hotels for tonight/weekend
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Plane,
  Hotel,
  Car,
  ArrowRight,
  Zap,
  Calendar,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock last-minute deals
const lastMinuteFlights = [
  { id: '1', route: 'NYC → Miami', price: 149, originalPrice: 299, departingIn: '2 days', airline: 'Delta' },
  { id: '2', route: 'LAX → Vegas', price: 69, originalPrice: 129, departingIn: 'Tomorrow', airline: 'Southwest' },
  { id: '3', route: 'SFO → Seattle', price: 89, originalPrice: 179, departingIn: '3 days', airline: 'Alaska' },
  { id: '4', route: 'ORD → Denver', price: 99, originalPrice: 199, departingIn: '4 days', airline: 'United' },
];

const lastMinuteHotels = [
  { id: '1', name: 'The Standard', location: 'Miami Beach', price: 159, originalPrice: 299, availability: 'Tonight' },
  { id: '2', name: 'Ace Hotel', location: 'Downtown LA', price: 189, originalPrice: 349, availability: 'This Weekend' },
  { id: '3', name: 'Kimpton Hotel', location: 'San Francisco', price: 199, originalPrice: 399, availability: 'Tonight' },
];

const lastMinuteCars = [
  { id: '1', car: 'Toyota Camry', location: 'LAX Airport', price: 39, originalPrice: 69, pickup: 'Today' },
  { id: '2', car: 'Ford Explorer', location: 'JFK Airport', price: 59, originalPrice: 99, pickup: 'Tomorrow' },
];

export default function LastMinute() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Last Minute Travel Deals – ZIVO"
        description="Spontaneous travel? Find last-minute flights, hotels, and car rentals at discounted prices."
        canonical="https://hizivo.com/last-minute"
      />
      <Header />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden pb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-pink-500/10" />
          
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-violet-500/20 text-violet-500 border-violet-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Departing Soon
              </Badge>

              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Last Minute Getaways
              </h1>

              <p className="text-lg text-muted-foreground mb-6">
                Spontaneous adventures start here. Flights within 7 days, 
                hotels for tonight, and cars available now.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Departing this week
                </Button>
                <Button variant="outline" className="gap-2">
                  <MapPin className="w-4 h-4" />
                  Anywhere
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 space-y-12">
          {/* Last Minute Flights */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Last Minute Flights</h2>
                  <p className="text-sm text-muted-foreground">Departing within 7 days</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/flights" className="gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {lastMinuteFlights.map((flight) => (
                <Card key={flight.id} className="hover:border-sky-500/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-violet-500" />
                      <span className="text-sm font-medium text-violet-500">{flight.departingIn}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{flight.route}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{flight.airline}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">${flight.price}</span>
                      <span className="text-sm text-muted-foreground line-through">${flight.originalPrice}</span>
                    </div>
                    <Button className="w-full mt-3" size="sm">Book Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Last Minute Hotels */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Hotel className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Hotels Available Now</h2>
                  <p className="text-sm text-muted-foreground">Tonight & this weekend</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/hotels" className="gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {lastMinuteHotels.map((hotel) => (
                <Card key={hotel.id} className="hover:border-amber-500/50 transition-colors">
                  <CardContent className="p-4">
                    <Badge className="mb-3 bg-amber-500/10 text-amber-600 border-amber-500/20">
                      {hotel.availability}
                    </Badge>
                    <h3 className="font-semibold mb-1">{hotel.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{hotel.location}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">${hotel.price}</span>
                      <span className="text-sm text-muted-foreground line-through">${hotel.originalPrice}</span>
                      <span className="text-xs text-muted-foreground">/night</span>
                    </div>
                    <Button className="w-full mt-3" size="sm">Book Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Last Minute Cars */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Car className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Car Rentals Available</h2>
                  <p className="text-sm text-muted-foreground">Pick up today or tomorrow</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/rent-car" className="gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {lastMinuteCars.map((car) => (
                <Card key={car.id} className="hover:border-violet-500/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <Badge className="mb-2 bg-violet-500/10 text-violet-600 border-violet-500/20">
                        <Clock className="w-3 h-3 mr-1" />
                        {car.pickup}
                      </Badge>
                      <h3 className="font-semibold mb-1">{car.car}</h3>
                      <p className="text-sm text-muted-foreground">{car.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-xl font-bold">${car.price}</span>
                        <span className="text-xs text-muted-foreground">/day</span>
                      </div>
                      <span className="text-sm text-muted-foreground line-through">${car.originalPrice}/day</span>
                      <Button size="sm" className="mt-2">Book</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Disclaimer */}
        <section className="container mx-auto px-4 mt-12">
          <p className="text-xs text-center text-muted-foreground max-w-2xl mx-auto">
            Last-minute prices are subject to availability and may change. 
            Deals shown are examples; actual availability confirmed during search.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
