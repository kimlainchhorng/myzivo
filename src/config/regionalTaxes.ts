/**
 * Regional Tax Configuration
 * Tax rates and settings by region/country
 */

export interface TaxConfig {
  type: "VAT" | "GST" | "Sales Tax" | "HST" | "None";
  rate: number; // As decimal (0.20 = 20%)
  inclusive: boolean; // Whether prices include tax
  displayName: string;
  note?: string;
}

export const REGIONAL_TAX_CONFIG: Record<string, TaxConfig> = {
  // European Union
  EU: {
    type: "VAT",
    rate: 0.20,
    inclusive: true,
    displayName: "VAT",
    note: "Standard EU VAT rate",
  },
  
  // United Kingdom
  UK: {
    type: "VAT",
    rate: 0.20,
    inclusive: true,
    displayName: "VAT",
    note: "UK VAT at 20%",
  },
  
  // United States
  US: {
    type: "Sales Tax",
    rate: 0,
    inclusive: false,
    displayName: "Sales Tax",
    note: "Varies by state. Travel services often exempt.",
  },
  
  // Australia
  AU: {
    type: "GST",
    rate: 0.10,
    inclusive: true,
    displayName: "GST",
    note: "Australian GST at 10%",
  },
  
  // Canada
  CA: {
    type: "HST",
    rate: 0.13,
    inclusive: false,
    displayName: "HST",
    note: "Varies by province (5-15%)",
  },
  
  // New Zealand
  NZ: {
    type: "GST",
    rate: 0.15,
    inclusive: true,
    displayName: "GST",
    note: "NZ GST at 15%",
  },
  
  // Japan
  JP: {
    type: "VAT",
    rate: 0.10,
    inclusive: true,
    displayName: "Consumption Tax",
    note: "Japanese consumption tax at 10%",
  },
  
  // Singapore
  SG: {
    type: "GST",
    rate: 0.09,
    inclusive: false,
    displayName: "GST",
    note: "Singapore GST at 9%",
  },
  
  // India
  IN: {
    type: "GST",
    rate: 0.18,
    inclusive: false,
    displayName: "GST",
    note: "Indian GST at 18% for services",
  },
  
  // UAE (No tax)
  AE: {
    type: "VAT",
    rate: 0.05,
    inclusive: true,
    displayName: "VAT",
    note: "UAE VAT at 5%",
  },
  
  // Default / Other
  OTHER: {
    type: "None",
    rate: 0,
    inclusive: false,
    displayName: "Tax",
    note: "Local taxes may apply",
  },
};

// Country code to region mapping
export const COUNTRY_TO_REGION: Record<string, string> = {
  // EU Countries
  DE: "EU", FR: "EU", IT: "EU", ES: "EU", NL: "EU", BE: "EU",
  AT: "EU", PT: "EU", PL: "EU", SE: "EU", DK: "EU", FI: "EU",
  IE: "EU", GR: "EU", CZ: "EU", RO: "EU", HU: "EU", SK: "EU",
  BG: "EU", HR: "EU", LT: "EU", SI: "EU", LV: "EU", EE: "EU",
  CY: "EU", LU: "EU", MT: "EU",
  
  // Individual mappings
  GB: "UK", UK: "UK",
  US: "US",
  AU: "AU",
  CA: "CA",
  NZ: "NZ",
  JP: "JP",
  SG: "SG",
  IN: "IN",
  AE: "AE",
};

// Get tax config for a country
export function getTaxConfigForCountry(countryCode: string): TaxConfig {
  const region = COUNTRY_TO_REGION[countryCode.toUpperCase()];
  return REGIONAL_TAX_CONFIG[region] || REGIONAL_TAX_CONFIG.OTHER;
}

// Calculate price with tax
export function calculatePriceWithTax(
  basePrice: number,
  countryCode: string
): {
  basePrice: number;
  taxAmount: number;
  total: number;
  taxConfig: TaxConfig;
} {
  const taxConfig = getTaxConfigForCountry(countryCode);
  
  if (taxConfig.inclusive) {
    // Price already includes tax
    const preTax = basePrice / (1 + taxConfig.rate);
    return {
      basePrice: preTax,
      taxAmount: basePrice - preTax,
      total: basePrice,
      taxConfig,
    };
  } else {
    // Price excludes tax
    const taxAmount = basePrice * taxConfig.rate;
    return {
      basePrice,
      taxAmount,
      total: basePrice + taxAmount,
      taxConfig,
    };
  }
}

// Format tax display
export function formatTaxDisplay(taxConfig: TaxConfig): string {
  if (taxConfig.rate === 0) {
    return taxConfig.note || "";
  }
  const percentage = (taxConfig.rate * 100).toFixed(0);
  const inclusion = taxConfig.inclusive ? "(included)" : "";
  return `${taxConfig.displayName} ${percentage}% ${inclusion}`.trim();
}
