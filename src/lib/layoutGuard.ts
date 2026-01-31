/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                       ZIVO LAYOUT GUARD SYSTEM                             ║
 * ║═══════════════════════════════════════════════════════════════════════════║
 * ║  Enforces page structure rules to prevent accidental layout violations.    ║
 * ║  Travel pages MUST follow: Search → Results → Book → Extras                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * LOCKED PAGE STRUCTURE for travel services:
 * 
 * 1. HERO SECTION (Search Only)
 *    - Service badge + title
 *    - Search form
 *    - Trust badges
 *    - Affiliate disclaimer
 *    ⚠️ NO: Promos, rewards, deals, extras
 * 
 * 2. SEARCH RESULTS (After search)
 *    - Result cards with "View Deal" CTAs
 *    - Partner selector sidebar
 *    - Compare prices options
 * 
 * 3. CROSS-SELL / EXTRAS (Bottom of page)
 *    - Add hotel, car, activities
 *    - Only appears AFTER or BELOW results
 * 
 * 4. FOOTER
 *    - Affiliate disclosure (always visible)
 *    - Legal links
 */

export type PageSection = 
  | 'hero'
  | 'search_form'
  | 'results'
  | 'partner_selector'
  | 'cross_sell'
  | 'extras'
  | 'faq'
  | 'footer';

export type PageType = 'flights' | 'hotels' | 'cars' | 'activities' | 'other';

interface LayoutRule {
  allowedIn: PageSection[];
  forbiddenIn: PageSection[];
  required: boolean;
}

// What content is allowed in each section
const LAYOUT_RULES: Record<string, LayoutRule> = {
  // Search form should ONLY be in hero section
  search_form: {
    allowedIn: ['hero'],
    forbiddenIn: ['results', 'cross_sell', 'footer'],
    required: true,
  },
  
  // Promos/rewards are FORBIDDEN in hero
  promo_content: {
    allowedIn: ['cross_sell', 'extras'],
    forbiddenIn: ['hero', 'search_form'],
    required: false,
  },
  
  // Price guarantees are FORBIDDEN everywhere
  price_guarantee: {
    allowedIn: [],
    forbiddenIn: ['hero', 'search_form', 'results', 'cross_sell', 'extras', 'footer'],
    required: false,
  },
  
  // Affiliate disclosure is REQUIRED
  affiliate_disclosure: {
    allowedIn: ['search_form', 'results', 'footer'],
    forbiddenIn: [],
    required: true,
  },
  
  // Trust badges are allowed in hero only
  trust_badges: {
    allowedIn: ['hero'],
    forbiddenIn: ['results', 'cross_sell'],
    required: false,
  },
  
  // Cross-sell must come AFTER results or at bottom
  cross_sell_content: {
    allowedIn: ['cross_sell', 'extras'],
    forbiddenIn: ['hero', 'search_form'],
    required: false,
  },
};

/**
 * Validate if content type is allowed in a section
 */
export function isContentAllowed(
  contentType: keyof typeof LAYOUT_RULES,
  section: PageSection
): boolean {
  const rule = LAYOUT_RULES[contentType];
  if (!rule) return true;

  // Check forbidden list first
  if (rule.forbiddenIn.includes(section)) {
    console.warn(
      `[Layout Guard] "${contentType}" is FORBIDDEN in "${section}" section`
    );
    return false;
  }

  // If allowedIn is empty, allow everywhere (except forbidden)
  if (rule.allowedIn.length === 0) return true;

  // Otherwise, check if section is in allowed list
  const isAllowed = rule.allowedIn.includes(section);
  if (!isAllowed) {
    console.warn(
      `[Layout Guard] "${contentType}" should be in ${rule.allowedIn.join(' or ')}, not "${section}"`
    );
  }
  return isAllowed;
}

/**
 * Get layout documentation for developers
 */
export function getLayoutDocumentation(): string {
  return `
╔═══════════════════════════════════════════════════════════════════════════╗
║                    ZIVO TRAVEL PAGE LAYOUT RULES                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  HERO SECTION (Top of page)                                               ║
║  ├── Service badge (ZIVO Flights / Hotels / Cars)                         ║
║  ├── Page title ("Compare prices from 500+ airlines")                     ║
║  ├── Search form card                                                     ║
║  ├── Trust badges (Secure, Partners, Support, Real-Time)                  ║
║  └── Affiliate disclaimer                                                 ║
║  ❌ NO: Deals, promos, rewards, extras, cross-sell                        ║
║                                                                           ║
║  RESULTS SECTION (After search)                                           ║
║  ├── Results count + filter bar                                           ║
║  ├── Result cards with "View Deal" buttons                                ║
║  ├── Partner selector sidebar                                             ║
║  └── Price disclaimer (prices may vary)                                   ║
║                                                                           ║
║  CROSS-SELL SECTION (Bottom, optional)                                    ║
║  ├── "Complete Your Trip" section                                         ║
║  ├── Add hotel / car / activities cards                                   ║
║  └── Only appears BELOW results                                           ║
║                                                                           ║
║  FOOTER                                                                   ║
║  ├── Affiliate disclosure (always visible)                                ║
║  ├── Legal links (Privacy, Terms, Disclosure)                             ║
║  └── Company info                                                         ║
║                                                                           ║
║  FORBIDDEN EVERYWHERE:                                                    ║
║  ❌ "Best price guarantee"                                                ║
║  ❌ "Lowest price"                                                        ║
║  ❌ Payment forms / checkout UI                                           ║
║  ❌ Internal booking confirmation                                         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`;
}

/**
 * Development helper: Log layout rules to console
 */
export function printLayoutRules(): void {
  if (import.meta.env.DEV) {
    console.log(getLayoutDocumentation());
  }
}
