import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  type?: 'website' | 'article';
  /** Prevent search engines from indexing this page */
  noIndex?: boolean;
}

/**
 * SEO component that updates document head metadata
 * Used for page-specific SEO without react-helmet dependency
 */
export default function SEOHead({ 
  title, 
  description, 
  canonical,
  type = 'website',
  noIndex = false 
}: SEOHeadProps) {
  useEffect(() => {
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
    
    // Update Twitter tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    
    // Update canonical if provided
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }
    
    // Cleanup on unmount - restore defaults
    return () => {
      document.title = 'ZIVO - Your Ride, Your Way';
      const defaultDesc = 'Book rides, order food, rent cars, flights & hotels - all in one app. Fast, safe, and reliable.';
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', defaultDesc);
    };
  }, [title, description, canonical, type, noIndex]);
  
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
