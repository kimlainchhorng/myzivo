
# System Health Dashboard -- Errors and Issues Found

## Issues Discovered

### 1. Missing Database Trigger for Uptime Logging (Critical)

The plan called for a trigger on `service_health_status` to automatically log status changes to `service_uptime_log`. **This trigger was never created.** The database has `set_health_status_updated_at` and `update_service_health_updated_at` triggers (for timestamps), but no trigger that inserts into `service_uptime_log` when status changes.

This means `service_uptime_log` is always empty, so the Uptime tab shows "No status changes recorded yet" permanently.

**Fix:** Create a trigger function `fn_log_service_status_change` and attach it to `service_health_status` on UPDATE when `OLD.status IS DISTINCT FROM NEW.status`.

---

### 2. Missing INSERT RLS Policy on `system_logs` (High)

The `system_logs` table only has a SELECT policy ("Admins can view system logs"). There is no INSERT policy. The `check-system-health` edge function uses the service role key (bypasses RLS), so it works -- but any future client-side or non-service-role inserts will silently fail. The `service_uptime_log` table has the same issue (SELECT only).

**Fix:** Add INSERT policies for service-role operations, or add explicit INSERT policies allowing the trigger function (which runs as definer) to write.

---

### 3. SystemLogsViewer Filter Bug -- "all" Value Sent as Filter (Medium)

In `SystemLogsViewer.tsx`, selecting "All levels" sets `level` to `"all"`, which is then passed to `useSystemLogs({ level: "all" })`. The hook checks `if (filters?.level)` which is truthy for `"all"`, so it adds `.eq("level", "all")` to the query. No logs have level `"all"`, so the result is always empty after selecting "All levels".

Same bug exists for the source filter.

**Fix:** Change the filter values to empty string `""` for "All" options, or handle `"all"` as a special case in the hook.

Looking at the code more carefully: the Select uses `value=""` initially and the "All levels" SelectItem has `value="all"`. When user selects "All levels", it sets level to `"all"`, but the hook only skips the filter when `filters?.level` is falsy. `"all"` is truthy, so it queries for `level = 'all'` which returns nothing.

**Fix:** In `SystemLogsViewer.tsx`, change the `onValueChange` handlers to convert `"all"` back to `""`:
```
onValueChange={(v) => setLevel(v === "all" ? "" : v)}
```

---

### 4. HealthAlertRules Not Persisted (Low)

The `HealthAlertRules` component uses local `useState` only. Toggling alert rules is lost on page refresh. The toggle state is never saved to any database table.

**Fix:** Either persist to a `health_alert_config` table or to `dr_configurations`, and load on mount.

---

### 5. `check-system-health` Edge Function -- Missing Admin Notifications Table Check (Low)

The edge function inserts alerts into `admin_notifications`, but if this table doesn't exist or has different columns, the function fails silently. The function also writes to `system_logs` but only for alerts it generates -- it doesn't validate the table schema.

No functional issue currently, but worth noting for robustness.

---

## Summary of Fixes

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Missing uptime trigger | Critical | Create DB trigger function + attach to `service_health_status` |
| 2 | Missing INSERT RLS on `system_logs` / `service_uptime_log` | High | Add INSERT policies (for trigger/service role) |
| 3 | "All levels" filter sends `"all"` as query value | Medium | Convert `"all"` to `""` in `onValueChange` handlers |
| 4 | Alert rule toggles not persisted | Low | Save to database or note as intentional |
| 5 | Edge function assumes table schemas | Low | Add error handling |

## Implementation Order

1. Create the uptime logging trigger (SQL migration)
2. Add INSERT RLS policies for `system_logs` and `service_uptime_log`
3. Fix the SystemLogsViewer filter bug
4. Optionally persist HealthAlertRules state
