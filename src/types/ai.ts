/**
 * ZIVO AI Optimization Types
 * AI-powered personalization and insights
 */

export interface UserBehaviorSignal {
  id: string;
  user_id: string | null;
  session_id: string | null;
  service_type: ServiceType;
  signal_type: BehaviorSignalType;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AISearchRanking {
  id: string;
  user_id: string | null;
  service_type: ServiceType;
  search_params: Record<string, unknown>;
  rankings: RankingItem[];
  model_version: string;
  created_at: string;
}

export interface RankingItem {
  entity_id: string;
  score: number;
  factors: RankingFactor[];
}

export interface RankingFactor {
  name: string;
  weight: number;
  contribution: number;
}

export interface AIPricingSuggestion {
  id: string;
  target_type: PartnerType;
  target_id: string;
  suggestion_type: PricingSuggestionType;
  current_value: number | null;
  suggested_value: number | null;
  reason: string;
  confidence_score: number;
  factors: Record<string, unknown>;
  status: SuggestionStatus;
  expires_at: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  source_service: ServiceType;
  source_booking_id: string | null;
  recommended_service: ServiceType;
  recommendation_type: RecommendationType;
  context: RecommendationContext;
  relevance_score: number;
  is_shown: boolean;
  shown_at: string | null;
  is_clicked: boolean;
  clicked_at: string | null;
  is_converted: boolean;
  converted_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface RecommendationContext {
  title: string;
  description: string;
  destination?: string;
  date?: string;
  link?: string;
  icon?: string;
}

export interface AIFraudAlert {
  id: string;
  alert_type: FraudAlertType;
  severity: AlertSeverity;
  user_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  risk_score: number;
  indicators: FraudIndicator[];
  model_version: string;
  status: FraudAlertStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  action_taken: string | null;
  created_at: string;
}

export interface FraudIndicator {
  type: string;
  description: string;
  weight: number;
}

export interface UserCLVScore {
  id: string;
  user_id: string;
  clv_score: number;
  clv_tier: CLVTier;
  total_bookings: number;
  total_spend: number;
  avg_order_value: number;
  booking_frequency: number;
  churn_risk: number;
  last_activity_at: string | null;
  factors: CLVFactors;
  model_version: string;
  created_at: string;
  updated_at: string;
}

export interface CLVFactors {
  recency_score?: number;
  frequency_score?: number;
  monetary_score?: number;
  engagement_score?: number;
  services_used?: string[];
}

export interface AIPartnerInsight {
  id: string;
  partner_type: PartnerType;
  partner_id: string;
  insight_type: InsightType;
  title: string;
  description: string;
  metric_name: string | null;
  current_value: number | null;
  benchmark_value: number | null;
  impact_estimate: string | null;
  priority: number;
  is_read: boolean;
  read_at: string | null;
  is_actioned: boolean;
  actioned_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface AIModelMetrics {
  id: string;
  model_name: AIModelName;
  model_version: string;
  metric_name: string;
  metric_value: number;
  sample_size: number | null;
  period_start: string;
  period_end: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Enums
export type ServiceType = 'flights' | 'hotels' | 'cars' | 'rides' | 'eats' | 'move';
export type BehaviorSignalType = 'search' | 'view' | 'click' | 'book' | 'cancel' | 'review';
export type PartnerType = 'car_owner' | 'driver' | 'fleet' | 'restaurant';
export type PricingSuggestionType = 'increase' | 'decrease' | 'surge' | 'promotion';
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type RecommendationType = 'post_booking' | 'complementary' | 'upsell';
export type FraudAlertType = 'suspicious_booking' | 'payment_fraud' | 'account_takeover' | 'abuse';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FraudAlertStatus = 'pending' | 'reviewing' | 'confirmed' | 'dismissed';
export type CLVTier = 'standard' | 'bronze' | 'silver' | 'gold' | 'platinum';
export type InsightType = 'performance' | 'opportunity' | 'warning' | 'tip';
export type AIModelName = 'search_ranking' | 'pricing' | 'fraud' | 'clv' | 'recommendations';

// Dashboard summary types
export interface AIInsightsSummary {
  totalFraudAlerts: number;
  pendingFraudAlerts: number;
  criticalAlerts: number;
  pricingSuggestions: number;
  acceptedSuggestions: number;
  conversionLift: number;
  totalRecommendations: number;
  recommendationClickRate: number;
  avgCLVScore: number;
  churnRiskUsers: number;
}

export interface AIModelPerformance {
  modelName: AIModelName;
  accuracy: number;
  conversionLift: number;
  lastUpdated: string;
}
