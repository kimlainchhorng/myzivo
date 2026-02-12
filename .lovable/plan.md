
# System Health Monitoring Dashboard

## Overview

Most of the infrastructure already exists. This plan fills the gaps by creating a unified health monitoring page and adding uptime tracking, a log viewer, and automated alerting.

## What Already Exists (No Changes Needed)

- Service health status table and real-time monitoring hooks
- Live metrics panel with active users, rides, orders, deliveries
- Flight system health monitoring (Duffel, Stripe, bookings)
- Performance tracking utilities for API latency
- Global error reporting with attack pattern detection
- Admin alert center for security events

## What Will Be Built

### 1. Unified System Health Page

A new admin page at `/admin/system-health` that consolidates all service statuses into one view with:

- Status cards for each service (API, Database, Payments, Notifications, Duffel, Stripe) showing green/yellow/red indicators
- Uptime percentage calculated from `service_health_status` check history
- Last downtime event timestamp per service
- Average response time per service from `performance_metrics`

### 2. Uptime History Tracking

A new database table `service_uptime_log` to record state changes:

- Columns: `id`, `service_key`, `previous_status`, `new_status`, `changed_at`, `duration_seconds`
- A database trigger on `service_health_status` that logs whenever a service status changes
- The dashboard calculates uptime percentage from this log over the selected time range

### 3. System Logs Viewer

A new component showing recent errors and warnings:

- Reads from `flight_admin_alerts` (existing) and a new generalized `system_logs` table
- Columns: `id`, `level` (error/warning/info), `source` (service name), `message`, `meta` (JSONB), `created_at`
- Filterable by level, source, and date range
- Auto-refreshes every 30 seconds

### 4. Automated Health Alerts

Extend the existing alert infrastructure:

- A new edge function `check-system-health` that runs on a schedule (every 5 minutes via pg_cron or external cron)
- Checks each service in `service_health_status` for non-operational states
- Queries `performance_metrics` for error rate spikes (>20% in last 10 minutes)
- Creates entries in `flight_admin_alerts` (generalized) when thresholds are breached
- Sends admin notifications via the existing notification pipeline

### 5. Admin Navigation Integration

- Add "System Health" link to the admin sidebar/navigation
- Add route `/admin/system-health` to the router

## Technical Details

### New Files

1. **`src/pages/admin/SystemHealthDashboard.tsx`** -- Main page with tabs: Overview, Uptime, Logs, Alerts
2. **`src/components/admin/health/ServiceStatusGrid.tsx`** -- Grid of service status cards with colored indicators
3. **`src/components/admin/health/UptimeChart.tsx`** -- Recharts area chart showing uptime over time
4. **`src/components/admin/health/SystemLogsViewer.tsx`** -- Filterable table of recent errors/warnings
5. **`src/components/admin/health/HealthAlertRules.tsx`** -- Configuration for alert thresholds
6. **`src/hooks/useSystemHealthDashboard.ts`** -- Hook combining service status, uptime, and metrics queries
7. **`supabase/functions/check-system-health/index.ts`** -- Scheduled edge function for automated health checks

### Database Changes

1. **`service_uptime_log`** table to track status transitions with duration
2. **`system_logs`** table for generalized error/warning logging
3. Trigger on `service_health_status` to auto-log changes to `service_uptime_log`

### Design

- Verdant green theme consistent with existing admin pages
- Status indicators: green (operational), yellow (degraded), red (down)
- Cards with large numbers for key metrics (uptime %, response time, active counts)
- Recharts for uptime and response time trend charts
- Framer Motion animations matching existing dashboard style
- Skeleton loading states during data fetch

### Implementation Order

1. Create database tables and trigger
2. Build the hooks for data fetching
3. Build UI components (status grid, uptime chart, logs viewer)
4. Create the main dashboard page and add routing
5. Build the `check-system-health` edge function
6. Wire alerts into existing notification pipeline
