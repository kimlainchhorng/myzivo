/**
 * Unified Results Components
 * Shared layout system for Flights, Hotels, and Car Rental results
 */

// Layout components
export { StickySearchSummary } from "./StickySearchSummary";
export { FiltersSheet, FiltersTrigger } from "./FiltersSheet";
export { SortSelect, flightSortOptions, hotelSortOptions, carSortOptions } from "./SortSelect";
export { ActiveFiltersChips, type FilterChip } from "./ActiveFiltersChips";
export { ResultsContainer, ResultsHeader } from "./ResultsContainer";
export { ResultCardSkeleton, ResultsSkeletonList } from "./ResultCardSkeleton";
export { EmptyResults } from "./EmptyResults";
export { RedirectNotice, IndicativePriceAlert, AffiliateDisclaimer } from "./AffiliateNotice";

// Result cards
export { FlightResultCard, type FlightCardData } from "./FlightResultCard";
export { HotelResultCard, type HotelCardData } from "./HotelResultCard";
export { CarResultCard, type CarCardData } from "./CarResultCard";
