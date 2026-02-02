/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║               HIZOVO REVENUE ASSUMPTIONS (SINGLE SOURCE OF TRUTH)          ║
 * ║═══════════════════════════════════════════════════════════════════════════║
 * ║  Commission rates and AOV assumptions for revenue forecasting.            ║
 * ║  Updated: February 2, 2026                                                 ║
 * ║                                                                            ║
 * ║  IMPORTANT:                                                                ║
 * ║  - Hizovo is NOT the merchant of record                                    ║
 * ║  - Partners handle ticketing, payment, and fulfillment                     ║
 * ║  - These rates reflect affiliate/white-label partner agreements            ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export interface CommissionRate {
  service: 'flights' | 'hotels' | 'cars';
  type: 'fixed' | 'percentage';
  min: number;
  max: number;
  baseCase: number; // Used for forecasting
  unit: string;
  description: string;
}

export interface AOVAssumption {
  service: 'flights' | 'hotels' | 'cars';
  min: number;
  max: number;
  baseCase: number;
  currency: string;
}

export interface RevenueExample {
  service: 'flights' | 'hotels' | 'cars';
  bookingValue: number;
  commission: number;
  calculation: string;
}

// ============================================================================
// COMMISSION RATES (FINAL - Updated Feb 2, 2026)
// ============================================================================

export const COMMISSION_RATES: CommissionRate[] = [
  {
    service: 'flights',
    type: 'fixed',
    min: 3,
    max: 12,
    baseCase: 6, // $6 per booking for forecasting
    unit: 'per booking',
    description: 'Fixed payout per completed booking. Volume-driven revenue model.',
  },
  {
    service: 'hotels',
    type: 'percentage',
    min: 4,
    max: 4, // Fixed at 4%
    baseCase: 4,
    unit: '%',
    description: '4% commission on booking value.',
  },
  {
    service: 'cars',
    type: 'percentage',
    min: 2,
    max: 2, // Fixed at 2%
    baseCase: 2,
    unit: '%',
    description: '2% commission on booking value.',
  },
];

// ============================================================================
// AVERAGE ORDER VALUE (AOV) ASSUMPTIONS
// ============================================================================

export const AOV_ASSUMPTIONS: AOVAssumption[] = [
  {
    service: 'flights',
    min: 0, // Not applicable - fixed per booking
    max: 0,
    baseCase: 0,
    currency: 'USD',
  },
  {
    service: 'hotels',
    min: 700,
    max: 900,
    baseCase: 800, // $800 average hotel booking
    currency: 'USD',
  },
  {
    service: 'cars',
    min: 300,
    max: 450,
    baseCase: 400, // $400 average car rental
    currency: 'USD',
  },
];

// ============================================================================
// CALCULATION EXAMPLES (For documentation & admin display)
// ============================================================================

export const REVENUE_EXAMPLES: RevenueExample[] = [
  {
    service: 'flights',
    bookingValue: 0, // N/A for fixed
    commission: 6,
    calculation: '$6 flat fee per completed booking',
  },
  {
    service: 'hotels',
    bookingValue: 800,
    commission: 32,
    calculation: '$800 × 4% = $32 commission',
  },
  {
    service: 'cars',
    bookingValue: 400,
    commission: 8,
    calculation: '$400 × 2% = $8 commission',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate estimated commission for a booking
 */
export function calculateCommission(
  service: 'flights' | 'hotels' | 'cars',
  bookingValue?: number
): number {
  const rate = COMMISSION_RATES.find(r => r.service === service);
  if (!rate) return 0;

  if (rate.type === 'fixed') {
    return rate.baseCase;
  }

  // Percentage-based
  const value = bookingValue ?? AOV_ASSUMPTIONS.find(a => a.service === service)?.baseCase ?? 0;
  return (value * rate.baseCase) / 100;
}

/**
 * Get commission rate for a service
 */
export function getCommissionRate(service: 'flights' | 'hotels' | 'cars'): CommissionRate | undefined {
  return COMMISSION_RATES.find(r => r.service === service);
}

/**
 * Get AOV assumption for a service
 */
export function getAOV(service: 'flights' | 'hotels' | 'cars'): AOVAssumption | undefined {
  return AOV_ASSUMPTIONS.find(a => a.service === service);
}

/**
 * Format commission display
 */
export function formatCommissionRate(service: 'flights' | 'hotels' | 'cars'): string {
  const rate = getCommissionRate(service);
  if (!rate) return 'N/A';

  if (rate.type === 'fixed') {
    if (rate.min === rate.max) {
      return `$${rate.min} per booking`;
    }
    return `$${rate.min}–$${rate.max} per booking`;
  }

  if (rate.min === rate.max) {
    return `${rate.min}%`;
  }
  return `${rate.min}–${rate.max}%`;
}

/**
 * Revenue forecast calculation for planning
 */
export function forecastRevenue(
  service: 'flights' | 'hotels' | 'cars',
  bookingsCount: number,
  customAOV?: number
): { revenue: number; calculation: string } {
  const rate = getCommissionRate(service);
  const aov = getAOV(service);
  
  if (!rate) {
    return { revenue: 0, calculation: 'Unknown service' };
  }

  if (rate.type === 'fixed') {
    const revenue = bookingsCount * rate.baseCase;
    return {
      revenue,
      calculation: `${bookingsCount} bookings × $${rate.baseCase} = $${revenue.toLocaleString()}`,
    };
  }

  const bookingValue = customAOV ?? aov?.baseCase ?? 0;
  const commissionPerBooking = (bookingValue * rate.baseCase) / 100;
  const revenue = bookingsCount * commissionPerBooking;
  
  return {
    revenue,
    calculation: `${bookingsCount} bookings × $${bookingValue} × ${rate.baseCase}% = $${revenue.toLocaleString()}`,
  };
}

// ============================================================================
// METADATA
// ============================================================================

export const REVENUE_ASSUMPTIONS_META = {
  version: '2.0',
  lastUpdated: '2026-02-02',
  updatedBy: 'Business Operations',
  notes: [
    'Conservative estimates aligned with affiliate/white-label partners',
    'Flights use fixed per-booking model (volume-driven)',
    'Hotels and Cars use percentage commission model',
    'AOV assumptions based on market research',
  ],
};
