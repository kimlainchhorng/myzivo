/**
 * Region types for multi-city/region operations
 */

export interface Region {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
  currency: string;
  is_active: boolean;
  disabled_at: string | null;
  disabled_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegionSettings {
  id: string;
  region_id: string;
  // Commission
  default_commission_pct: number;
  eats_commission_pct: number;
  move_commission_pct: number;
  // Dispatch
  dispatch_mode: 'auto' | 'broadcast' | 'manual';
  max_dispatch_radius_km: number;
  broadcast_timeout_seconds: number;
  // Surge
  surge_enabled: boolean;
  max_surge_multiplier: number;
  // Payout
  payout_schedule: 'weekly' | 'biweekly' | 'instant';
  minimum_payout_amount: number;
  // Services
  rides_enabled: boolean;
  eats_enabled: boolean;
  move_enabled: boolean;
  // Extra
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RegionBonus {
  id: string;
  region_id: string;
  name: string;
  description: string | null;
  bonus_type: 'trips_completed' | 'earnings_goal' | 'peak_hours' | 'streak';
  target_value: number;
  bonus_amount: number;
  service_type: 'rides' | 'eats' | 'move' | 'all' | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export interface RegionChangeLog {
  id: string;
  entity_type: 'driver' | 'region' | 'settings';
  entity_id: string;
  action: string;
  old_region_id: string | null;
  new_region_id: string | null;
  changed_by: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface RegionWithSettings extends Region {
  region_settings?: RegionSettings | RegionSettings[] | null;
}

export type DispatchMode = 'auto' | 'broadcast' | 'manual';
export type PayoutSchedule = 'weekly' | 'biweekly' | 'instant';
export type BonusType = 'trips_completed' | 'earnings_goal' | 'peak_hours' | 'streak';
export type ServiceType = 'rides' | 'eats' | 'move' | 'all';
