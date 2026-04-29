/**
 * Auto Parts Suppliers / Vendors
 * Used to attribute part sources, show logos, and link to supplier sites.
 * Logos load from Clearbit via the `domain` field (with monogram fallback).
 */
export interface PartsSupplier {
  id: string;
  name: string;
  shortName?: string;
  domain?: string;
  category: "Retail Chain" | "OE / Dealer" | "Wholesale Distributor" | "Online Marketplace" | "Specialty";
  /** Optional URL pattern to look up a part by SKU (e.g. site search). */
  searchUrlTemplate?: string;
}

export const PARTS_SUPPLIERS: PartsSupplier[] = [
  // Retail chains
  { id: "autozone", name: "AutoZone", domain: "autozone.com", category: "Retail Chain", searchUrlTemplate: "https://www.autozone.com/searchresult?searchText={q}" },
  { id: "napa", name: "NAPA Auto Parts", shortName: "NAPA", domain: "napaonline.com", category: "Retail Chain", searchUrlTemplate: "https://www.napaonline.com/search?text={q}" },
  { id: "oreilly", name: "O'Reilly Auto Parts", shortName: "O'Reilly", domain: "oreillyauto.com", category: "Retail Chain", searchUrlTemplate: "https://www.oreillyauto.com/search?q={q}" },
  { id: "advance", name: "Advance Auto Parts", shortName: "Advance", domain: "advanceautoparts.com", category: "Retail Chain", searchUrlTemplate: "https://shop.advanceautoparts.com/find/{q}" },
  { id: "carquest", name: "Carquest", domain: "carquest.com", category: "Retail Chain" },
  { id: "pepboys", name: "Pep Boys", domain: "pepboys.com", category: "Retail Chain" },
  { id: "autopartsway", name: "AutoPartsWAY", domain: "autopartsway.com", category: "Retail Chain" },
  // Wholesale / distributor
  { id: "worldpac", name: "WORLDPAC", domain: "worldpac.com", category: "Wholesale Distributor" },
  { id: "parts-authority", name: "Parts Authority", domain: "partsauthority.com", category: "Wholesale Distributor" },
  { id: "factory-motor-parts", name: "Factory Motor Parts", shortName: "FMP", domain: "factorymotorparts.com", category: "Wholesale Distributor" },
  { id: "uap", name: "UAP", domain: "uapinc.com", category: "Wholesale Distributor" },
  { id: "keystone", name: "Keystone Automotive", domain: "keystoneautomotive.com", category: "Wholesale Distributor" },
  { id: "lkq", name: "LKQ", domain: "lkqcorp.com", category: "Wholesale Distributor" },
  { id: "fcp-euro", name: "FCP Euro", domain: "fcpeuro.com", category: "Specialty" },
  // OE / Dealer
  { id: "mopar", name: "Mopar (Stellantis)", shortName: "Mopar", domain: "mopar.com", category: "OE / Dealer" },
  { id: "gm-parts", name: "GM Parts Direct", domain: "gmpartsdirect.com", category: "OE / Dealer" },
  { id: "ford-parts", name: "Ford Parts", domain: "parts.ford.com", category: "OE / Dealer" },
  { id: "toyota-parts", name: "Toyota Parts Center", domain: "parts.toyota.com", category: "OE / Dealer" },
  { id: "honda-parts", name: "Honda Parts Now", domain: "hondapartsnow.com", category: "OE / Dealer" },
  { id: "subaru-parts", name: "Subaru Parts Online", domain: "subarupartsonline.com", category: "OE / Dealer" },
  { id: "bmw-parts", name: "BMW Parts", domain: "getbmwparts.com", category: "OE / Dealer" },
  { id: "vw-parts", name: "VW Parts", domain: "parts.vw.com", category: "OE / Dealer" },
  // Online marketplaces
  { id: "rockauto", name: "RockAuto", domain: "rockauto.com", category: "Online Marketplace", searchUrlTemplate: "https://www.rockauto.com/en/partsearch/?partnum={q}" },
  { id: "partsgeek", name: "PartsGeek", domain: "partsgeek.com", category: "Online Marketplace" },
  { id: "1aauto", name: "1A Auto", domain: "1aauto.com", category: "Online Marketplace" },
  { id: "amazon-auto", name: "Amazon Automotive", shortName: "Amazon", domain: "amazon.com", category: "Online Marketplace" },
  { id: "ebay-motors", name: "eBay Motors", domain: "ebay.com", category: "Online Marketplace" },
  { id: "summit-racing", name: "Summit Racing", domain: "summitracing.com", category: "Specialty" },
  { id: "jegs", name: "JEGS", domain: "jegs.com", category: "Specialty" },
  // Specialty / tools
  { id: "snap-on", name: "Snap-on", domain: "snapon.com", category: "Specialty" },
  { id: "matco", name: "Matco Tools", domain: "matcotools.com", category: "Specialty" },
  { id: "harbor-freight", name: "Harbor Freight", domain: "harborfreight.com", category: "Specialty" },
];

export const getPartsSupplier = (id?: string | null): PartsSupplier | undefined =>
  id ? PARTS_SUPPLIERS.find((s) => s.id === id) : undefined;

export const getSupplierLogoUrl = (
  supplier?: Pick<PartsSupplier, "domain"> | null,
  size: number = 80,
): string | null => {
  if (!supplier?.domain) return null;
  return `https://logo.clearbit.com/${supplier.domain}?size=${size}`;
};

export const getSupplierSearchUrl = (supplier: PartsSupplier, query: string): string | null => {
  if (!supplier.searchUrlTemplate) return null;
  return supplier.searchUrlTemplate.replace("{q}", encodeURIComponent(query));
};
