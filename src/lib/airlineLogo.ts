/**
 * Airline Logo Service with Fallback Chain
 * Primary: AirHex CDN
 * Fallback 1: Lowercase IATA
 * Fallback 2: Duffel SVG
 * Fallback 3: Plane icon (via React component)
 */

// AirHex CDN - Primary source (high quality PNGs)
export const AIRHEX_CDN = 'https://content.airhex.com/content/logos/airlines';

// Duffel SVG CDN - Fallback 2
export const DUFFEL_CDN = 'https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup';

// Legacy AVS CDN (deprecated, kept for compatibility)
export const AVS_CDN = 'https://pics.avs.io';

// Supported sizes for AirHex
export type AirHexSize = 32 | 64 | 100 | 200;

/**
 * Get AirHex logo URL with specific size
 */
export function getAirHexLogoUrl(iataCode: string, size: AirHexSize = 64): string {
  return `${AIRHEX_CDN}_${size}/${iataCode.toUpperCase()}.png`;
}

/**
 * Get AirHex logo URL with lowercase code (fallback 1)
 */
export function getAirHexLogoUrlLowercase(iataCode: string, size: AirHexSize = 64): string {
  return `${AIRHEX_CDN}_${size}/${iataCode.toLowerCase()}.png`;
}

/**
 * Get Duffel SVG logo URL (fallback 2)
 */
export function getDuffelLogoUrl(iataCode: string): string {
  return `${DUFFEL_CDN}/${iataCode.toUpperCase()}.svg`;
}

/**
 * Get UI Avatars fallback (fallback 3 - before icon)
 */
export function getPlaceholderLogoUrl(iataCode: string): string {
  return `https://ui-avatars.com/api/?name=${iataCode.toUpperCase()}&background=0ea5e9&color=fff&size=64&bold=true`;
}

/**
 * Build ordered fallback chain for airline logo
 */
export function getLogoFallbackChain(iataCode: string, size: AirHexSize = 64): string[] {
  const code = iataCode.toUpperCase();
  return [
    getAirHexLogoUrl(code, size),           // Primary: AirHex uppercase
    getAirHexLogoUrlLowercase(code, size),  // Fallback 1: AirHex lowercase
    getDuffelLogoUrl(code),                  // Fallback 2: Duffel SVG
    getPlaceholderLogoUrl(code),             // Fallback 3: UI Avatars
  ];
}

/**
 * Get primary airline logo URL
 * Use AirlineLogo component for fallback handling
 */
export function getAirlineLogoUrl(iataCode: string, size: AirHexSize = 64): string {
  return getAirHexLogoUrl(iataCode, size);
}

// Memoization cache for preloaded logos
const preloadCache = new Map<string, boolean>();

/**
 * Preload airline logo to cache
 */
export async function preloadAirlineLogo(iataCode: string, size: AirHexSize = 64): Promise<boolean> {
  const cacheKey = `${iataCode}-${size}`;
  
  if (preloadCache.has(cacheKey)) {
    return preloadCache.get(cacheKey)!;
  }
  
  const url = getAirHexLogoUrl(iataCode, size);
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const success = response.ok;
    preloadCache.set(cacheKey, success);
    return success;
  } catch {
    preloadCache.set(cacheKey, false);
    return false;
  }
}

/**
 * Clear preload cache (for testing)
 */
export function clearLogoCache(): void {
  preloadCache.clear();
}
