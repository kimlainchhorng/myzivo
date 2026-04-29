/**
 * Auto Repair — Third-Party Warranty Networks / Administrators
 * Used to tag warranties and filter ROs by provider.
 */
export interface WarrantyNetwork {
  id: string;
  name: string;
  shortName?: string;
  phone?: string;
  category?: "VSC Admin" | "Marketplace" | "Aftermarket" | "Dealer-Backed" | "Other";
}

export const WARRANTY_NETWORKS: WarrantyNetwork[] = [
  { id: "1800warranty", name: "1800 Warranty", category: "VSC Admin" },
  { id: "aegis-heroprotect", name: "AEGIS / HeroProtects", category: "VSC Admin" },
  { id: "agws", name: "American Guardian Warranty Services (AGWS)", shortName: "AGWS", category: "VSC Admin" },
  { id: "allegiance", name: "Allegiance Administrators", category: "VSC Admin" },
  { id: "alpha", name: "Alpha Warranty Services", category: "VSC Admin" },
  { id: "amynta", name: "Amynta (Warranty Solutions & Warrantech)", category: "VSC Admin" },
  { id: "asc", name: "ASC Warranty", category: "VSC Admin" },
  { id: "assurant-twg", name: "Assurant (TWG)", category: "VSC Admin" },
  { id: "aul", name: "AUL", category: "VSC Admin" },
  { id: "autopom", name: "autopom!", category: "Marketplace" },
  { id: "axiom", name: "Axiom Admin", category: "VSC Admin" },
  { id: "beecovered", name: "BeeCovered", category: "Marketplace" },
  { id: "bumper", name: "Bumper", category: "Marketplace" },
  { id: "caredge", name: "CarEdge", category: "Marketplace" },
  { id: "carchex", name: "Carchex", category: "Marketplace" },
  { id: "chaiz", name: "Chaiz", category: "Marketplace" },
  { id: "coveragex", name: "CoverageX", category: "VSC Admin" },
  { id: "dowc", name: "DOWC", category: "VSC Admin" },
  { id: "drivesmart", name: "DriveSmart Warranty", category: "Marketplace" },
  { id: "efg", name: "EFG Companies", category: "Dealer-Backed" },
  { id: "empire-auto-protect", name: "Empire Auto Protect", category: "Marketplace" },
  { id: "empire-state", name: "Empire State Warranty", category: "VSC Admin" },
  { id: "endurance", name: "Endurance", category: "Marketplace" },
  { id: "fair", name: "Fair Warranty", category: "Marketplace" },
  { id: "forevercar", name: "ForeverCar", category: "Marketplace" },
  { id: "goldkey", name: "GoldKey Warranty (Consumer Care Direct)", shortName: "GoldKey", category: "VSC Admin" },
  { id: "gwc", name: "GWC", category: "VSC Admin" },
  { id: "haspro", name: "Haspro", category: "VSC Admin" },
  { id: "hwg", name: "Headstart Warranty Group (HWG)", shortName: "HWG", category: "VSC Admin" },
  { id: "integrity", name: "Integrity Warranty", category: "VSC Admin" },
  { id: "naac", name: "North American Auto Care (NAAC)", shortName: "NAAC", category: "VSC Admin" },
  { id: "nac", name: "National Auto Care (NAC)", shortName: "NAC", category: "VSC Admin" },
  { id: "natix", name: "NATIX", category: "VSC Admin" },
  { id: "nvp", name: "NVP Warranty", category: "VSC Admin" },
  { id: "olive", name: "olive", category: "Marketplace" },
  { id: "omega", name: "Omega Auto Care", category: "VSC Admin" },
  { id: "optimus", name: "Optimus Warranty", category: "VSC Admin" },
  { id: "owl", name: "Owl Warranty", category: "VSC Admin" },
  { id: "proguard", name: "ProGuard Warranty", category: "VSC Admin" },
  { id: "protectmycar", name: "Protect My Car", category: "Marketplace" },
  { id: "servicecontract", name: "ServiceContract.com", category: "Marketplace" },
  { id: "smart-autocare", name: "Smart Autocare (ASI)", shortName: "Smart Autocare", category: "VSC Admin" },
  { id: "veritas", name: "Veritas", category: "VSC Admin" },
  { id: "warranty-outlet", name: "Warranty Outlet", category: "Marketplace" },
  { id: "zoomi", name: "Zoomi", category: "VSC Admin" },
];

export const getWarrantyNetwork = (id?: string | null): WarrantyNetwork | undefined =>
  id ? WARRANTY_NETWORKS.find((n) => n.id === id) : undefined;
