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
import heroBeachResort from "@/assets/hero-beach-resort.jpg";
import heroHotelRoom from "@/assets/hero-hotel-room.jpg";
import heroRoadTrip from "@/assets/hero-road-trip.jpg";

// Import service card assets
import serviceFlights from "@/assets/service-flights.jpg";
import serviceHotels from "@/assets/service-hotels.jpg";
import serviceCars from "@/assets/service-cars.jpg";
import serviceRides from "@/assets/service-rides.jpg";
import serviceEats from "@/assets/service-eats.jpg";
import serviceExtras from "@/assets/service-extras.jpg";

// Import destination assets (local AI-generated)
import destParis from "@/assets/dest-paris.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destNewYork from "@/assets/dest-newyork.jpg";
import destTokyo from "@/assets/dest-tokyo.jpg";
import destLondon from "@/assets/dest-london.jpg";
import destBali from "@/assets/dest-bali.jpg";
import destBarcelona from "@/assets/dest-barcelona.jpg";
import destRome from "@/assets/dest-rome.jpg";
import destSydney from "@/assets/dest-sydney.jpg";
import destSingapore from "@/assets/dest-singapore.jpg";
import destSantorini from "@/assets/dest-santorini.jpg";
import destMiami from "@/assets/dest-miami.jpg";
import destIstanbul from "@/assets/dest-istanbul.jpg";
import destAmsterdam from "@/assets/dest-amsterdam.jpg";

// Import lifestyle assets
import lifestyleTravelers from "@/assets/lifestyle-travelers.jpg";
import lifestyleFamily from "@/assets/lifestyle-family.jpg";
import lifestyleBusiness from "@/assets/lifestyle-business.jpg";
import lifestyleSolo from "@/assets/lifestyle-solo.jpg";

// Import extras category assets
import extrasActivities from "@/assets/extras-activities.jpg";
import extrasMuseums from "@/assets/extras-museums.jpg";
import extrasTransfers from "@/assets/extras-transfers.jpg";
import extrasEsim from "@/assets/extras-esim.jpg";
import extrasLuggage from "@/assets/extras-luggage.jpg";
import extrasAudiotours from "@/assets/extras-audiotours.jpg";
import extrasCompensation from "@/assets/extras-compensation.jpg";
import extrasRadar from "@/assets/extras-radar.jpg";
import extrasTickets from "@/assets/extras-tickets.jpg";

// ============================================
// SERVICE TYPES
// ============================================
export type ServiceType = "flights" | "hotels" | "cars" | "rides" | "eats" | "extras";
export type CarCategory = "economy" | "compact" | "midsize" | "suv" | "luxury" | "van" | "electric";
export type DestinationCity = "new-york" | "london" | "paris" | "tokyo" | "dubai" | "los-angeles" | "miami" | "las-vegas" | "chicago" | "dallas" | "atlanta" | "san-francisco" | "orlando" | "phoenix" | "san-diego" | "cancun" | "barcelona" | "singapore" | "sydney" | "amsterdam";

// ============================================
// HERO PHOTOS (16:9)
// ============================================
export const heroPhotos: Record<ServiceType | "homepage", { src: string; alt: string }> = {
  homepage: {
    src: heroHomepage,
    alt: "ZIVO - Modern airport terminal with travelers, premium travel marketplace",
  },
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
    src: serviceFlights,
    alt: "ZIVO Flights - Compare prices from 500+ airlines worldwide",
  },
  hotels: {
    src: serviceHotels,
    alt: "ZIVO Hotels - Best rates on hotels, resorts and vacation stays",
  },
  cars: {
    src: serviceCars,
    alt: "ZIVO Car Rental - Compare rental prices from trusted partners",
  },
  rides: {
    src: serviceRides,
    alt: "ZIVO Rides - Request a ride in your local area",
  },
  eats: {
    src: serviceEats,
    alt: "ZIVO Eats - Order food from local restaurants",
  },
  extras: {
    src: serviceExtras,
    alt: "ZIVO Extras - Transfers, insurance and travel extras",
  },
};

// ============================================
// CAR CATEGORY PHOTOS (Unsplash URLs - 4:3)
// All images use cool/neutral tones + WebP optimization
// ============================================
export const carCategoryPhotos: Record<CarCategory, { src: string; alt: string; label: string; passengers: number; bags: number; width: number; height: number }> = {
  economy: {
    src: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=450&fit=crop&q=75&fm=webp&auto=format",
    alt: "Economy rental car - Compact hatchback for city driving",
    label: "Economy",
    passengers: 4,
    bags: 2,
    width: 600,
    height: 450,
  },
  compact: {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=450&fit=crop&q=75&fm=webp&auto=format",
    alt: "Compact rental car - Small sedan for everyday travel",
    label: "Compact",
    passengers: 5,
    bags: 2,
    width: 600,
    height: 450,
  },
  midsize: {
    src: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=450&fit=crop&q=75&fm=webp&auto=format",
    alt: "Midsize rental car - Standard sedan for comfortable travel",
    label: "Midsize",
    passengers: 5,
    bags: 3,
    width: 600,
    height: 450,
  },
  suv: {
    src: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=450&fit=crop&q=75&fm=webp&auto=format",
    alt: "SUV rental - Crossover vehicle for family adventures",
    label: "SUV",
    passengers: 7,
    bags: 4,
    width: 600,
    height: 450,
  },
  luxury: {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=450&fit=crop&q=75&fm=webp&auto=format",
    alt: "Luxury rental car - Premium sedan for executive travel",
    label: "Luxury",
    passengers: 5,
    bags: 3,
    width: 600,
    height: 450,
  },
  van: {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop&q=75&fm=webp&auto=format",
    alt: "Van rental - Minivan for group travel",
    label: "Van",
    passengers: 8,
    bags: 5,
    width: 600,
    height: 450,
  },
  electric: {
    src: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=450&fit=crop&q=75&fm=webp&auto=format",
    alt: "Electric car rental - Modern EV at charging station",
    label: "Electric",
    passengers: 5,
    bags: 2,
    width: 600,
    height: 450,
  },
};

// ============================================
// DESTINATION PHOTOS (Local AI-generated - 1:1 square)
// Premium travel photography with consistent styling
// ============================================
export const destinationPhotos: Record<DestinationCity, { src: string; alt: string; city: string; country: string; width: number; height: number }> = {
  "new-york": {
    src: destNewYork,
    alt: "New York, USA - Manhattan skyline at dusk",
    city: "New York",
    country: "USA",
    width: 512,
    height: 512,
  },
  london: {
    src: destLondon,
    alt: "London, United Kingdom - Tower Bridge at sunset",
    city: "London",
    country: "United Kingdom",
    width: 512,
    height: 512,
  },
  paris: {
    src: destParis,
    alt: "Paris, France - Eiffel Tower with city view",
    city: "Paris",
    country: "France",
    width: 512,
    height: 512,
  },
  tokyo: {
    src: destTokyo,
    alt: "Tokyo, Japan - City skyline at night",
    city: "Tokyo",
    country: "Japan",
    width: 512,
    height: 512,
  },
  dubai: {
    src: destDubai,
    alt: "Dubai, UAE - Burj Khalifa and modern skyline",
    city: "Dubai",
    country: "UAE",
    width: 512,
    height: 512,
  },
  "los-angeles": {
    src: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=400&h=400&fit=crop&q=75&fm=webp&auto=format",
    alt: "Los Angeles, USA - Downtown skyline at golden hour",
    city: "Los Angeles",
    country: "USA",
    width: 400,
    height: 400,
  },
  miami: {
    src: destMiami,
    alt: "Miami, Florida - Beach skyline view",
    city: "Miami",
    country: "Florida",
    width: 512,
    height: 512,
  },
  "las-vegas": {
    src: "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=400&h=400&fit=crop&q=75&fm=webp&auto=format",
    alt: "Las Vegas, Nevada - Strip lights at night",
    city: "Las Vegas",
    country: "Nevada",
    width: 400,
    height: 400,
  },
  "chicago": {
    src: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=400&h=400&fit=crop&q=75&fm=webp&auto=format",
    alt: "Chicago, USA - Skyline with river and architecture",
    city: "Chicago",
    country: "USA",
    width: 400,
    height: 400,
  },
  "dallas": {
    src: "https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=400&h=400&fit=crop&q=75&fm=webp&auto=format",
    alt: "Dallas, Texas - Downtown skyline at night",
    city: "Dallas",
    country: "Texas",
    width: 400,
    height: 400,
  },
  "atlanta": {
    src: "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?w=400&h=400&fit=crop&q=75&fm=webp&auto=format",
    alt: "Atlanta, Georgia - Downtown skyline view",
    city: "Atlanta",
    country: "Georgia",
    width: 400,
    height: 400,
  },
  "san-francisco": {
    src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop&q=75&fm=webp&auto=format",
    alt: "San Francisco, USA - Golden Gate Bridge",
    city: "San Francisco",
    country: "USA",
    width: 400,
    height: 400,
  },
  "orlando": {
    src: "https://images.unsplash.com/photo-1575089776834-8be34c8a652e?w=400&h=400&fit=crop&q=75&fm=webp&auto=format",
    alt: "Orlando, Florida - Theme park area skyline",
    city: "Orlando",
    country: "Florida",
    width: 400,
    height: 400,
  },
  "phoenix": {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=75&fm=webp&auto=format",
    alt: "Phoenix, Arizona - Desert city skyline",
    city: "Phoenix",
    country: "Arizona",
    width: 400,
    height: 400,
  },
  "san-diego": {
    src: "https://images.unsplash.com/photo-1538964173425-93c8e0a2a8a8?w=400&h=400&fit=crop&q=75&fm=webp&auto=format",
    alt: "San Diego, California - Harbor and skyline",
    city: "San Diego",
    country: "California",
    width: 400,
    height: 400,
  },
  "cancun": {
    src: "https://images.unsplash.com/photo-1552074284-5e84a3e70b0a?w=400&h=400&fit=crop&q=75&fm=webp&auto=format",
    alt: "Cancún, Mexico - Caribbean beach resort",
    city: "Cancún",
    country: "Mexico",
    width: 400,
    height: 400,
  },
  "barcelona": {
    src: destBarcelona,
    alt: "Barcelona, Spain - City view with Sagrada Familia",
    city: "Barcelona",
    country: "Spain",
    width: 512,
    height: 512,
  },
  "singapore": {
    src: destSingapore,
    alt: "Singapore - Marina Bay Sands skyline",
    city: "Singapore",
    country: "Singapore",
    width: 512,
    height: 512,
  },
  "sydney": {
    src: destSydney,
    alt: "Sydney, Australia - Opera House harbor view",
    city: "Sydney",
    country: "Australia",
    width: 512,
    height: 512,
  },
  "amsterdam": {
    src: destAmsterdam,
    alt: "Amsterdam, Netherlands - Canal houses",
    city: "Amsterdam",
    country: "Netherlands",
    width: 512,
    height: 512,
  },
};

// ============================================
// LIFESTYLE PHOTOS (for marketing sections)
// ============================================
export const lifestylePhotos = {
  travelers: {
    src: lifestyleTravelers,
    alt: "Happy travelers exploring the world with ZIVO",
  },
  family: {
    src: lifestyleFamily,
    alt: "Family vacation - traveling together with ZIVO",
  },
  business: {
    src: lifestyleBusiness,
    alt: "Business travel made easy with ZIVO",
  },
  solo: {
    src: lifestyleSolo,
    alt: "Solo adventure - explore the world with ZIVO",
  },
};

// ============================================
// EXTRAS CATEGORY PHOTOS
// ============================================
export const extrasCategoryPhotos = {
  activities: { src: extrasActivities, alt: "Tours and activities" },
  museums: { src: extrasMuseums, alt: "Museums and attractions" },
  transfers: { src: extrasTransfers, alt: "Airport transfers" },
  esim: { src: extrasEsim, alt: "eSIM and mobile connectivity" },
  luggage: { src: extrasLuggage, alt: "Luggage storage services" },
  audiotours: { src: extrasAudiotours, alt: "Audio tours and guides" },
  compensation: { src: extrasCompensation, alt: "Flight compensation" },
  radar: { src: extrasRadar, alt: "Travel comparison and search" },
  tickets: { src: extrasTickets, alt: "Event tickets and shows" },
};

// ============================================
// ADDITIONAL HERO PHOTOS
// ============================================
export const additionalHeroPhotos = {
  beachResort: {
    src: heroBeachResort,
    alt: "Tropical beach resort getaway",
  },
  hotelRoom: {
    src: heroHotelRoom,
    alt: "Luxury hotel room interior",
  },
  roadTrip: {
    src: heroRoadTrip,
    alt: "Scenic road trip adventure",
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
  destinationTile: "1:1",
  carCategory: "4:3",
  restaurantThumb: "1:1",
} as const;

// ============================================
// IMAGE SIZE CONSTRAINTS
// ============================================
export const imageSizes = {
  hero: { maxWidth: 1920, maxHeight: 1080, maxFileSize: 250 }, // KB
  serviceCard: { maxWidth: 768, maxHeight: 576, maxFileSize: 100 },
  tile: { maxWidth: 400, maxHeight: 400, maxFileSize: 50 },
  thumbnail: { maxWidth: 300, maxHeight: 300, maxFileSize: 30 },
} as const;
