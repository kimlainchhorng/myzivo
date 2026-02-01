import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://hizivo.com';

interface SEOHeadProps {
  title: string;
  description: string;
  /** Override canonical URL (relative path like "/flights" or full URL) */
  canonical?: string;
  type?: 'website' | 'article';
  /** Prevent search engines from indexing this page */
  noIndex?: boolean;
  /** OG image path (relative to site root) */
  ogImage?: string;
}

/**
 * SEO component that updates document head metadata
 * - Automatically generates canonical URL from current path
 * - Uses https://hizivo.com as the canonical domain
 * - Supports noIndex for private/admin pages
 */
export default function SEOHead({ 
  title, 
  description, 
  canonical,
  type = 'website',
  noIndex = false,
  ogImage = '/og-image.png'
}: SEOHeadProps) {
  const location = useLocation();
  
  useEffect(() => {
    // Generate canonical URL
    let canonicalUrl: string;
    if (canonical) {
      // If canonical starts with http, use as-is; otherwise prepend SITE_URL
      canonicalUrl = canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`;
    } else {
      // Auto-generate from current path (without query params)
      canonicalUrl = `${SITE_URL}${location.pathname}`;
    }
    
    // Handle noIndex
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta) {
      robotsMeta.remove();
    }
    
    // Update document title
    document.title = title;
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    // Update Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:type', type);
    updateMetaTag('og:url', canonicalUrl);
    updateMetaTag('og:image', ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`);
    updateMetaTag('og:site_name', 'ZIVO');
    
    // Update Twitter tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`);
    updateMetaTag('twitter:card', 'summary_large_image');
    
    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
    
    // Cleanup on unmount - restore defaults
    return () => {
      document.title = 'ZIVO - Compare Flights, Hotels & Car Rentals';
      const defaultDesc = 'Compare flights, hotels, and car rentals from 500+ trusted travel partners. No booking fees on ZIVO.';
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', defaultDesc);
      
      // Reset canonical to homepage
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute('href', SITE_URL + '/');
    };
  }, [title, description, canonical, type, noIndex, ogImage, location.pathname]);
  
  return null;
}

function updateMetaTag(property: string, content: string) {
  const selector = property.startsWith('og:') 
    ? `meta[property="${property}"]` 
    : `meta[name="${property}"]`;
  
  let meta = document.querySelector(selector);
  if (!meta) {
    meta = document.createElement('meta');
    if (property.startsWith('og:')) {
      meta.setAttribute('property', property);
    } else {
      meta.setAttribute('name', property);
    }
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}
