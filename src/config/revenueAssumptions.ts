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
// TRAFFIC & CONVERSION ASSUMPTIONS (CONSERVATIVE)
// ============================================================================

export interface TrafficAssumption {
  month: number;
  visits: number;
}

export interface ConversionRate {
  service: 'flights' | 'hotels' | 'cars';
  checkoutClickRate: number; // % of visits that click to partner checkout
  partnerCompletionRate: number; // % of clicks that complete booking with partner
}

export const TRAFFIC_ASSUMPTIONS: TrafficAssumption[] = [
  { month: 1, visits: 5000 },
  { month: 2, visits: 8000 },
  { month: 3, visits: 12000 },
  { month: 4, visits: 17000 },
  { month: 5, visits: 21000 },
  { month: 6, visits: 25000 },
  { month: 7, visits: 32000 },
  { month: 8, visits: 42000 },
  { month: 9, visits: 52000 },
  { month: 10, visits: 62000 },
  { month: 11, visits: 68000 },
  { month: 12, visits: 75000 },
];

export const CONVERSION_RATES: ConversionRate[] = [
  { service: 'flights', checkoutClickRate: 0.07, partnerCompletionRate: 0.65 },
  { service: 'hotels', checkoutClickRate: 0.04, partnerCompletionRate: 0.65 },
  { service: 'cars', checkoutClickRate: 0.025, partnerCompletionRate: 0.65 },
];

// ============================================================================
// MONTHLY PROJECTION CALCULATOR
// ============================================================================

export interface MonthlyProjection {
  month: number;
  visits: number;
  flights: { clicks: number; bookings: number; revenue: number };
  hotels: { clicks: number; bookings: number; revenue: number };
  cars: { clicks: number; bookings: number; revenue: number };
  totalRevenue: number;
}

export function calculateMonthlyProjection(month: number): MonthlyProjection {
  const traffic = TRAFFIC_ASSUMPTIONS.find(t => t.month === month);
  const visits = traffic?.visits ?? 0;

  const flightRate = CONVERSION_RATES.find(c => c.service === 'flights')!;
  const hotelRate = CONVERSION_RATES.find(c => c.service === 'hotels')!;
  const carRate = CONVERSION_RATES.find(c => c.service === 'cars')!;

  const flightClicks = Math.round(visits * flightRate.checkoutClickRate);
  const flightBookings = Math.round(flightClicks * flightRate.partnerCompletionRate);
  const flightRevenue = flightBookings * 6; // $6 per booking

  const hotelClicks = Math.round(visits * hotelRate.checkoutClickRate);
  const hotelBookings = Math.round(hotelClicks * hotelRate.partnerCompletionRate);
  const hotelRevenue = hotelBookings * 32; // $32 per booking (4% of $800)

  const carClicks = Math.round(visits * carRate.checkoutClickRate);
  const carBookings = Math.round(carClicks * carRate.partnerCompletionRate);
  const carRevenue = carBookings * 8; // $8 per booking (2% of $400)

  return {
    month,
    visits,
    flights: { clicks: flightClicks, bookings: flightBookings, revenue: flightRevenue },
    hotels: { clicks: hotelClicks, bookings: hotelBookings, revenue: hotelRevenue },
    cars: { clicks: carClicks, bookings: carBookings, revenue: carRevenue },
    totalRevenue: flightRevenue + hotelRevenue + carRevenue,
  };
}

export function getAllMonthlyProjections(): MonthlyProjection[] {
  return TRAFFIC_ASSUMPTIONS.map(t => calculateMonthlyProjection(t.month));
}

export function getAnnualRunRate(): number {
  const month12 = calculateMonthlyProjection(12);
  return month12.totalRevenue * 12;
}

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
  version: '2.1',
  lastUpdated: '2026-02-02',
  updatedBy: 'Business Operations',
  notes: [
    'Conservative estimates aligned with affiliate/white-label partners',
    'Flights use fixed per-booking model (volume-driven)',
    'Hotels = primary revenue engine (4% × $800 AOV = $32/booking)',
    'Cars = incremental upside (2% × $400 AOV = $8/booking)',
    'Month 6 target: ~$30K/month | Month 12 target: ~$93K/month',
    'Annual run rate at scale: $1.1M–$1.2M gross commission',
  ],
  strategicNotes: [
    'Flights = volume + traffic driver',
    'Hotels = primary revenue engine',
    'Cars = incremental upside',
    'No inventory risk, no payment liability',
    'Scales with SEO + mobile web + ads',
  ],
};
