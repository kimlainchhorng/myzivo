/**
 * Car Rental Results Page - Unified Design
 * Uses shared results components for consistent UX
 * Integrates affiliate deep links with proper consent + tracking
 */

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Car, AlertCircle, ExternalLink } from "lucide-react";
import DriverCrossSell from "@/components/cross-sell/DriverCrossSell";
import { differenceInDays, format, parseISO } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  StickySearchSummary,
  FiltersSheet,
  FiltersTrigger,
  SortSelect,
  carSortOptions,
  ResultsContainer,
  ResultsHeader,
  ResultsSkeletonList,
  EmptyResults,
  CarResultCard,
  type CarCardData,
  IndicativePriceAlert,
  RedirectNotice,
  AffiliateDisclaimer,
  ResultsBreadcrumbs,
  ResultsFAQ,
  CarEditSearchForm,
} from "@/components/results";
import { useRealCarSearch, type CarResult } from "@/hooks/useRealCarSearch";
import { getAirportByCode } from "@/components/car/AirportAutocomplete";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import PartnerConsentModal from "@/components/checkout/PartnerConsentModal";
import { TRAVELPAYOUTS_DIRECT_LINKS } from "@/config/affiliateLinks";

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

  const pickupCode = (searchParams.get("pickup") || "").toUpperCase();
  const airport = getAirportByCode(pickupCode);
  const pickupLabel = airport ? `${airport.city} (${airport.code})` : pickupCode;

  if (!pickupCode || pickupCode.length !== 3) errors.push("Invalid pickup location code");

  const pickupDate = searchParams.get("pickup_date") || "";
  const dropoffDate = searchParams.get("dropoff_date") || "";

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(pickupDate)) errors.push("Invalid pickup date format");
  if (!dateRegex.test(dropoffDate)) errors.push("Invalid dropoff date format");

  if (pickupDate && dropoffDate) {
    if (new Date(dropoffDate) < new Date(pickupDate)) {
      errors.push("Dropoff date must be after pickup date");
    }
  }

  const pickupTime = searchParams.get("pickup_time") || "10:00";
  const dropoffTime = searchParams.get("dropoff_time") || "10:00";

  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(pickupTime)) errors.push("Invalid pickup time format");
  if (!timeRegex.test(dropoffTime)) errors.push("Invalid dropoff time format");

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

// Filter state
interface CarFilters {
  maxPrice: number;
  categories: string[];
  transmission: string[];
  features: string[];
}

const defaultFilters: CarFilters = {
  maxPrice: 500,
  categories: [],
  transmission: [],
  features: [],
};

export default function CarResultsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<CarFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("price");
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarCardData | null>(null);

  const { isLoading, results, search, isRealPrice, getPartners } = useRealCarSearch();

  const parsed = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const { pickupCode, pickupLabel, pickupDate, pickupTime, dropoffDate, dropoffTime, driverAge, isValid, errors } = parsed;

  const days = useMemo(() => {
    if (!pickupDate || !dropoffDate) return 0;
    try {
      return Math.max(1, differenceInDays(parseISO(dropoffDate), parseISO(pickupDate)));
    } catch {
      return 0;
    }
  }, [pickupDate, dropoffDate]);

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

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = results.filter((car) => car.pricePerDay <= filters.maxPrice);

    if (filters.categories.length > 0) {
      filtered = filtered.filter((car) =>
        filters.categories.some((cat) => car.category.toLowerCase().includes(cat.toLowerCase()))
      );
    }

    if (filters.transmission.length > 0) {
      filtered = filtered.filter((car) => filters.transmission.includes(car.transmission));
    }

    // Sort
    switch (sortBy) {
      case "category":
        return filtered.sort((a, b) => a.category.localeCompare(b.category));
      case "company":
        return filtered.sort((a, b) => a.company.localeCompare(b.company));
      case "price":
      default:
        return filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
    }
  }, [results, filters, sortBy]);

  // Convert to unified card format
  const carCards: CarCardData[] = filteredResults.map((car: CarResult) => ({
    id: car.id,
    category: car.category,
    categoryIcon: car.categoryIcon,
    company: car.company,
    seats: car.seats,
    bags: car.bags,
    transmission: car.transmission as "Automatic" | "Manual",
    hasAC: car.hasAC,
    pricePerDay: car.pricePerDay,
    totalPrice: car.totalPrice,
    days,
    features: car.features,
    mileage: car.mileage,
    freeCancellation: car.features.some((f) => f.toLowerCase().includes("cancel")),
  }));

  const handleViewDeal = (car: CarCardData) => {
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
      partner: "economybookings",
      product: "cars",
      source: "result_card",
    });

    const utmSource = searchParams.get("utm_source");
    const utmCampaign = searchParams.get("utm_campaign");
    const creator = searchParams.get("creator");

    if (utmSource) outParams.set("utm_source", utmSource);
    if (utmCampaign) outParams.set("utm_campaign", utmCampaign);
    if (creator) outParams.set("creator", creator);

    trackAffiliateClick({
      flightId: car.id,
      airline: car.company,
      airlineCode: "CAR",
      origin: pickupCode,
      destination: pickupCode,
      price: car.pricePerDay,
      passengers: 1,
      cabinClass: "standard",
      affiliatePartner: "economybookings",
      referralUrl: `/out?${outParams.toString()}`,
      source: "car_result_card",
      ctaType: "result_card",
      serviceType: "car_rental",
    });

    window.open(`/out?${outParams.toString()}`, "_blank", "noopener,noreferrer");
  };

  const handleComparePartners = (partnerId: string) => {
    const partner = getPartners().find((p) => p.id === partnerId);
    if (!partner) return;
    window.open(partner.trackingUrl, "_blank", "noopener,noreferrer");
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEE, MMM d");
    } catch {
      return dateStr;
    }
  };

  const airport = getAirportByCode(pickupCode);
  const locationName = airport?.city || pickupCode;

  const activeFilterCount = filters.categories.length + filters.transmission.length + (filters.maxPrice < 500 ? 1 : 0);

  const pageTitle = locationName
    ? `Car Rentals in ${locationName} | From $${carCards[0]?.pricePerDay || 25}/day | ZIVO`
    : "Car Rental Search Results | ZIVO";

  const pageDescription = locationName
    ? `Compare ${results.length}+ car rental options in ${locationName}. ${pickupDate && dropoffDate ? `${days} days, ${formatDisplayDate(pickupDate)} - ${formatDisplayDate(dropoffDate)}.` : ""} Book securely on partner sites.`
    : "Search and compare car rental prices across booking sites.";

  // Filters UI
  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Max Price: ${filters.maxPrice}/day</h3>
        <Slider
          value={[filters.maxPrice]}
          onValueChange={(v) => setFilters((f) => ({ ...f, maxPrice: v[0] }))}
          min={20}
          max={500}
          step={10}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$20</span>
          <span>$500</span>
        </div>
      </div>

      {/* Car Categories */}
      <div>
        <h3 className="font-semibold mb-3">Car Category</h3>
        <div className="space-y-2">
          {["Economy", "Compact", "Midsize", "SUV", "Luxury"].map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={filters.categories.includes(cat)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters((f) => ({ ...f, categories: [...f.categories, cat] }));
                  } else {
                    setFilters((f) => ({ ...f, categories: f.categories.filter((c) => c !== cat) }));
                  }
                }}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <h3 className="font-semibold mb-3">Transmission</h3>
        <div className="space-y-2">
          {["Automatic", "Manual"].map((trans) => (
            <label key={trans} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={filters.transmission.includes(trans)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters((f) => ({ ...f, transmission: [...f.transmission, trans] }));
                  } else {
                    setFilters((f) => ({ ...f, transmission: f.transmission.filter((t) => t !== trans) }));
                  }
                }}
              />
              <span>{trans}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={pageTitle} description={pageDescription} />
      <Header />

      <main className="pt-16">
        {/* Breadcrumbs */}
        <ResultsBreadcrumbs service="cars" />

        {/* Sticky Search Summary */}
        <StickySearchSummary
          service="cars"
          backLink="/rent-car"
          title={
            <>
              Car Rentals in <span className="text-violet-500">{locationName}</span>
            </>
          }
          badges={[
            { label: `${formatDisplayDate(pickupDate)} – ${formatDisplayDate(dropoffDate)} (${days} day${days !== 1 ? "s" : ""})` },
          ]}
          searchForm={
            <CarEditSearchForm
              onSearch={() => {}}
              onCancel={() => {}}
            />
          }
        />

        {/* Partner CTAs */}
        <section className="border-b border-border/50 py-3 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2">
              {getPartners()
                .slice(0, 3)
                .map((partner) => (
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
              <ResultsContainer filters={<FiltersContent />}>
                {/* Results Header */}
                <ResultsHeader
                  count={carCards.length}
                  itemName="car"
                  isLoading={isLoading}
                  indicativePrice={!isRealPrice}
                  filterTrigger={
                    <FiltersTrigger onClick={() => setShowFilters(true)} activeCount={activeFilterCount} />
                  }
                  sortElement={<SortSelect value={sortBy} onValueChange={setSortBy} options={carSortOptions} />}
                />

                {/* Indicative Price Notice */}
                {!isRealPrice && !isLoading && carCards.length > 0 && (
                  <IndicativePriceAlert service="cars" className="mb-4" />
                )}

                {/* Loading State */}
                {isLoading && <ResultsSkeletonList count={5} variant="car" />}

                {/* Results */}
                {!isLoading && carCards.length > 0 && (
                  <div className="space-y-4">
                    {carCards.map((car) => (
                      <CarResultCard key={car.id} car={car} onViewDeal={handleViewDeal} />
                    ))}
                  </div>
                )}

                {/* No Results */}
                {!isLoading && carCards.length === 0 && isValid && (
                  <EmptyResults
                    service="cars"
                    partnerCta={{
                      label: "Search on EconomyBookings",
                      onClick: () => handleComparePartners("economybookings"),
                    }}
                  />
                )}

                {/* Redirect Notice */}
                {carCards.length > 0 && !isLoading && <RedirectNotice service="cars" className="mt-6" />}
              </ResultsContainer>
            </div>
          </section>
        )}

        {/* Driver Cross-Sell */}
        <section className="container mx-auto px-4 mt-8 max-w-4xl">
          <DriverCrossSell source="cars" variant="full" />
        </section>

        {/* FAQ Section */}
        <ResultsFAQ service="cars" />

        {/* Affiliate Disclaimer */}
        <AffiliateDisclaimer />
      </main>

      {/* Mobile Filters Sheet */}
      <FiltersSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        onApply={() => {}}
        onReset={() => setFilters(defaultFilters)}
        hasActiveFilters={activeFilterCount > 0}
        service="cars"
      >
        <FiltersContent />
      </FiltersSheet>

      <Footer />
    </div>
  );
}
