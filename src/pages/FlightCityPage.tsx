/**
 * Flight City Landing Page
 * SEO-optimized page for flights to a specific city
 * /flights/cities/{city-slug} - e.g., /flights/cities/tokyo
 */

import { useParams, Navigate, Link } from 'react-router-dom';
import { Plane, MapPin, Hotel, Car } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { FlightSearchFormPro } from '@/components/search';
import FlightBreadcrumbs from '@/components/seo/FlightBreadcrumbs';
import FlightSearchSchema from '@/components/seo/FlightSearchSchema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GlobalTrustBar from '@/components/shared/GlobalTrustBar';
import PopularRoutesGrid from '@/components/seo/PopularRoutesGrid';
import { FLIGHT_SEO_DISCLAIMERS, FLIGHT_SEO_INTRO, FLIGHT_SEO_H1 } from '@/config/flightSEOContent';
import { parseCitySlug, generateRouteUrl } from '@/utils/seoUtils';
import { CITIES, type City } from '@/data/cities';

// Map city data for this page
const citiesData = CITIES.map(c => ({
  ...c,
  iata: c.id.toUpperCase(),
}));

// Map city slugs to IATA codes for search prefill
const cityToIata: Record<string, string> = {
  'new york': 'JFK',
  'los angeles': 'LAX',
  'san francisco': 'SFO',
  'chicago': 'ORD',
  'miami': 'MIA',
  'london': 'LHR',
  'paris': 'CDG',
  'tokyo': 'NRT',
  'dubai': 'DXB',
  'singapore': 'SIN',
  'hong kong': 'HKG',
  'sydney': 'SYD',
  'toronto': 'YYZ',
  'cancun': 'CUN',
  'barcelona': 'BCN',
  'amsterdam': 'AMS',
  'frankfurt': 'FRA',
  'rome': 'FCO',
  'bangkok': 'BKK',
  'seoul': 'ICN',
  'honolulu': 'HNL',
  'las vegas': 'LAS',
};

const FlightCityPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  
  // Parse city name from slug
  const cityName = citySlug ? parseCitySlug(citySlug) : '';
  const cityKey = cityName.toLowerCase();
  
  // Find city data - check both name and slug
  const city = citiesData.find(
    c => c.name.toLowerCase() === cityKey || c.slug === citySlug
  );
  
  // Get IATA code for search prefill
  const iataCode = cityToIata[cityKey] || city?.iata || '';

  // Redirect to flights page if city not found
  if (!citySlug) {
    return <Navigate to="/flights" replace />;
  }

  const title = `Flights to ${cityName} – Search & Book | ZIVO`;
  const description = FLIGHT_SEO_INTRO.cityIntro(cityName);
  const h1 = FLIGHT_SEO_H1.cityTo(cityName);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={title}
        description={description}
        canonical={`/flights/cities/${citySlug}`}
      />
      <FlightSearchSchema destination={iataCode} />
      <Header />

      <main className="pt-16">
        {/* Breadcrumbs */}
        <FlightBreadcrumbs cityName={cityName} currentPage="search" />

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-8">
              {/* H1 */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <Plane className="w-8 h-8 text-primary -rotate-45" />
                {h1}
              </h1>
              
              {/* Location Info */}
              {city && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
                  <MapPin className="w-4 h-4" />
                  {city.country}
                  {iataCode && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-muted text-xs font-medium">
                      {iataCode}
                    </span>
                  )}
                </div>
              )}

              {/* Intro Text */}
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {description}
              </p>
            </div>

            {/* Search Form */}
            <div className="max-w-4xl mx-auto">
              <FlightSearchFormPro
                initialTo={iataCode}
                navigateOnSearch={true}
              />
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <GlobalTrustBar variant="compact" />

        {/* Popular Routes to This City */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <PopularRoutesGrid
              toCity={cityName}
              onSelectRoute={(from, to) => {
                // Navigate handled by the grid component
              }}
            />
          </div>
        </section>

        {/* Cross-Sell: Hotels & Cars */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold mb-4 text-center">
              Complete Your Trip to {cityName}
            </h2>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Link to={`/hotels/${citySlug}`}>
                <Card className="hover:border-primary/50 transition-colors group h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Hotel className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        Hotels in {cityName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Find great places to stay
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link to={`/rent-car/${citySlug}`}>
                <Card className="hover:border-primary/50 transition-colors group h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Car className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        Car Rentals in {cityName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Explore at your own pace
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* SEO Content Block */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-xl font-bold mb-4">
              Book Flights to {cityName} on ZIVO
            </h2>
            <p className="text-muted-foreground mb-4">
              ZIVO helps travelers find the best flight deals to {cityName}. 
              Search real-time prices from global airlines, view final fares, and book securely. 
              Tickets are issued instantly after payment by our licensed ticketing partners.
            </p>
            <p className="text-xs text-muted-foreground">
              {FLIGHT_SEO_DISCLAIMERS.priceNote}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FlightCityPage;
