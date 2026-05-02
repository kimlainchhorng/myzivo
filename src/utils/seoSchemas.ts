/**
 * Schema.org JSON-LD builders for ZIVO content types.
 *
 * Each helper returns a plain object you can pass into `<SEOHead structuredData={...}>`.
 * SEOHead will inject it under <script type="application/ld+json"> and merge with
 * the auto-generated BreadcrumbList for the current route.
 *
 * Why these exist: Google rich results (price boxes, star ratings, hiring panels,
 * recipe cards, business hours, etc.) require strict schema.org markup. Hand-rolling
 * it per page is error-prone — these helpers enforce the right shape.
 *
 * Usage:
 *   <SEOHead
 *     title="Junior driver wanted"
 *     description="..."
 *     structuredData={jobPostingSchema({ title: 'Junior driver', ... })}
 *   />
 */

const SITE_URL = 'https://hizivo.com';
const ORG_REF = { '@type': 'Organization', name: 'ZIVO', url: SITE_URL } as const;

type Money = { amount: number | string; currency?: string };
type Address = {
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string; // ISO 3166-1 alpha-2 e.g. "US"
};
type GeoPoint = { lat: number; lng: number };
type AggregateRating = { value: number; count: number };

function abs(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function postalAddress(a?: Address) {
  if (!a) return undefined;
  return {
    '@type': 'PostalAddress',
    streetAddress: a.street,
    addressLocality: a.city,
    addressRegion: a.region,
    postalCode: a.postalCode,
    addressCountry: a.country,
  };
}

// =============================================================================
// JobPosting — for /jobs hub and individual /jobs/:id pages.
// Surfaces ZIVO listings inside Google for Jobs (the dedicated hiring panel).
// =============================================================================
export interface JobPostingArgs {
  title: string;
  description: string; // can be HTML
  datePosted: string; // ISO date
  validThrough?: string; // ISO date
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY' | 'INTERN' | 'VOLUNTEER' | 'PER_DIEM' | 'OTHER';
  hiringOrganization?: { name: string; url?: string; logo?: string };
  jobLocation?: Address;
  remote?: boolean;
  baseSalary?: { min: number; max?: number; currency: string; unit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' };
  identifier?: string;
  url: string;
}
export function jobPostingSchema(a: JobPostingArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: a.title,
    description: a.description,
    datePosted: a.datePosted,
    validThrough: a.validThrough,
    employmentType: a.employmentType,
    hiringOrganization: a.hiringOrganization
      ? { '@type': 'Organization', name: a.hiringOrganization.name, sameAs: a.hiringOrganization.url, logo: abs(a.hiringOrganization.logo) }
      : ORG_REF,
    jobLocation: a.jobLocation ? { '@type': 'Place', address: postalAddress(a.jobLocation) } : undefined,
    jobLocationType: a.remote ? 'TELECOMMUTE' : undefined,
    applicantLocationRequirements: a.remote && a.jobLocation?.country
      ? { '@type': 'Country', name: a.jobLocation.country }
      : undefined,
    baseSalary: a.baseSalary
      ? {
          '@type': 'MonetaryAmount',
          currency: a.baseSalary.currency,
          value: { '@type': 'QuantitativeValue', minValue: a.baseSalary.min, maxValue: a.baseSalary.max, unitText: a.baseSalary.unit },
        }
      : undefined,
    identifier: a.identifier ? { '@type': 'PropertyValue', name: 'ZIVO Job ID', value: a.identifier } : undefined,
    url: abs(a.url),
  };
}

// =============================================================================
// Product / Offer — for /shop products and /marketplace items.
// Unlocks price + availability + rating in Google Shopping & SERP.
// =============================================================================
export interface ProductArgs {
  name: string;
  description: string;
  image: string | string[];
  sku?: string;
  brand?: string;
  url: string;
  price: Money;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder';
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
  rating?: AggregateRating;
}
export function productSchema(a: ProductArgs) {
  const images = Array.isArray(a.image) ? a.image.map(abs) : [abs(a.image)];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: a.name,
    description: a.description,
    image: images,
    sku: a.sku,
    brand: a.brand ? { '@type': 'Brand', name: a.brand } : undefined,
    offers: {
      '@type': 'Offer',
      url: abs(a.url),
      priceCurrency: a.price.currency || 'USD',
      price: a.price.amount,
      availability: `https://schema.org/${a.availability || 'InStock'}`,
      itemCondition: `https://schema.org/${a.condition || 'NewCondition'}`,
      seller: ORG_REF,
    },
    aggregateRating: a.rating
      ? { '@type': 'AggregateRating', ratingValue: a.rating.value, reviewCount: a.rating.count }
      : undefined,
  };
}

// =============================================================================
// LodgingBusiness — for /hotels/:slug pages.
// Triggers the hotel rich card with price, rating, amenities.
// =============================================================================
export interface LodgingArgs {
  name: string;
  description: string;
  image: string | string[];
  url: string;
  address?: Address;
  geo?: GeoPoint;
  starRating?: number;
  priceRange?: string; // "$$$" style
  amenities?: string[];
  rating?: AggregateRating;
  checkIn?: string; // "15:00"
  checkOut?: string; // "11:00"
}
export function lodgingSchema(a: LodgingArgs) {
  const images = Array.isArray(a.image) ? a.image.map(abs) : [abs(a.image)];
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: a.name,
    description: a.description,
    image: images,
    url: abs(a.url),
    address: postalAddress(a.address),
    geo: a.geo ? { '@type': 'GeoCoordinates', latitude: a.geo.lat, longitude: a.geo.lng } : undefined,
    starRating: a.starRating ? { '@type': 'Rating', ratingValue: a.starRating } : undefined,
    priceRange: a.priceRange,
    amenityFeature: a.amenities?.map((amenity) => ({ '@type': 'LocationFeatureSpecification', name: amenity })),
    aggregateRating: a.rating
      ? { '@type': 'AggregateRating', ratingValue: a.rating.value, reviewCount: a.rating.count }
      : undefined,
    checkinTime: a.checkIn,
    checkoutTime: a.checkOut,
  };
}

// =============================================================================
// Restaurant — for /eats/restaurant/:id pages.
// Shows up in Google's restaurant carousel with hours, cuisine, price tier.
// =============================================================================
export interface RestaurantArgs {
  name: string;
  description: string;
  image: string | string[];
  url: string;
  address?: Address;
  geo?: GeoPoint;
  cuisines?: string[];
  priceRange?: string;
  telephone?: string;
  rating?: AggregateRating;
  hours?: Array<{ days: string[]; opens: string; closes: string }>; // days = ['Monday', 'Tuesday', ...]
  acceptsReservations?: boolean;
  menuUrl?: string;
}
export function restaurantSchema(a: RestaurantArgs) {
  const images = Array.isArray(a.image) ? a.image.map(abs) : [abs(a.image)];
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: a.name,
    description: a.description,
    image: images,
    url: abs(a.url),
    address: postalAddress(a.address),
    geo: a.geo ? { '@type': 'GeoCoordinates', latitude: a.geo.lat, longitude: a.geo.lng } : undefined,
    servesCuisine: a.cuisines,
    priceRange: a.priceRange,
    telephone: a.telephone,
    aggregateRating: a.rating
      ? { '@type': 'AggregateRating', ratingValue: a.rating.value, reviewCount: a.rating.count }
      : undefined,
    openingHoursSpecification: a.hours?.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    acceptsReservations: a.acceptsReservations,
    menu: abs(a.menuUrl),
  };
}

// =============================================================================
// Article / BlogPosting — for /guides/* pages.
// Unlocks the Top Stories carousel and rich preview cards.
// =============================================================================
export interface ArticleArgs {
  headline: string;
  description: string;
  image: string;
  url: string;
  datePublished: string; // ISO
  dateModified?: string; // ISO
  authorName?: string;
  authorUrl?: string;
  body?: string; // optional full body for AI-search snippets
}
export function articleSchema(a: ArticleArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    image: abs(a.image),
    url: abs(a.url),
    datePublished: a.datePublished,
    dateModified: a.dateModified || a.datePublished,
    author: { '@type': a.authorName ? 'Person' : 'Organization', name: a.authorName || 'ZIVO', url: a.authorUrl },
    publisher: {
      '@type': 'Organization',
      name: 'ZIVO',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(a.url) },
    articleBody: a.body,
  };
}

// =============================================================================
// Event — for /events listings.
// Powers the events carousel in Google search.
// =============================================================================
export interface EventArgs {
  name: string;
  description: string;
  startDate: string; // ISO
  endDate?: string;
  url: string;
  image?: string;
  location?: { name?: string; address?: Address; online?: boolean };
  performer?: string;
  organizer?: string;
  price?: Money;
  status?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventRescheduled';
  attendanceMode?: 'OnlineEventAttendanceMode' | 'OfflineEventAttendanceMode' | 'MixedEventAttendanceMode';
}
export function eventSchema(a: EventArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: a.name,
    description: a.description,
    startDate: a.startDate,
    endDate: a.endDate,
    url: abs(a.url),
    image: abs(a.image),
    eventStatus: `https://schema.org/${a.status || 'EventScheduled'}`,
    eventAttendanceMode: `https://schema.org/${
      a.attendanceMode || (a.location?.online ? 'OnlineEventAttendanceMode' : 'OfflineEventAttendanceMode')
    }`,
    location: a.location?.online
      ? { '@type': 'VirtualLocation', url: abs(a.url) }
      : a.location
        ? { '@type': 'Place', name: a.location.name, address: postalAddress(a.location.address) }
        : undefined,
    performer: a.performer ? { '@type': 'PerformingGroup', name: a.performer } : undefined,
    organizer: a.organizer ? { '@type': 'Organization', name: a.organizer } : ORG_REF,
    offers: a.price
      ? {
          '@type': 'Offer',
          price: a.price.amount,
          priceCurrency: a.price.currency || 'USD',
          url: abs(a.url),
          availability: 'https://schema.org/InStock',
        }
      : undefined,
  };
}

// =============================================================================
// VideoObject — for /reels/:id pages.
// Required for video rich snippets and Google Video search inclusion.
// =============================================================================
export interface VideoArgs {
  name: string;
  description: string;
  thumbnailUrl: string;
  contentUrl?: string;
  embedUrl?: string;
  uploadDate: string;
  duration?: string; // ISO 8601 duration e.g. "PT15S"
  url: string;
}
export function videoSchema(a: VideoArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: a.name,
    description: a.description,
    thumbnailUrl: abs(a.thumbnailUrl),
    uploadDate: a.uploadDate,
    contentUrl: abs(a.contentUrl),
    embedUrl: abs(a.embedUrl),
    duration: a.duration,
    url: abs(a.url),
    publisher: ORG_REF,
  };
}

// =============================================================================
// LocalBusiness — for any future ZIVO physical location landing page.
// Cleared for use once a real registered address is provided.
// =============================================================================
export interface LocalBusinessArgs {
  name: string;
  description?: string;
  url: string;
  address: Address;
  geo?: GeoPoint;
  telephone?: string;
  priceRange?: string;
  hours?: Array<{ days: string[]; opens: string; closes: string }>;
}
export function localBusinessSchema(a: LocalBusinessArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: a.name,
    description: a.description,
    url: abs(a.url),
    address: postalAddress(a.address),
    geo: a.geo ? { '@type': 'GeoCoordinates', latitude: a.geo.lat, longitude: a.geo.lng } : undefined,
    telephone: a.telephone,
    priceRange: a.priceRange,
    openingHoursSpecification: a.hours?.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  };
}
