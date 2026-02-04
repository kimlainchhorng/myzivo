/**
 * ZIVO OTA PRICING CONFIGURATION
 * 
 * Service fees, markups, and commercial model settings
 * Compliant with OTA disclosure requirements
 * 
 * Last Updated: February 4, 2026
 */

// ============================================
// SERVICE FEE STRUCTURE
// ============================================

export type ProductType = "flights" | "hotels" | "cars" | "activities" | "transfers";
export type FeeType = "booking" | "change" | "refund" | "cancellation";

export interface ServiceFee {
  type: FeeType;
  amount: number;
  currency: string;
  isPercentage: boolean;
  minAmount?: number;
  maxAmount?: number;
  refundable: boolean;
  description: string;
}

export const SERVICE_FEES: Record<ProductType, ServiceFee[]> = {
  flights: [
    {
      type: "booking",
      amount: 0, // Zero for now, can be configured
      currency: "USD",
      isPercentage: false,
      refundable: false,
      description: "ZIVO Service Fee",
    },
    {
      type: "change",
      amount: 25,
      currency: "USD",
      isPercentage: false,
      refundable: false,
      description: "Change Handling Fee",
    },
    {
      type: "refund",
      amount: 25,
      currency: "USD",
      isPercentage: false,
      refundable: false,
      description: "Refund Processing Fee",
    },
  ],
  hotels: [
    {
      type: "booking",
      amount: 0,
      currency: "USD",
      isPercentage: false,
      refundable: false,
      description: "ZIVO Service Fee",
    },
  ],
  cars: [
    {
      type: "booking",
      amount: 0,
      currency: "USD",
      isPercentage: false,
      refundable: false,
      description: "ZIVO Service Fee",
    },
  ],
  activities: [
    {
      type: "booking",
      amount: 0,
      currency: "USD",
      isPercentage: false,
      refundable: false,
      description: "ZIVO Service Fee",
    },
  ],
  transfers: [
    {
      type: "booking",
      amount: 0,
      currency: "USD",
      isPercentage: false,
      refundable: false,
      description: "ZIVO Service Fee",
    },
  ],
};

// ============================================
// MARKUP CONFIGURATION (Per Supplier)
// ============================================

export interface MarkupRule {
  supplier: string;
  markupType: "fixed" | "percentage";
  amount: number;
  minAmount?: number;
  maxAmount?: number;
  isEmbedded: boolean; // If true, markup is hidden in fare
  description?: string;
}

export const SUPPLIER_MARKUPS: Record<ProductType, MarkupRule[]> = {
  flights: [
    {
      supplier: "duffel",
      markupType: "percentage",
      amount: 2.5, // 2.5% markup on net fare
      minAmount: 5,
      maxAmount: 50,
      isEmbedded: true,
      description: "Duffel fare markup",
    },
    {
      supplier: "travelfusion",
      markupType: "percentage",
      amount: 3,
      minAmount: 5,
      maxAmount: 75,
      isEmbedded: true,
      description: "TravelFusion fare markup",
    },
  ],
  hotels: [
    {
      supplier: "hotelbeds",
      markupType: "percentage",
      amount: 8,
      isEmbedded: true,
      description: "Hotelbeds margin",
    },
    {
      supplier: "ratehawk",
      markupType: "percentage",
      amount: 10,
      isEmbedded: true,
      description: "RateHawk margin",
    },
  ],
  cars: [
    {
      supplier: "rentalcars",
      markupType: "percentage",
      amount: 5,
      isEmbedded: true,
      description: "Rental car margin",
    },
  ],
  activities: [
    {
      supplier: "viator",
      markupType: "percentage",
      amount: 8,
      isEmbedded: true,
      description: "Activity margin",
    },
  ],
  transfers: [
    {
      supplier: "get_transfer",
      markupType: "percentage",
      amount: 10,
      isEmbedded: true,
      description: "Transfer margin",
    },
  ],
};

// ============================================
// PRICE DISPLAY CONFIGURATION
// ============================================

export const PRICE_DISPLAY = {
  /** Always show taxes included in displayed price */
  showTaxInclusive: true,
  
  /** Show service fee separately in breakdown */
  showServiceFeeSeparately: true,
  
  /** Currency display format */
  defaultCurrency: "USD",
  
  /** Decimal places */
  decimalPlaces: 2,
  
  /** Show original price if discounted */
  showOriginalPrice: true,
} as const;

// ============================================
// FEE DISCLOSURE COPY
// ============================================

export const FEE_DISCLOSURE = {
  /** Main fee disclosure */
  main: "A ZIVO service fee may apply. Service fees are non-refundable unless required by law.",
  
  /** Fee placement notice */
  placement: "All fees are itemized in the price breakdown below.",
  
  /** Taxes notice */
  taxes: "Prices include applicable taxes and fees.",
  
  /** No hidden fees promise */
  noHiddenFees: "No hidden fees. What you see is what you pay.",
  
  /** Refund policy for fees */
  feeRefundPolicy: "Service fees are non-refundable. Fare refunds are subject to airline/supplier policies.",
  
  /** Currency notice */
  currency: "Currency conversion rates may vary by payment provider.",
  
  /** Per product type */
  flights: "Displayed price includes base fare, taxes, and government fees.",
  hotels: "Prices and cancellation policies vary by property.",
  cars: "Optional extras are paid to the rental provider.",
  activities: "Activity prices include all applicable fees.",
  transfers: "Transfer prices are all-inclusive.",
} as const;

// ============================================
// ADD-ONS & UPSELLS CONFIGURATION
// ============================================

export interface AddOnOption {
  id: string;
  name: string;
  description: string;
  priceType: "fixed" | "percentage" | "variable";
  basePrice?: number;
  currency?: string;
  isOptional: boolean;
  category: "protection" | "flexibility" | "comfort" | "extras";
}

export const FLIGHT_ADDONS: AddOnOption[] = [
  {
    id: "travel_protection",
    name: "Travel Protection",
    description: "Comprehensive coverage for trip cancellation, delays, and medical emergencies",
    priceType: "percentage",
    basePrice: 7, // 7% of fare
    isOptional: true,
    category: "protection",
  },
  {
    id: "flexible_ticket",
    name: "Flexible Ticket",
    description: "Change or cancel your flight without penalty fees",
    priceType: "fixed",
    basePrice: 39,
    currency: "USD",
    isOptional: true,
    category: "flexibility",
  },
  {
    id: "priority_boarding",
    name: "Priority Boarding",
    description: "Board the aircraft first and secure overhead bin space",
    priceType: "variable",
    isOptional: true,
    category: "comfort",
  },
  {
    id: "seat_selection",
    name: "Seat Selection",
    description: "Choose your preferred seat in advance",
    priceType: "variable",
    isOptional: true,
    category: "comfort",
  },
  {
    id: "checked_bag",
    name: "Checked Baggage",
    description: "Add checked baggage to your booking",
    priceType: "variable",
    isOptional: true,
    category: "extras",
  },
];

export const HOTEL_ADDONS: AddOnOption[] = [
  {
    id: "room_protection",
    name: "Room Protection",
    description: "Free cancellation up to 24 hours before check-in",
    priceType: "percentage",
    basePrice: 10,
    isOptional: true,
    category: "protection",
  },
  {
    id: "early_checkin",
    name: "Early Check-in",
    description: "Guaranteed early check-in from 10 AM",
    priceType: "fixed",
    basePrice: 25,
    currency: "USD",
    isOptional: true,
    category: "comfort",
  },
  {
    id: "late_checkout",
    name: "Late Check-out",
    description: "Extended check-out until 3 PM",
    priceType: "fixed",
    basePrice: 25,
    currency: "USD",
    isOptional: true,
    category: "comfort",
  },
];

export const CAR_ADDONS: AddOnOption[] = [
  {
    id: "full_insurance",
    name: "Full Insurance",
    description: "Zero excess coverage for peace of mind",
    priceType: "variable",
    isOptional: true,
    category: "protection",
  },
  {
    id: "gps",
    name: "GPS Navigation",
    description: "Portable GPS navigation device",
    priceType: "fixed",
    basePrice: 12,
    currency: "USD",
    isOptional: true,
    category: "extras",
  },
  {
    id: "additional_driver",
    name: "Additional Driver",
    description: "Add an extra authorized driver",
    priceType: "fixed",
    basePrice: 15,
    currency: "USD",
    isOptional: true,
    category: "extras",
  },
];

// ============================================
// CHECKOUT TERMS ACCEPTANCE
// ============================================

export const CHECKOUT_TERMS = {
  /** Required checkboxes at checkout */
  required: [
    {
      id: "fare_rules",
      label: "I have reviewed fare rules and cancellation policy",
      required: true,
    },
    {
      id: "terms_of_service",
      label: "I accept ZIVO's Terms of Service",
      required: true,
      link: "/terms",
    },
  ],
  
  /** Optional checkboxes */
  optional: [
    {
      id: "marketing",
      label: "Send me deals and travel inspiration",
      required: false,
    },
  ],
  
  /** Error message if not checked */
  errorMessage: "Please accept all required terms before continuing.",
  
  /** Confirmation copy */
  confirmationCopy: "By completing this booking, you agree to ZIVO's Terms of Service, Privacy Policy, and the fare rules shown above.",
} as const;

// ============================================
// REFUND & CHARGEBACK PROTECTION
// ============================================

export const REFUND_POLICY = {
  /** General refund policy */
  general: "Refunds are processed according to fare rules and supplier policies.",
  
  /** Service fee policy */
  serviceFees: "ZIVO service fees are non-refundable unless required by law.",
  
  /** Timeline */
  timeline: "Approved refunds are processed within 5-10 business days.",
  
  /** Per product */
  flights: "Flight refunds follow airline fare rules. Some fares are non-refundable.",
  hotels: "Hotel refunds follow the property's cancellation policy.",
  cars: "Car rental refunds are subject to the rental company's terms.",
  
  /** Chargeback notice */
  chargeback: "Disputed charges are reviewed against booking records and confirmation.",
} as const;

// ============================================
// LEGAL FOOTER (PRICING)
// ============================================

export const PRICING_LEGAL_FOOTER = {
  /** Full legal footer for pricing pages */
  full: "ZIVO is an online travel agency. Displayed prices include applicable taxes and fees. Service fees may apply and are disclosed before payment. Airline and supplier rules apply to all bookings.",
  
  /** Short version */
  short: "Prices include taxes. Service fees may apply.",
  
  /** Per product disclaimers */
  flights: "Flight prices include base fare, taxes, and government fees. Baggage fees may apply.",
  hotels: "Hotel rates may be subject to local taxes payable at the property.",
  cars: "Rental rates exclude optional extras and fuel charges.",
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get booking service fee for a product type
 */
export function getBookingServiceFee(product: ProductType): ServiceFee | undefined {
  return SERVICE_FEES[product]?.find(fee => fee.type === "booking");
}

/**
 * Calculate markup for a fare
 */
export function calculateMarkup(
  netFare: number,
  product: ProductType,
  supplier: string
): number {
  const rule = SUPPLIER_MARKUPS[product]?.find(m => m.supplier === supplier);
  if (!rule) return 0;
  
  let markup = rule.markupType === "percentage" 
    ? netFare * (rule.amount / 100)
    : rule.amount;
  
  if (rule.minAmount && markup < rule.minAmount) markup = rule.minAmount;
  if (rule.maxAmount && markup > rule.maxAmount) markup = rule.maxAmount;
  
  return Math.round(markup * 100) / 100;
}

/**
 * Calculate total price with markup and fees
 */
export function calculateTotalPrice(
  netFare: number,
  taxes: number,
  product: ProductType,
  supplier: string,
  includeServiceFee: boolean = true
): {
  baseFare: number;
  markup: number;
  taxes: number;
  serviceFee: number;
  total: number;
} {
  const markup = calculateMarkup(netFare, product, supplier);
  const serviceFee = includeServiceFee 
    ? (getBookingServiceFee(product)?.amount || 0)
    : 0;
  
  return {
    baseFare: netFare,
    markup,
    taxes,
    serviceFee,
    total: netFare + markup + taxes + serviceFee,
  };
}

/**
 * Format price for display
 */
export function formatPrice(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: PRICE_DISPLAY.decimalPlaces,
    maximumFractionDigits: PRICE_DISPLAY.decimalPlaces,
  }).format(amount);
}
