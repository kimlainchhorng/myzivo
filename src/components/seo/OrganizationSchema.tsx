import { useEffect } from "react";

/**
 * Injects Organization structured data for SEO
 */
export default function OrganizationSchema() {
  useEffect(() => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ZIVO",
      "alternateName": "ZIVO Travel",
      "url": "https://myzivo.lovable.app",
      "logo": "https://myzivo.lovable.app/logo.png",
      "description": "ZIVO is a travel search and comparison platform helping users find the best deals on flights, hotels, and car rentals from 500+ partners.",
      "foundingDate": "2024",
      "sameAs": [
        "https://twitter.com/zivotravel",
        "https://facebook.com/zivotravel",
        "https://instagram.com/zivotravel"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["English"]
      },
      "areaServed": {
        "@type": "Place",
        "name": "Worldwide"
      }
    };

    // Find or create script element
    let scriptTag = document.querySelector('script[data-schema="organization"]');
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.setAttribute("type", "application/ld+json");
      scriptTag.setAttribute("data-schema", "organization");
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(organizationSchema);

    return () => {
      scriptTag?.remove();
    };
  }, []);

  return null;
}
