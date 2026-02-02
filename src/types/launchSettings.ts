/**
 * Launch Settings Types
 * Types for the Public Launch System (Beta → Live)
 */

import type { Database } from "@/integrations/supabase/types";

// Global launch mode enum
export type GlobalLaunchMode = 'beta' | 'live';

// Launch settings from database
export interface LaunchSettings {
  id: string;
  global_mode: GlobalLaunchMode;
  emergency_pause: boolean;
  emergency_pause_reason: string | null;
  emergency_pause_at: string | null;
  emergency_pause_by: string | null;
  daily_booking_limit_per_city: number;
  enforce_supply_minimum: boolean;
  min_owners_for_launch: number;
  min_vehicles_for_launch: number;
  announcement_enabled: boolean;
  announcement_text: string | null;
  announcement_cities: string[] | null;
  mode_changed_at: string | null;
  mode_changed_by: string | null;
  created_at: string;
  updated_at: string;
}

// Update payload for launch mode
export interface UpdateLaunchModePayload {
  global_mode: GlobalLaunchMode;
  mode_changed_at: string;
  mode_changed_by: string;
}

// Update payload for emergency pause
export interface EmergencyPausePayload {
  emergency_pause: boolean;
  emergency_pause_reason?: string;
  emergency_pause_at?: string;
  emergency_pause_by?: string;
}

// Update payload for announcement settings
export interface AnnouncementSettingsPayload {
  announcement_enabled: boolean;
  announcement_text?: string;
  announcement_cities?: string[];
}

// Update payload for booking limits
export interface BookingLimitsPayload {
  daily_booking_limit_per_city: number;
  enforce_supply_minimum: boolean;
  min_owners_for_launch: number;
  min_vehicles_for_launch: number;
}

// City supply stats for launch readiness
export interface CityLaunchReadiness {
  cityId: string;
  cityName: string;
  state: string;
  status: string;
  approvedOwners: number;
  approvedVehicles: number;
  minOwners: number;
  minVehicles: number;
  ownersMet: boolean;
  vehiclesMet: boolean;
  isReady: boolean;
  dailyBookingLimit: number;
  bookingsToday: number;
}

// Overall launch readiness check result
export interface LaunchReadinessCheck {
  betaChecklistComplete: boolean;
  liveCitiesCount: number;
  citiesReady: CityLaunchReadiness[];
  allCitiesMeetMinimums: boolean;
  canGoLive: boolean;
  blockers: string[];
}

// Post-launch monitoring stats
export interface PostLaunchStats {
  bookingsToday: number;
  bookingsYesterday: number;
  failedPayments24h: number;
  openDisputes: number;
  pendingOwnerVerifications: number;
  pendingRenterVerifications: number;
  activeCarsByCity: Record<string, number>;
  newOwnersToday: number;
  newRentersToday: number;
}
