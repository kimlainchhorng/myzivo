/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    ZIVO AFFILIATE SAFETY MONITOR                           ║
 * ║═══════════════════════════════════════════════════════════════════════════║
 * ║  Monitors affiliate compliance and alerts on violations.                   ║
 * ║  Run in development to catch issues before production.                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export type SafetyViolationType = 
  | 'PAYMENT_UI_DETECTED'
  | 'CHECKOUT_FORM_DETECTED'
  | 'AFFILIATE_DISCLOSURE_MISSING'
  | 'DEAD_LINK_DETECTED'
  | 'GUARANTEE_CLAIM_DETECTED'
  | 'INTERNAL_BOOKING_DETECTED';

export interface SafetyViolation {
  id: string;
  type: SafetyViolationType;
  message: string;
  location: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  autoFixed?: boolean;
}

// Forbidden patterns that should never appear in ZIVO
const FORBIDDEN_PATTERNS = {
  payment: [
    'stripe',
    'paypal',
    'credit card form',
    'payment-form',
    'checkout-form',
    'card-element',
    'payment-element',
  ],
  checkout: [
    'proceed to checkout',
    'complete purchase',
    'place order',
    'confirm booking',
    'pay now',
    'enter payment',
  ],
  guarantees: [
    'best price guarantee',
    'lowest price',
    'price match',
    'we guarantee',
    'exclusive deal',
    'only on zivo',
  ],
};

// Required elements that must exist
const REQUIRED_ELEMENTS = {
  affiliateDisclosure: [
    'affiliate',
    'commission',
    'partner',
    'redirected',
    'earn',
  ],
  partnerNotice: [
    'travel partner',
    'partner site',
    'booking site',
    'redirect',
  ],
};

class AffiliateSafetyMonitor {
  private violations: SafetyViolation[] = [];
  private isEnabled: boolean;

  constructor() {
    // Only enable in development
    this.isEnabled = import.meta.env.DEV;
  }

  /**
   * Log a safety violation
   */
  private logViolation(violation: Omit<SafetyViolation, 'id' | 'timestamp'>): void {
    const fullViolation: SafetyViolation = {
      ...violation,
      id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.violations.push(fullViolation);

    // Console output with appropriate severity
    const prefix = `[ZIVO Safety Monitor]`;
    switch (violation.severity) {
      case 'critical':
        console.error(`🚨 ${prefix} CRITICAL:`, violation.message, violation.location);
        break;
      case 'warning':
        console.warn(`⚠️ ${prefix} WARNING:`, violation.message, violation.location);
        break;
      default:
        console.info(`ℹ️ ${prefix} INFO:`, violation.message, violation.location);
    }
  }

  /**
   * Scan page for payment/checkout UI (should never exist)
   */
  scanForPaymentUI(): SafetyViolation[] {
    if (!this.isEnabled) return [];

    const violations: SafetyViolation[] = [];
    const pageText = document.body?.innerText?.toLowerCase() || '';
    const pageHtml = document.body?.innerHTML?.toLowerCase() || '';

    // Check for payment patterns
    for (const pattern of FORBIDDEN_PATTERNS.payment) {
      if (pageHtml.includes(pattern.toLowerCase())) {
        this.logViolation({
          type: 'PAYMENT_UI_DETECTED',
          message: `Payment-related UI detected: "${pattern}"`,
          location: window.location.pathname,
          severity: 'critical',
        });
      }
    }

    // Check for checkout patterns
    for (const pattern of FORBIDDEN_PATTERNS.checkout) {
      if (pageText.includes(pattern.toLowerCase())) {
        this.logViolation({
          type: 'CHECKOUT_FORM_DETECTED',
          message: `Checkout language detected: "${pattern}"`,
          location: window.location.pathname,
          severity: 'critical',
        });
      }
    }

    // Check for guarantee claims
    for (const pattern of FORBIDDEN_PATTERNS.guarantees) {
      if (pageText.includes(pattern.toLowerCase())) {
        this.logViolation({
          type: 'GUARANTEE_CLAIM_DETECTED',
          message: `Forbidden guarantee claim: "${pattern}"`,
          location: window.location.pathname,
          severity: 'warning',
        });
      }
    }

    return violations;
  }

  /**
   * Check if affiliate disclosure exists on booking pages
   */
  checkAffiliateDisclosure(): boolean {
    if (!this.isEnabled) return true;

    const path = window.location.pathname;
    const isBookingPage = ['/flights', '/book-hotel', '/rent-car', '/activities'].some(p => path.includes(p));

    if (!isBookingPage) return true;

    const pageText = document.body?.innerText?.toLowerCase() || '';
    const hasDisclosure = REQUIRED_ELEMENTS.affiliateDisclosure.some(term => 
      pageText.includes(term.toLowerCase())
    );

    if (!hasDisclosure) {
      this.logViolation({
        type: 'AFFILIATE_DISCLOSURE_MISSING',
        message: 'Affiliate disclosure not found on booking page',
        location: path,
        severity: 'critical',
      });
      return false;
    }

    return true;
  }

  /**
   * Verify all booking CTAs open externally (not internal navigation)
   */
  auditBookingButtons(): void {
    if (!this.isEnabled) return;

    const buttons = document.querySelectorAll('button, a');
    const bookingTerms = ['book', 'reserve', 'rent', 'view deal', 'get tickets'];

    buttons.forEach(button => {
      const text = button.textContent?.toLowerCase() || '';
      const isBookingButton = bookingTerms.some(term => text.includes(term));

      if (isBookingButton) {
        // Check if it opens externally
        const anchor = button.tagName === 'A' ? button as HTMLAnchorElement : null;
        const hasExternalTarget = anchor?.target === '_blank';
        const hasOnClick = button.hasAttribute('onclick') || button.getAttribute('type') === 'submit';

        // If it's a booking button without external target, flag it
        if (!hasExternalTarget && !text.includes('modify') && !text.includes('compare')) {
          console.warn(`[Safety] Booking button may not redirect externally:`, text);
        }
      }
    });
  }

  /**
   * Get all recorded violations
   */
  getViolations(): SafetyViolation[] {
    return [...this.violations];
  }

  /**
   * Clear violations (for testing)
   */
  clearViolations(): void {
    this.violations = [];
  }

  /**
   * Run full safety audit
   */
  runFullAudit(): { passed: boolean; violations: SafetyViolation[] } {
    this.clearViolations();

    this.scanForPaymentUI();
    this.checkAffiliateDisclosure();
    this.auditBookingButtons();

    const criticalViolations = this.violations.filter(v => v.severity === 'critical');

    return {
      passed: criticalViolations.length === 0,
      violations: this.violations,
    };
  }
}

// Singleton instance
export const safetyMonitor = new AffiliateSafetyMonitor();

// Auto-run audit on page load in development
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const result = safetyMonitor.runFullAudit();
      if (!result.passed) {
        console.group('🚨 ZIVO Safety Audit Failed');
        result.violations.forEach(v => console.log(v));
        console.groupEnd();
      } else {
        console.log('✅ ZIVO Safety Audit Passed');
      }
    }, 1000);
  });
}
