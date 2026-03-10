/**
 * COUNTRY HUB PAGE
 * 
 * Localized landing page for each country
 * /us, /uk, /ca, /eu etc.
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Plane, Hotel, Car, ArrowRight, MapPin, TrendingUp, Globe, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  getCountryFromSlug, 
  INTERNATIONAL_COMPLIANCE,
  type CountryConfig 
} from "@/config/internationalExpansion";
// InternationalCompliance removed

export default function CountryHubPage() {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const country = countrySlug ? getCountryFromSlug(countrySlug) : undefined;
  
  // Redirect to home if country not found or not launched
  if (!country || !country.isLaunched) {
    return <Navigate to="/" replace />;
  }
  
  const popularRoutes = country.popularRoutes || [];
  
  return (
    <>
      <Helmet>
        <title>ZIVO {country.name} | Compare Flights, Hotels & Car Rentals</title>
        <meta 
          name="description" 
          content={`Search and compare flights, hotels, and car rentals in ${country.name}. Find the best travel deals from trusted partners. Prices in ${country.currency}.`}
        />
        <link rel="canonical" href={`https://hizivo.com/${countrySlug}`} />
        <meta property="og:title" content={`ZIVO ${country.name} – Travel Search & Compare`} />
        <meta property="og:description" content={`Compare travel options across ${country.name}. Flights, hotels, cars – all in one place.`} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Hero */}
          <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-amber-500/5 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{country.flag}</span>
                <Badge variant="outline" className="text-sm">
                  {country.currency}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Travel Search for <span className="text-primary">{country.name}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mb-8">
                Compare flights, hotels, and car rentals from trusted partners. 
                Prices shown in {country.currency}. Book with confidence.
              </p>
              
              {/* Coming Soon Notice */}
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-500">Coming Soon</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Travel search for {country.name} is launching soon. Stay tuned for flights, hotels, and car rental comparisons.
                </p>
              </div>
            </div>
          </section>
          
          {/* Services */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">
                What would you like to book?
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Link to="/flights">
                  <Card className="group hover:border-sky-500/50 transition-all cursor-pointer h-full">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-3 group-hover:bg-sky-500/20 transition-colors">
                        <Plane className="w-6 h-6 text-sky-500" />
                      </div>
                      <CardTitle className="flex items-center justify-between">
                        Flights
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-sky-500 transition-colors" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Compare prices from airlines and travel partners worldwide
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/hotels">
                  <Card className="group hover:border-amber-500/50 transition-all cursor-pointer h-full">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3 group-hover:bg-amber-500/20 transition-colors">
                        <Hotel className="w-6 h-6 text-amber-500" />
                      </div>
                      <CardTitle className="flex items-center justify-between">
                        Hotels
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Find accommodations from budget to luxury
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/rent-car">
                  <Card className="group hover:border-emerald-500/50 transition-all cursor-pointer h-full">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                        <Car className="w-6 h-6 text-emerald-500" />
                      </div>
                      <CardTitle className="flex items-center justify-between">
                        Car Rental
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Rent vehicles from trusted rental partners
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </section>
          
          {/* Popular Routes */}
          {popularRoutes.length > 0 && (
            <section className="py-16 bg-muted/30">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Popular Routes from {country.name}
                </h2>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {popularRoutes.map((route, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-medium">{route}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Compare prices from multiple airlines
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}
          
          {/* Currency & Payment Info */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-8 text-center">
                  Booking in {country.name}
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Globe className="w-5 h-5 text-primary" />
                        Currency
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold mb-2">{country.currency}</p>
                      <p className="text-sm text-muted-foreground">
                        Prices displayed in {country.currency}. Final payment in partner's currency may vary.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        Payment Safety
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {INTERNATIONAL_COMPLIANCE.taxDisclaimer}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
          
          {/* Compliance Footer */}
          <section className="py-8 border-t border-border">
            <div className="container mx-auto px-4">
              <p className="text-xs text-muted-foreground">Prices are estimates and may vary. Final prices confirmed at checkout.</p>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
