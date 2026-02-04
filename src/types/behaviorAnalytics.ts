/**
 * User Behavior Analytics Types
 * Anonymized tracking for personalization
 */

export interface SearchPattern {
  route: string;
  origin: string;
  destination: string;
  searchedAt: string;
  tripType: 'one-way' | 'round-trip' | 'multi-city';
}

export interface UserBehaviorProfile {
  searchPatterns: {
    topRoutes: string[];
    preferredDays: string[];
    avgAdvanceBooking: number;
    recentSearches: SearchPattern[];
  };
  preferences: {
    airlines: string[];
    hotelChains: string[];
    budgetTier: 'budget' | 'mid' | 'luxury';
    travelStyle: string[];
    cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  };
  engagement: {
    searchFrequency: number;
    conversionRate: number;
    avgSessionTime: number;
    lastActiveAt: string;
  };
}

export interface PersonalizationContext {
  isLoggedIn: boolean;
  hasSearchHistory: boolean;
  behaviorProfile: UserBehaviorProfile | null;
  recommendedDestinations: string[];
  priceAlertsSummary: {
    active: number;
    recentDrops: number;
  };
}

export interface DealCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface FlashDeal {
  id: string;
  title: string;
  subtitle: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  expiresAt: string;
  claimedCount: number;
  totalAvailable: number;
  category: 'flights' | 'hotels' | 'cars';
  destination?: string;
  image?: string;
  route?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'refund' | 'promo' | 'miles';
  amount: number;
  description: string;
  createdAt: string;
  expiresAt?: string;
  status: 'pending' | 'completed' | 'expired';
}

export interface WalletBalance {
  bookingCredits: number;
  promoCredits: number;
  pendingRefunds: number;
  zivoMiles: number;
  transactions: WalletTransaction[];
}

export interface CreatorStats {
  totalClicks: number;
  conversions: number;
  conversionRate: number;
  earningsThisMonth: number;
  earningsTotal: number;
  topLinks: {
    product: string;
    clicks: number;
    conversions: number;
  }[];
  tier: 'starter' | 'rising' | 'pro' | 'elite';
}
