/**
 * Sponsored Listings & Ads Components
 * FTC-compliant sponsored content for revenue monetization
 */

// Core Sponsored Components
export { default as SponsoredResultCard } from "./SponsoredResultCard";
export { default as SponsoredBanner } from "./SponsoredBanner";
export { default as SponsoredHotelCard } from "./SponsoredHotelCard";
export { default as SponsoredSidebar } from "./SponsoredSidebar";

// Destination Sponsorship
export { default as DestinationSponsor } from "./DestinationSponsor";

// Compliance & Disclosure
export {
  default as SponsoredDisclosure,
  SponsoredIndicator,
  PageSponsoredNotice,
} from "./SponsoredDisclosure";

// Re-export shared badge
export { default as SponsoredBadge } from "@/components/shared/SponsoredBadge";
