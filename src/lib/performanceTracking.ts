/**
 * Performance Tracking Utility
 * Tracks API latency, error rates, and service health
 */

import { supabase } from '@/integrations/supabase/client';

export type MetricType = 'api_latency' | 'search_time' | 'checkout_time' | 'error_rate';
export type ServiceName = 'hotelbeds' | 'stripe' | 'duffel' | 'resend' | 'internal';

interface PerformanceMetric {
  metric_type: MetricType;
  service: ServiceName;
  value_ms: number;
  success: boolean;
  error_code?: string;
  meta?: Record<string, unknown>;
}

/**
 * Track a performance metric
 */
export async function trackPerformance(metric: PerformanceMetric): Promise<void> {
  try {
    await supabase
      .from('performance_metrics')
      .insert({
        metric_type: metric.metric_type,
        service: metric.service,
        value_ms: metric.value_ms,
        success: metric.success,
        error_code: metric.error_code,
        meta: metric.meta || {},
      } as any);
  } catch (error) {
    console.error('[Performance] Failed to track metric:', error);
  }
}

/**
 * Measure and track API call duration
 */
export async function measureApiCall<T>(
  service: ServiceName,
  operation: () => Promise<T>,
  metricType: MetricType = 'api_latency'
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    // Fire and forget
    trackPerformance({
      metric_type: metricType,
      service,
      value_ms: Math.round(duration),
      success: true,
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    // Track failure
    trackPerformance({
      metric_type: metricType,
      service,
      value_ms: Math.round(duration),
      success: false,
      error_code: error instanceof Error ? error.name : 'unknown',
      meta: { error_message: error instanceof Error ? error.message : String(error) },
    });
    
    throw error;
  }
}

/**
 * Create a performance tracker for a specific service
 */
export function createServiceTracker(service: ServiceName) {
  return {
    measure: <T>(operation: () => Promise<T>, metricType: MetricType = 'api_latency') =>
      measureApiCall(service, operation, metricType),
    
    trackSuccess: (durationMs: number, meta?: Record<string, unknown>) =>
      trackPerformance({
        metric_type: 'api_latency',
        service,
        value_ms: durationMs,
        success: true,
        meta,
      }),
    
    trackFailure: (durationMs: number, errorCode: string, meta?: Record<string, unknown>) =>
      trackPerformance({
        metric_type: 'api_latency',
        service,
        value_ms: durationMs,
        success: false,
        error_code: errorCode,
        meta,
      }),
  };
}

// Pre-configured trackers for common services
export const hotelbedsTracker = createServiceTracker('hotelbeds');
export const stripeTracker = createServiceTracker('stripe');
export const duffelTracker = createServiceTracker('duffel');
export const resendTracker = createServiceTracker('resend');
