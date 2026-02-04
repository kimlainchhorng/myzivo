/**
 * ZIVO POST-LAUNCH MONITORING CONFIGURATION
 * 
 * Thresholds, alerts, and monitoring rules for the first 72 hours
 * 
 * Last Updated: February 4, 2026
 */

// ============================================
// MONITORING THRESHOLDS
// ============================================

export interface MonitoringThreshold {
  id: string;
  metric: string;
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
  direction: 'above' | 'below';
  description: string;
}

export const MONITORING_THRESHOLDS: MonitoringThreshold[] = [
  // Payment metrics
  {
    id: 'payment_success_rate',
    metric: 'Payment Success Rate',
    warningThreshold: 95,
    criticalThreshold: 90,
    unit: '%',
    direction: 'below',
    description: 'Percentage of successful payment captures',
  },
  {
    id: 'payment_decline_rate',
    metric: 'Payment Decline Rate',
    warningThreshold: 5,
    criticalThreshold: 10,
    unit: '%',
    direction: 'above',
    description: 'Percentage of declined payments',
  },
  
  // Ticketing metrics
  {
    id: 'ticketing_success_rate',
    metric: 'Ticketing Success Rate',
    warningThreshold: 98,
    criticalThreshold: 95,
    unit: '%',
    direction: 'below',
    description: 'Percentage of successful ticket issuances',
  },
  {
    id: 'ticketing_error_rate',
    metric: 'Ticketing Error Rate',
    warningThreshold: 2,
    criticalThreshold: 5,
    unit: '%',
    direction: 'above',
    description: 'Percentage of ticketing failures',
  },
  
  // Fraud metrics
  {
    id: 'fraud_rate',
    metric: 'Fraud Alert Rate',
    warningThreshold: 1,
    criticalThreshold: 3,
    unit: '%',
    direction: 'above',
    description: 'Percentage of bookings flagged as fraudulent',
  },
  {
    id: 'chargeback_rate',
    metric: 'Chargeback Rate',
    warningThreshold: 0.5,
    criticalThreshold: 1,
    unit: '%',
    direction: 'above',
    description: 'Percentage of transactions disputed',
  },
  
  // Support metrics
  {
    id: 'support_ticket_volume',
    metric: 'Support Ticket Volume',
    warningThreshold: 50,
    criticalThreshold: 100,
    unit: 'tickets/day',
    direction: 'above',
    description: 'Daily support ticket count',
  },
  {
    id: 'avg_response_time',
    metric: 'Avg Response Time',
    warningThreshold: 4,
    criticalThreshold: 8,
    unit: 'hours',
    direction: 'above',
    description: 'Average support response time',
  },
  
  // System metrics
  {
    id: 'api_error_rate',
    metric: 'API Error Rate',
    warningThreshold: 1,
    criticalThreshold: 5,
    unit: '%',
    direction: 'above',
    description: 'Percentage of API calls returning errors',
  },
  {
    id: 'search_latency',
    metric: 'Search Latency (p95)',
    warningThreshold: 5000,
    criticalThreshold: 10000,
    unit: 'ms',
    direction: 'above',
    description: '95th percentile search response time',
  },
];

// ============================================
// PAUSE SALES TRIGGERS
// ============================================

export interface PauseSalesTrigger {
  id: string;
  condition: string;
  severity: 'critical' | 'warning';
  action: string;
  autoResume: boolean;
}

export const PAUSE_SALES_TRIGGERS: PauseSalesTrigger[] = [
  {
    id: 'ticketing_errors_spike',
    condition: 'Ticketing error rate > 5%',
    severity: 'critical',
    action: 'Pause all flight bookings',
    autoResume: false,
  },
  {
    id: 'payment_failures_spike',
    condition: 'Payment failure rate > 15%',
    severity: 'critical',
    action: 'Pause checkout, investigate payment processor',
    autoResume: false,
  },
  {
    id: 'fraud_rate_spike',
    condition: 'Fraud rate > 5%',
    severity: 'critical',
    action: 'Enable manual review for all bookings',
    autoResume: false,
  },
  {
    id: 'supplier_api_down',
    condition: 'Supplier API returning 5xx for > 5 minutes',
    severity: 'critical',
    action: 'Hide affected supplier results',
    autoResume: true,
  },
  {
    id: 'chargeback_spike',
    condition: 'Chargeback rate > 1.5% in 24h',
    severity: 'critical',
    action: 'Pause new bookings, review recent transactions',
    autoResume: false,
  },
];

// ============================================
// ALERT CHANNELS
// ============================================

export interface AlertChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'pagerduty' | 'sms';
  recipients: string[];
  severities: ('info' | 'warning' | 'critical')[];
}

export const ALERT_CHANNELS: AlertChannel[] = [
  {
    id: 'ops_email',
    name: 'Operations Email',
    type: 'email',
    recipients: ['ops@hizovo.com'],
    severities: ['warning', 'critical'],
  },
  {
    id: 'critical_sms',
    name: 'Critical SMS',
    type: 'sms',
    recipients: ['+1XXXXXXXXXX'],
    severities: ['critical'],
  },
];

// ============================================
// FIRST 72 HOURS MONITORING SCHEDULE
// ============================================

export interface MonitoringScheduleItem {
  hour: number;
  tasks: string[];
  priority: 'high' | 'medium' | 'low';
}

export const FIRST_72_HOURS_SCHEDULE: MonitoringScheduleItem[] = [
  {
    hour: 1,
    tasks: [
      'Verify first live booking completed',
      'Check ticket issuance succeeded',
      'Confirm confirmation email sent',
    ],
    priority: 'high',
  },
  {
    hour: 4,
    tasks: [
      'Review payment success rate',
      'Check for any fraud alerts',
      'Monitor API error rates',
    ],
    priority: 'high',
  },
  {
    hour: 12,
    tasks: [
      'Full metrics review',
      'Check support ticket volume',
      'Review any manual review queue items',
    ],
    priority: 'high',
  },
  {
    hour: 24,
    tasks: [
      'First day summary report',
      'Chargeback alert check',
      'Conversion rate analysis',
      'Review customer feedback',
    ],
    priority: 'high',
  },
  {
    hour: 48,
    tasks: [
      'Two-day trend analysis',
      'Compare metrics to baseline',
      'Review any escalated issues',
    ],
    priority: 'medium',
  },
  {
    hour: 72,
    tasks: [
      'First 72-hour report',
      'Go/no-go for continued operations',
      'Identify optimization opportunities',
    ],
    priority: 'high',
  },
];

// ============================================
// DASHBOARD METRICS
// ============================================

export interface DashboardMetric {
  id: string;
  name: string;
  category: 'revenue' | 'operations' | 'fraud' | 'support' | 'system';
  format: 'number' | 'currency' | 'percent' | 'duration';
  refreshIntervalMs: number;
}

export const DASHBOARD_METRICS: DashboardMetric[] = [
  // Revenue
  { id: 'bookings_today', name: 'Bookings Today', category: 'revenue', format: 'number', refreshIntervalMs: 60000 },
  { id: 'revenue_today', name: 'Revenue Today', category: 'revenue', format: 'currency', refreshIntervalMs: 60000 },
  { id: 'avg_booking_value', name: 'Avg Booking Value', category: 'revenue', format: 'currency', refreshIntervalMs: 300000 },
  
  // Operations
  { id: 'tickets_issued', name: 'Tickets Issued', category: 'operations', format: 'number', refreshIntervalMs: 60000 },
  { id: 'pending_ticketing', name: 'Pending Ticketing', category: 'operations', format: 'number', refreshIntervalMs: 30000 },
  { id: 'failed_ticketing', name: 'Failed Ticketing', category: 'operations', format: 'number', refreshIntervalMs: 30000 },
  
  // Fraud
  { id: 'fraud_flags_today', name: 'Fraud Flags Today', category: 'fraud', format: 'number', refreshIntervalMs: 60000 },
  { id: 'manual_review_queue', name: 'Manual Review Queue', category: 'fraud', format: 'number', refreshIntervalMs: 30000 },
  { id: 'declined_bookings', name: 'Declined Bookings', category: 'fraud', format: 'number', refreshIntervalMs: 60000 },
  
  // Support
  { id: 'open_tickets', name: 'Open Tickets', category: 'support', format: 'number', refreshIntervalMs: 60000 },
  { id: 'urgent_tickets', name: 'Urgent Tickets', category: 'support', format: 'number', refreshIntervalMs: 30000 },
  
  // System
  { id: 'api_latency_p95', name: 'API Latency (p95)', category: 'system', format: 'duration', refreshIntervalMs: 60000 },
  { id: 'error_rate', name: 'Error Rate', category: 'system', format: 'percent', refreshIntervalMs: 60000 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a metric value breaches thresholds
 */
export function checkThreshold(
  metricId: string,
  value: number
): { status: 'ok' | 'warning' | 'critical'; message?: string } {
  const threshold = MONITORING_THRESHOLDS.find(t => t.id === metricId);
  if (!threshold) return { status: 'ok' };

  const isAbove = threshold.direction === 'above';
  
  if (isAbove) {
    if (value >= threshold.criticalThreshold) {
      return { status: 'critical', message: `${threshold.metric} is ${value}${threshold.unit} (critical: >${threshold.criticalThreshold})` };
    }
    if (value >= threshold.warningThreshold) {
      return { status: 'warning', message: `${threshold.metric} is ${value}${threshold.unit} (warning: >${threshold.warningThreshold})` };
    }
  } else {
    if (value <= threshold.criticalThreshold) {
      return { status: 'critical', message: `${threshold.metric} is ${value}${threshold.unit} (critical: <${threshold.criticalThreshold})` };
    }
    if (value <= threshold.warningThreshold) {
      return { status: 'warning', message: `${threshold.metric} is ${value}${threshold.unit} (warning: <${threshold.warningThreshold})` };
    }
  }

  return { status: 'ok' };
}

/**
 * Get active pause triggers based on current metrics
 */
export function getActivePauseTriggers(metrics: Record<string, number>): PauseSalesTrigger[] {
  const active: PauseSalesTrigger[] = [];
  
  // Check ticketing errors
  if (metrics.ticketing_error_rate && metrics.ticketing_error_rate > 5) {
    active.push(PAUSE_SALES_TRIGGERS.find(t => t.id === 'ticketing_errors_spike')!);
  }
  
  // Check payment failures
  if (metrics.payment_decline_rate && metrics.payment_decline_rate > 15) {
    active.push(PAUSE_SALES_TRIGGERS.find(t => t.id === 'payment_failures_spike')!);
  }
  
  // Check fraud rate
  if (metrics.fraud_rate && metrics.fraud_rate > 5) {
    active.push(PAUSE_SALES_TRIGGERS.find(t => t.id === 'fraud_rate_spike')!);
  }
  
  // Check chargeback rate
  if (metrics.chargeback_rate && metrics.chargeback_rate > 1.5) {
    active.push(PAUSE_SALES_TRIGGERS.find(t => t.id === 'chargeback_spike')!);
  }
  
  return active.filter(Boolean);
}

/**
 * Get current monitoring phase based on hours since launch
 */
export function getCurrentMonitoringPhase(hoursSinceLaunch: number): {
  phase: string;
  nextCheckHour: number;
  tasks: string[];
} {
  const scheduleItem = [...FIRST_72_HOURS_SCHEDULE]
    .reverse()
    .find(item => hoursSinceLaunch >= item.hour);
  
  const nextItem = FIRST_72_HOURS_SCHEDULE.find(item => item.hour > hoursSinceLaunch);
  
  if (!scheduleItem) {
    return {
      phase: 'Pre-launch',
      nextCheckHour: 1,
      tasks: ['Complete pre-launch checks', 'Verify all systems ready'],
    };
  }
  
  if (hoursSinceLaunch > 72) {
    return {
      phase: 'Steady State',
      nextCheckHour: hoursSinceLaunch + 24,
      tasks: ['Daily metrics review', 'Weekly trend analysis'],
    };
  }
  
  return {
    phase: `Hour ${scheduleItem.hour} Check`,
    nextCheckHour: nextItem?.hour || 72,
    tasks: scheduleItem.tasks,
  };
}
