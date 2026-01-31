import { useEffect } from "react";

/**
 * OG IMAGE META - Social Share Preview Component
 * Configures Open Graph meta tags for social sharing
 * Each page type has optimized preview images
 */

export type OGPageType = "homepage" | "flights" | "hotels" | "cars";

interface OGImageMetaProps {
  pageType: OGPageType;
  customTitle?: string;
  customDescription?: string;
}

const ogContent: Record<OGPageType, {
  title: string;
  description: string;
  image: string;
}> = {
  homepage: {
    title: "ZIVO – Search & Compare Travel Worldwide",
    description: "Compare flights, hotels, and car rentals from trusted partners. No booking fees on ZIVO.",
    image: "/og-homepage.jpg",
  },
  flights: {
    title: "Compare Flights Worldwide | ZIVO",
    description: "Search & compare prices from 500+ airlines. Find the best flight deals before you book.",
    image: "/og-flights.jpg",
  },
  hotels: {
    title: "Find Hotels Anywhere | ZIVO",
    description: "Compare real-time hotel prices from trusted partners. Book your perfect stay.",
    image: "/og-hotels.jpg",
  },
  cars: {
    title: "Compare Car Rentals Worldwide | ZIVO",
    description: "Rent smarter — compare prices from top rental companies. Find your perfect ride.",
    image: "/og-cars.jpg",
  },
};

export default function OGImageMeta({ pageType, customTitle, customDescription }: OGImageMetaProps) {
  const content = ogContent[pageType];
  const title = customTitle || content.title;
  const description = customDescription || content.description;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update or create meta tag
    const updateMeta = (property: string, content: string, isProperty = true) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Primary Meta Tags
    updateMeta("description", description, false);
    
    // Open Graph / Facebook
    updateMeta("og:type", "website");
    updateMeta("og:title", title);
    updateMeta("og:description", description);
    updateMeta("og:image", content.image);
    updateMeta("og:site_name", "ZIVO");

    // Twitter
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", content.image);

  }, [title, description, content.image]);

  return null;
}
