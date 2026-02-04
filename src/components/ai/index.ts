/**
 * AI Components Index
 * Smart recommendations, personalization, and transparency
 */

// Core AI Components
export { default as SmartSavingsBanner } from "./SmartSavingsBanner";
export { default as SmartBookingSuggestions } from "./SmartBookingSuggestions";
export { SmartRecommendationCard } from "./SmartRecommendationCard";

// Personalization
export { default as SmartSearchSuggestions } from "./SmartSearchSuggestions";
export { default as PersonalizedHomepage } from "./PersonalizedHomepage";
export { default as BehaviorSuggestions } from "./BehaviorSuggestions";

// Result Enhancement
export { default as ResultBadges, calculateResultBadges } from "./ResultBadges";
export type { BadgeType } from "./ResultBadges";

// Alerts & Notifications
export { default as SmartAlertTiming } from "./SmartAlertTiming";

// Future Features
export { default as FutureAIFeatures, FutureAIFeaturesCompact } from "./FutureAIFeatures";

// Transparency & Compliance
export {
  default as AITransparencyNotice,
  AIFooterDisclaimer,
  AIBadgeNotice,
} from "./AITransparencyNotice";

// Partner Tools
export { PartnerInsightCard } from "./PartnerInsightCard";
export { PricingSuggestionBanner } from "./PricingSuggestionBanner";
