/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║               ZIVO REVENUE ASSUMPTIONS (SINGLE SOURCE OF TRUTH)           ║
 * ║═══════════════════════════════════════════════════════════════════════════║
 * ║  Commission rates and revenue projections for business planning.          ║
 * ║  Updated: February 4, 2026                                                ║
 * ║                                                                            ║
 * ║  IMPORTANT:                                                                ║
 * ║  - Commission-based marketplace model                                      ║
 * ║  - Partners handle ticketing, payment, and fulfillment                     ║
 * ║  - These rates reflect affiliate/white-label partner agreements            ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export interface CommissionRate {
  service: 'flights' | 'hotels' | 'cars' | 'addons';
  type: 'fixed' | 'percentage';
  min: number;
  max: number;
  baseCase: number;
  unit: string;
  description: string;
  examples?: string[];
}

export interface AOVAssumption {
  service: 'flights' | 'hotels' | 'cars' | 'addons';
  min: number;
  max: number;
  baseCase: number;
  currency: string;
}

export interface RevenueExample {
  service: 'flights' | 'hotels' | 'cars' | 'addons';
  bookingsPerMonth: number;
  avgCommission: number;
  monthlyRevenue: number;
  calculation: string;
}

export interface ScaleScenario {
  name: string;
  timeframe: string;
  bookingsPerMonth: number;
  blendedCommission: number;
  monthlyRevenue: number;
  annualRevenue: number;
  description: string;
}

// ============================================================================
// COMMISSION RATES (Updated Feb 4, 2026)
// ============================================================================

export const COMMISSION_RATES: CommissionRate[] = [
  {
    service: 'flights',
    type: 'fixed',
    min: 3,
    max: 12,
    baseCase: 7,
    unit: 'per booking',
    description: 'Fixed payout per completed booking. International routes may earn $15+.',
    examples: [
      'Domestic flights: $3-$7',
      'International flights: $8-$12',
      'Premium routes: $15+',
    ],
  },
  {
    service: 'hotels',
    type: 'percentage',
    min: 10,
    max: 25,
    baseCase: 15,
    unit: '%',
    description: 'Percentage commission on booking value from hotel partners.',
    examples: [
      '$400 booking × 15% = $60 commission',
      'High-end hotels: 20-25%',
      'Budget chains: 10-12%',
    ],
  },
  {
    service: 'cars',
    type: 'fixed',
    min: 5,
    max: 30,
    baseCase: 15,
    unit: 'per booking',
    description: 'Fixed commission per car rental booking.',
    examples: [
      'Economy cars: $5-$10',
      'Standard/SUV: $10-$20',
      'Luxury/Premium: $20-$30',
    ],
  },
  {
    service: 'addons',
    type: 'fixed',
    min: 3,
    max: 10,
    baseCase: 5,
    unit: 'per item',
    description: 'Commission on travel insurance, extra baggage, flexible tickets.',
    examples: [
      'Travel insurance: $5-$10',
      'Extra baggage: $3-$5',
      'Flexible booking: $3-$8',
    ],
  },
];

// ============================================================================
// AVERAGE ORDER VALUE (AOV) ASSUMPTIONS
// ============================================================================

export const AOV_ASSUMPTIONS: AOVAssumption[] = [
  {
    service: 'flights',
    min: 0, // N/A for fixed
    max: 0,
    baseCase: 0,
    currency: 'USD',
  },
  {
    service: 'hotels',
    min: 300,
    max: 600,
    baseCase: 400,
    currency: 'USD',
  },
  {
    service: 'cars',
    min: 150,
    max: 400,
    baseCase: 250,
    currency: 'USD',
  },
  {
    service: 'addons',
    min: 20,
    max: 100,
    baseCase: 50,
    currency: 'USD',
  },
];

// ============================================================================
// REVENUE EXAMPLES (Conservative Monthly Scenario)
// ============================================================================

export const REVENUE_EXAMPLES: RevenueExample[] = [
  {
    service: 'flights',
    bookingsPerMonth: 1000,
    avgCommission: 7,
    monthlyRevenue: 7000,
    calculation: '1,000 bookings × $7 = $7,000',
  },
  {
    service: 'hotels',
    bookingsPerMonth: 500,
    avgCommission: 60,
    monthlyRevenue: 30000,
    calculation: '500 bookings × $400 × 15% = $30,000',
  },
  {
    service: 'cars',
    bookingsPerMonth: 300,
    avgCommission: 15,
    monthlyRevenue: 4500,
    calculation: '300 bookings × $15 = $4,500',
  },
  {
    service: 'addons',
    bookingsPerMonth: 600,
    avgCommission: 5,
    monthlyRevenue: 3000,
    calculation: 'Travel insurance, baggage, etc. = ~$3,000',
  },
];

// ============================================================================
// SCALE SCENARIOS
// ============================================================================

export const SCALE_SCENARIOS: ScaleScenario[] = [
  {
    name: 'Conservative',
    timeframe: 'Current',
    bookingsPerMonth: 1800,
    blendedCommission: 24.72,
    monthlyRevenue: 44500,
    annualRevenue: 534000,
    description: 'Based on moderate traffic and organic growth.',
  },
  {
    name: 'Growth',
    timeframe: '12-18 months',
    bookingsPerMonth: 5000,
    blendedCommission: 20,
    monthlyRevenue: 100000,
    annualRevenue: 1200000,
    description: 'With traffic growth, SEO optimization, and marketing.',
  },
  {
    name: 'Scale',
    timeframe: '24+ months',
    bookingsPerMonth: 15000,
    blendedCommission: 22,
    monthlyRevenue: 330000,
    annualRevenue: 3960000,
    description: 'Full platform maturity with all verticals active.',
  },
];

// ============================================================================
// BUSINESS MODEL ADVANTAGES
// ============================================================================

export const BUSINESS_MODEL_ADVANTAGES = [
  {
    title: 'No Inventory Cost',
    description: "We don't purchase or hold travel inventory. Zero upfront investment risk.",
    icon: 'package',
  },
  {
    title: 'No Ticket Issuing Risk',
    description: 'Partners handle ticketing and fulfillment. We focus on customer acquisition.',
    icon: 'shield',
  },
  {
    title: 'No Payment Storage',
    description: 'PCI-compliant partners process payments. We never store card data.',
    icon: 'lock',
  },
  {
    title: 'Commission = Pure Margin',
    description: 'Every dollar of commission is gross profit with minimal COGS.',
    icon: 'trending-up',
  },
  {
    title: 'Scales with Traffic',
    description: 'More visitors = more bookings = more revenue. Linear scaling.',
    icon: 'users',
  },
  {
    title: 'Low Operating Costs',
    description: 'Cloud infrastructure scales efficiently. No physical presence needed.',
    icon: 'cloud',
  },
];

// ============================================================================
// MONTHLY TOTALS (CONSERVATIVE)
// ============================================================================

export const MONTHLY_TOTALS = {
  flights: 7000,
  hotels: 30000,
  cars: 4500,
  addons: 3000,
  total: 44500,
  annual: 534000,
};

// ============================================================================
// TRAFFIC & CONVERSION ASSUMPTIONS
// ============================================================================

export interface TrafficAssumption {
  month: number;
  visits: number;
}

export interface ConversionRate {
  service: 'flights' | 'hotels' | 'cars';
  checkoutClickRate: number;
  partnerCompletionRate: number;
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
// HELPER FUNCTIONS
// ============================================================================

export function getCommissionRate(service: 'flights' | 'hotels' | 'cars' | 'addons'): CommissionRate | undefined {
  return COMMISSION_RATES.find(r => r.service === service);
}

export function getAOV(service: 'flights' | 'hotels' | 'cars' | 'addons'): AOVAssumption | undefined {
  return AOV_ASSUMPTIONS.find(a => a.service === service);
}

export function formatCommissionRate(service: 'flights' | 'hotels' | 'cars' | 'addons'): string {
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

export function calculateCommission(
  service: 'flights' | 'hotels' | 'cars' | 'addons',
  bookingValue?: number
): number {
  const rate = getCommissionRate(service);
  if (!rate) return 0;

  if (rate.type === 'fixed') {
    return rate.baseCase;
  }

  const aov = getAOV(service);
  const value = bookingValue ?? aov?.baseCase ?? 0;
  return (value * rate.baseCase) / 100;
}

export function forecastRevenue(
  service: 'flights' | 'hotels' | 'cars' | 'addons',
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
      calculation: `${bookingsCount.toLocaleString()} bookings × $${rate.baseCase} = $${revenue.toLocaleString()}`,
    };
  }

  const bookingValue = customAOV ?? aov?.baseCase ?? 0;
  const commissionPerBooking = (bookingValue * rate.baseCase) / 100;
  const revenue = bookingsCount * commissionPerBooking;
  
  return {
    revenue,
    calculation: `${bookingsCount.toLocaleString()} × $${bookingValue} × ${rate.baseCase}% = $${revenue.toLocaleString()}`,
  };
}

export function calculateTotalRevenue(
  flightBookings: number,
  hotelBookings: number,
  carBookings: number,
  addonRevenue: number = 3000
): { monthly: number; annual: number; breakdown: Record<string, number> } {
  const flights = forecastRevenue('flights', flightBookings);
  const hotels = forecastRevenue('hotels', hotelBookings);
  const cars = forecastRevenue('cars', carBookings);
  
  const monthly = flights.revenue + hotels.revenue + cars.revenue + addonRevenue;
  
  return {
    monthly,
    annual: monthly * 12,
    breakdown: {
      flights: flights.revenue,
      hotels: hotels.revenue,
      cars: cars.revenue,
      addons: addonRevenue,
    },
  };
}

// ============================================================================
// MONTHLY PROJECTION CALCULATOR (Legacy support)
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
  const flightRevenue = flightBookings * 7; // $7 per booking (updated base case)

  const hotelClicks = Math.round(visits * hotelRate.checkoutClickRate);
  const hotelBookings = Math.round(hotelClicks * hotelRate.partnerCompletionRate);
  const hotelRevenue = hotelBookings * 60; // $60 per booking (15% of $400)

  const carClicks = Math.round(visits * carRate.checkoutClickRate);
  const carBookings = Math.round(carClicks * carRate.partnerCompletionRate);
  const carRevenue = carBookings * 15; // $15 per booking

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
// METADATA
// ============================================================================

export const REVENUE_ASSUMPTIONS_META = {
  version: '3.0',
  lastUpdated: '2026-02-04',
  updatedBy: 'Business Operations',
  notes: [
    'Flights: $3-$12 per booking (international $15+)',
    'Hotels: 10-25% commission (primary revenue engine)',
    'Cars: $5-$30 per booking',
    'Add-ons: $3-$10 per item',
    'Conservative monthly: $44,500',
    'Conservative annual: $534,000',
    'Scale scenario (12-18mo): $100K/month, $1.2M/year',
  ],
  tagline: 'ZIVO is a high-margin, low-risk, commission-driven travel platform designed to scale with user growth.',
};
