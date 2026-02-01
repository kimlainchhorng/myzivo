/**
 * CENTRALIZED PHOTO CONFIGURATION
 * All photo assets for ZIVO platform
 * Consistent styling: high-quality travel photography with cool/neutral tones
 */

// Import local hero assets
import heroFlights from "@/assets/hero-flights.jpg";
import heroHotels from "@/assets/hero-hotels.jpg";
import heroCars from "@/assets/hero-cars.jpg";
import heroRides from "@/assets/hero-rides.jpg";
import heroEats from "@/assets/hero-eats.jpg";
import heroHomepage from "@/assets/hero-homepage.jpg";
import heroExtras from "@/assets/hero-extras.jpg";

// ============================================
// SERVICE TYPES
// ============================================
export type ServiceType = "flights" | "hotels" | "cars" | "rides" | "eats" | "extras";
export type CarCategory = "economy" | "compact" | "midsize" | "suv" | "luxury" | "van";
export type DestinationCity = "new-york" | "london" | "paris" | "tokyo" | "dubai" | "los-angeles" | "miami" | "las-vegas";

// ============================================
// HERO PHOTOS
// ============================================
export const heroPhotos: Record<ServiceType, { src: string; alt: string }> = {
  flights: {
    src: heroFlights,
    alt: "ZIVO Flights - Airplane wing view with sunrise above clouds",
  },
  hotels: {
    src: heroHotels,
    alt: "ZIVO Hotels - Luxury hotel lobby with modern design",
  },
  cars: {
    src: heroCars,
    alt: "ZIVO Car Rental - Modern car at airport pickup location",
  },
  rides: {
    src: heroRides,
    alt: "ZIVO Rides - City street with ride pickup at sunset",
  },
  eats: {
    src: heroEats,
    alt: "ZIVO Eats - Delicious meal spread with fresh ingredients",
  },
  extras: {
    src: heroExtras,
    alt: "ZIVO Travel Extras - Travel accessories and essentials for your trip",
  },
};

// ============================================
// SERVICE CARD PHOTOS (4:3 aspect ratio)
// ============================================
export const serviceCardPhotos: Record<ServiceType, { src: string; alt: string }> = {
  flights: {
    src: heroFlights,
    alt: "ZIVO Flights - Compare prices from 500+ airlines worldwide",
  },
  hotels: {
    src: heroHotels,
    alt: "ZIVO Hotels - Best rates on hotels, resorts and vacation stays",
  },
  cars: {
    src: heroCars,
    alt: "ZIVO Car Rental - Compare rental prices from trusted partners",
  },
  rides: {
    src: heroRides,
    alt: "ZIVO Rides - Request a ride in your local area",
  },
  eats: {
    src: heroEats,
    alt: "ZIVO Eats - Order food from local restaurants",
  },
  extras: {
    src: heroHomepage,
    alt: "ZIVO Extras - Transfers, insurance and travel extras",
  },
};

// ============================================
// CAR CATEGORY PHOTOS (Unsplash URLs - 4:3)
// ============================================
export const carCategoryPhotos: Record<CarCategory, { src: string; alt: string; label: string; passengers: number; bags: number }> = {
  economy: {
    src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop&q=80",
    alt: "Economy rental car - Compact hatchback for city driving",
    label: "Economy",
    passengers: 4,
    bags: 2,
  },
  compact: {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop&q=80",
    alt: "Compact rental car - Small sedan for everyday travel",
    label: "Compact",
    passengers: 5,
    bags: 2,
  },
  midsize: {
    src: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop&q=80",
    alt: "Midsize rental car - Standard sedan for comfortable travel",
    label: "Midsize",
    passengers: 5,
    bags: 3,
  },
  suv: {
    src: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=400&fit=crop&q=80",
    alt: "SUV rental - Crossover vehicle for family adventures",
    label: "SUV",
    passengers: 7,
    bags: 4,
  },
  luxury: {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop&q=80",
    alt: "Luxury rental car - Premium sedan for executive travel",
    label: "Luxury",
    passengers: 5,
    bags: 3,
  },
  van: {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&q=80",
    alt: "Van rental - Minivan for group travel",
    label: "Van",
    passengers: 8,
    bags: 5,
  },
};

// ============================================
// DESTINATION PHOTOS (Unsplash URLs - 4:3)
// ============================================
export const destinationPhotos: Record<DestinationCity, { src: string; alt: string; city: string; country: string }> = {
  "new-york": {
    src: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop&q=80",
    alt: "New York, USA - Manhattan skyline at dusk",
    city: "New York",
    country: "USA",
  },
  london: {
    src: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&q=80",
    alt: "London, United Kingdom - Tower Bridge at sunset",
    city: "London",
    country: "United Kingdom",
  },
  paris: {
    src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop&q=80",
    alt: "Paris, France - Eiffel Tower with city view",
    city: "Paris",
    country: "France",
  },
  tokyo: {
    src: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop&q=80",
    alt: "Tokyo, Japan - Shibuya crossing with neon lights",
    city: "Tokyo",
    country: "Japan",
  },
  dubai: {
    src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop&q=80",
    alt: "Dubai, UAE - Burj Khalifa and modern skyline",
    city: "Dubai",
    country: "UAE",
  },
  "los-angeles": {
    src: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=400&h=300&fit=crop&q=80",
    alt: "Los Angeles, USA - Hollywood sign and palm trees",
    city: "Los Angeles",
    country: "USA",
  },
  miami: {
    src: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=400&h=300&fit=crop&q=80",
    alt: "Miami, Florida - South Beach with ocean view",
    city: "Miami",
    country: "Florida",
  },
  "las-vegas": {
    src: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400&h=300&fit=crop&q=80",
    alt: "Las Vegas, Nevada - Strip lights at night",
    city: "Las Vegas",
    country: "Nevada",
  },
};

// ============================================
// OVERLAY GRADIENTS (by service)
// ============================================
export const serviceOverlays: Record<ServiceType, string> = {
  flights: "from-slate-950/90 via-blue-950/80 to-slate-950/70",
  hotels: "from-slate-950/90 via-amber-950/70 to-slate-950/60",
  cars: "from-slate-950/90 via-violet-950/70 to-slate-950/60",
  rides: "from-slate-950/90 via-emerald-950/70 to-slate-950/60",
  eats: "from-slate-950/90 via-orange-950/70 to-slate-950/60",
  extras: "from-slate-950/90 via-pink-950/70 to-slate-950/60",
};

// ============================================
// ASPECT RATIO CONSTANTS
// ============================================
export const aspectRatios = {
  hero: "16:9",
  serviceCard: "4:3",
  destinationTile: "4:3",
  carCategory: "4:3",
  restaurantThumb: "1:1",
} as const;

// ============================================
// IMAGE SIZE CONSTRAINTS
// ============================================
export const imageSizes = {
  hero: { maxWidth: 1920, maxHeight: 1080, maxFileSize: 200 }, // KB
  serviceCard: { maxWidth: 400, maxHeight: 300, maxFileSize: 50 },
  tile: { maxWidth: 400, maxHeight: 300, maxFileSize: 50 },
  thumbnail: { maxWidth: 200, maxHeight: 200, maxFileSize: 25 },
} as const;
