/**
 * Car Rental Results Page
 * Displays search results with proper URL params and affiliate tracking
 */

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Car, Shield, CheckCircle, ExternalLink, Search as SearchIcon, 
  AlertCircle, ArrowLeft, Filter, Users, Briefcase, Snowflake 
} from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useRealCarSearch, buildPrimaryCarUrl, type CarResult, type CarSearchParams } from "@/hooks/useRealCarSearch";
import { getAirportByCode } from "@/components/car/AirportAutocomplete";
import { CAR_PARTNERS } from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import { cn } from "@/lib/utils";

// Parse and validate URL parameters
interface ParsedSearchParams {
  pickupCode: string;
  pickupLabel: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  driverAge: number;
  isValid: boolean;
  errors: string[];
}

function parseSearchParams(searchParams: URLSearchParams): ParsedSearchParams {
  const errors: string[] = [];
  
  // Pickup location
  const pickupCode = (searchParams.get("pickup") || "").toUpperCase();
  const airport = getAirportByCode(pickupCode);
  const pickupLabel = airport 
    ? `${airport.city} (${airport.code})`
    : pickupCode;
  
  if (!pickupCode || pickupCode.length !== 3) {
    errors.push("Invalid pickup location code");
  }
  
  // Dates
  const pickupDate = searchParams.get("pickup_date") || "";
  const dropoffDate = searchParams.get("dropoff_date") || "";
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(pickupDate)) {
    errors.push("Invalid pickup date format");
  }
  if (!dateRegex.test(dropoffDate)) {
    errors.push("Invalid dropoff date format");
  }
  
  if (pickupDate && dropoffDate) {
    const pickupDateTime = new Date(pickupDate);
    const dropoffDateTime = new Date(dropoffDate);
    if (dropoffDateTime < pickupDateTime) {
      errors.push("Dropoff date must be after pickup date");
    }
  }
  
  // Times
  const pickupTime = searchParams.get("pickup_time") || "10:00";
  const dropoffTime = searchParams.get("dropoff_time") || "10:00";
  
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(pickupTime)) {
    errors.push("Invalid pickup time format");
  }
  if (!timeRegex.test(dropoffTime)) {
    errors.push("Invalid dropoff time format");
  }
  
  // Driver age
  const driverAge = parseInt(searchParams.get("age") || "25", 10);
  if (isNaN(driverAge) || driverAge < 18 || driverAge > 99) {
    errors.push("Driver age must be between 18 and 99");
  }
  
  return {
    pickupCode,
    pickupLabel,
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    driverAge: isNaN(driverAge) ? 25 : Math.min(99, Math.max(18, driverAge)),
    isValid: errors.length === 0,
    errors,
  };
}

// Car Result Card Component
function CarResultCard({ 
  car, 
  days,
  onViewDeal,
}: { 
  car: CarResult; 
  days: number;
  onViewDeal: (car: CarResult) => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Car Image/Icon */}
          <div className="sm:w-48 h-32 sm:h-auto bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center p-4">
            <span className="text-6xl">{car.categoryIcon}</span>
          </div>
          
          {/* Details */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg">{car.category}</h3>
                <p className="text-sm text-muted-foreground">{car.company}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                or similar
              </Badge>
            </div>
            
            {/* Features */}
            <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-violet-500" />
                {car.seats}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-violet-500" />
                {car.bags}
              </div>
              {car.hasAC && (
                <div className="flex items-center gap-1">
                  <Snowflake className="w-4 h-4 text-violet-500" />
                  A/C
                </div>
              )}
              <span>{car.transmission}</span>
            </div>
            
            {/* Policies */}
            <div className="flex flex-wrap gap-2 mb-3">
              {car.features.map((feature, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">
                {car.mileage}
              </Badge>
            </div>
          </div>
          
          {/* Price & CTA */}
          <div className="sm:w-48 p-4 bg-muted/30 flex flex-col justify-center items-center sm:items-end border-t sm:border-t-0 sm:border-l border-border/50">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">From*</p>
              <p className="text-2xl font-bold text-violet-500">
                ${car.pricePerDay}
                <span className="text-sm font-normal text-muted-foreground">/day</span>
              </p>
              <p className="text-sm text-muted-foreground">
                ${car.totalPrice} total for {days} day{days !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={() => onViewDeal(car)}
              className="mt-3 w-full bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              View Deal
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CarResultsPage() {
  const [searchParams] = useSearchParams();
  
  const { isLoading, results, search, partnerUrls, isRealPrice, getPartners } = useRealCarSearch();
  
  // Parse URL params
  const parsed = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const { pickupCode, pickupLabel, pickupDate, pickupTime, dropoffDate, dropoffTime, driverAge, isValid, errors } = parsed;
  
  // Calculate rental days
  const days = useMemo(() => {
    if (!pickupDate || !dropoffDate) return 0;
    try {
      return Math.max(1, differenceInDays(parseISO(dropoffDate), parseISO(pickupDate)));
    } catch {
      return 0;
    }
  }, [pickupDate, dropoffDate]);
  
  // Perform search on mount and when params change
  useEffect(() => {
    if (isValid && pickupCode && pickupDate && dropoffDate) {
      search({
        pickupCode,
        pickupLabel,
        pickupDate,
        pickupTime,
        dropoffDate,
        dropoffTime,
        driverAge,
      });
    }
  }, [pickupCode, pickupLabel, pickupDate, pickupTime, dropoffDate, dropoffTime, driverAge, isValid]);
  
  // Handle view deal click - redirect through /out
  const handleViewDeal = (car: CarResult) => {
    // Build tracking URL
    const outParams = new URLSearchParams({
      pickup: pickupCode,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      dropoff_date: dropoffDate,
      dropoff_time: dropoffTime,
      age: String(driverAge),
      carId: car.id,
      category: car.category,
      price: String(car.pricePerDay),
      partner: 'economybookings',
      product: 'cars',
      source: 'result_card',
    });
    
    // Add UTM params from current URL
    const utmSource = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');
    const creator = searchParams.get('creator');
    
    if (utmSource) outParams.set('utm_source', utmSource);
    if (utmCampaign) outParams.set('utm_campaign', utmCampaign);
    if (creator) outParams.set('creator', creator);
    
    // Track click
    trackAffiliateClick({
      flightId: car.id,
      airline: car.company,
      airlineCode: 'CAR',
      origin: pickupCode,
      destination: pickupCode,
      price: car.pricePerDay,
      passengers: 1,
      cabinClass: 'standard',
      affiliatePartner: 'economybookings',
      referralUrl: `/out?${outParams.toString()}`,
      source: 'car_result_card',
      ctaType: 'result_card',
      serviceType: 'car_rental',
    });
    
    // Open /out redirect
    window.open(`/out?${outParams.toString()}`, "_blank", "noopener,noreferrer");
  };
  
  // Handle "Compare All Partners" CTA
  const handleComparePartners = (partnerId: string) => {
    const partner = getPartners().find(p => p.id === partnerId);
    if (!partner) return;
    
    trackAffiliateClick({
      flightId: `cars-${pickupCode}-all`,
      airline: partner.name,
      airlineCode: 'CAR',
      origin: pickupCode,
      destination: pickupCode,
      price: 0,
      passengers: 1,
      cabinClass: 'standard',
      affiliatePartner: partnerId,
      referralUrl: partner.trackingUrl,
      source: 'partner_cta',
      ctaType: 'top_cta',
      serviceType: 'car_rental',
    });
    
    window.open(partner.trackingUrl, "_blank", "noopener,noreferrer");
  };
  
  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEE, MMM d");
    } catch {
      return dateStr;
    }
  };
  
  const airport = getAirportByCode(pickupCode);
  const locationName = airport?.city || pickupCode;
  
  const pageTitle = locationName 
    ? `Car Rentals in ${locationName} | From $${results[0]?.pricePerDay || 25}/day | ZIVO`
    : "Car Rental Search Results | ZIVO";
  
  const pageDescription = locationName
    ? `Compare ${results.length}+ car rental options in ${locationName}. ${pickupDate && dropoffDate ? `${days} days, ${formatDisplayDate(pickupDate)} - ${formatDisplayDate(dropoffDate)}.` : ''} Book securely on partner sites.`
    : "Search and compare car rental prices across booking sites.";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={pageTitle} description={pageDescription} />
      <Header />
      
      <main className="pt-16">
        {/* Compact Search Header */}
        <section className="bg-gradient-to-b from-violet-950/30 to-background border-b border-border/50 py-6">
          <div className="container mx-auto px-4">
            {/* Back link */}
            <Link 
              to="/rent-car"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              New search
            </Link>
            
            {/* Search summary */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold">
                Car Rentals in <span className="text-violet-500">{locationName}</span>
              </h1>
              {pickupDate && dropoffDate && (
                <Badge variant="secondary" className="text-sm">
                  {formatDisplayDate(pickupDate)} – {formatDisplayDate(dropoffDate)} ({days} day{days !== 1 ? 's' : ''})
                </Badge>
              )}
            </div>
            
            {/* Partner CTAs */}
            <div className="flex flex-wrap gap-2">
              {getPartners().slice(0, 3).map((partner) => (
                <Button
                  key={partner.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleComparePartners(partner.id)}
                  className="gap-2"
                >
                  <span>{partner.logo}</span>
                  {partner.name}
                  <ExternalLink className="w-3 h-3" />
                </Button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Validation Errors */}
        {!isValid && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Invalid search parameters:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                  <Link to="/rent-car" className="text-violet-500 underline mt-2 inline-block">
                    Start a new search →
                  </Link>
                </AlertDescription>
              </Alert>
            </div>
          </section>
        )}
        
        {/* Results Section */}
        {isValid && (
          <section className="py-6">
            <div className="container mx-auto px-4">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-4 gap-4">
                <div>
                  {!isLoading && (
                    <p className="text-sm text-muted-foreground">
                      {results.length} car{results.length !== 1 ? 's' : ''} found
                      {!isRealPrice && " • Indicative prices*"}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Indicative Price Notice */}
              {!isRealPrice && !isLoading && results.length > 0 && (
                <Alert className="mb-4 border-violet-500/30 bg-violet-500/5">
                  <Car className="h-4 w-4 text-violet-500" />
                  <AlertDescription className="text-sm">
                    Prices shown are indicative and may vary. View real-time prices and availability on partner sites.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Loading State */}
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-48 h-32 bg-muted rounded" />
                          <div className="flex-1 space-y-3">
                            <div className="h-6 bg-muted rounded w-1/3" />
                            <div className="h-4 bg-muted rounded w-1/2" />
                            <div className="h-4 bg-muted rounded w-1/4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Results */}
              {!isLoading && results.length > 0 && (
                <div className="space-y-4">
                  {results.map((car) => (
                    <CarResultCard
                      key={car.id}
                      car={car}
                      days={days}
                      onViewDeal={handleViewDeal}
                    />
                  ))}
                </div>
              )}
              
              {/* No Results */}
              {!isLoading && results.length === 0 && isValid && (
                <div className="text-center py-16 bg-muted/30 rounded-xl">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No cars found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try different dates or another location.
                  </p>
                  <Button
                    onClick={() => handleComparePartners('economybookings')}
                    className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                  >
                    Search on EconomyBookings
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Partner Redirect Notice */}
              {results.length > 0 && (
                <div className="mt-6 p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-violet-500 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Clicking "View Deal" will redirect you to our trusted car rental partner to complete your booking.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Affiliate Disclaimer */}
        <section className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              *Prices shown are indicative estimates. Final prices are displayed on partner booking sites.
              ZIVO may earn a commission when users book through partner links.
              Bookings are completed on partner websites.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
