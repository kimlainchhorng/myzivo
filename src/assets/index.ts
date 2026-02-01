/**
 * ZIVO Image Assets - Centralized export for all images
 * Organized by category for consistent usage across the platform
 */

// ==========================================
// HERO BACKGROUNDS (Full-width page headers)
// ==========================================
export { default as heroHomepage } from "./hero-homepage.jpg";
export { default as heroFlights } from "./hero-flights.jpg";
export { default as heroHotels } from "./hero-hotels.jpg";
export { default as heroCars } from "./hero-cars.jpg";
export { default as heroRides } from "./hero-rides.jpg";
export { default as heroEats } from "./hero-eats.jpg";

// ==========================================
// AD CAMPAIGN IMAGES
// ==========================================
export { default as adFlights1 } from "./ad-flights-1.jpg";
export { default as adHotels1 } from "./ad-hotels-1.jpg";
export { default as adCars1 } from "./ad-cars-1.jpg";

// ==========================================
// FLIGHT-SPECIFIC IMAGES
// ==========================================
export { default as flightHero } from "./flight-hero.jpg";
export { default as flightHeroPremium } from "./flight-hero-premium.jpg";
export { default as flightBusinessClass } from "./flight-business-class.jpg";
export { default as flightFirstClass } from "./flight-first-class.jpg";
export { default as flightDestinations } from "./flight-destinations.jpg";
export { default as flightTicket } from "./flight-ticket.jpg";
export { default as airplaneClouds } from "./airplane-clouds.jpg";

// ==========================================
// HOTEL-SPECIFIC IMAGES
// ==========================================
export { default as hotelLuxuryPool } from "./hotel-luxury-pool.jpg";
export { default as hotelBeachResort } from "./hotel-beach-resort.jpg";
export { default as hotelMountainLodge } from "./hotel-mountain-lodge.jpg";
export { default as hotelBoutique } from "./hotel-boutique.jpg";
export { default as hotelRoomLuxury } from "./hotel-room-luxury.jpg";
export { default as hotelSpa } from "./hotel-spa.jpg";

// ==========================================
// OG/SOCIAL IMAGES
// ==========================================
export { default as ogHomepage } from "./og-homepage.jpg";

// ==========================================
// BRANDING
// ==========================================
export { default as zivoLogo } from "./zivo-logo.png";

// ==========================================
// SERVICE CARD THUMBNAILS (for homepage grid)
// Uses existing hero images as card backgrounds
// ==========================================
export const serviceCardImages = {
  flights: () => import("./hero-flights.jpg"),
  hotels: () => import("./hero-hotels.jpg"),
  cars: () => import("./hero-cars.jpg"),
  rides: () => import("./hero-rides.jpg"),
  eats: () => import("./hero-eats.jpg"),
  extras: () => import("./hero-homepage.jpg"), // fallback
} as const;
