

# Automated Backups and Recovery Readiness Implementation

## Overview
Implement a comprehensive automated backup system with scheduled daily database backups, storage bucket backups, backup logging, a recovery guide, and failure alerting. This builds on the existing disaster recovery infrastructure (`backup_logs`, `dr_configuration`, `RecoveryDashboard`).

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `backup_logs` table | Complete | Has backup_type, backup_target, status, storage_location, size_bytes, error_message, retention_days |
| `backup_runs` table | Complete | Simpler table with id, backup_type, status, file_url, created_at |
| `dr_configuration` table | Complete | Key-value config (RTO, RPO settings) |
| `service_health_status` table | Complete | Service health monitoring |
| `recovery_tests` table | Complete | DR test tracking |
| `restore_operations` table | Complete | Restore request/approval workflow |
| `RecoveryDashboard` page | Complete | Full admin UI at `/admin/recovery` |
| `useDisasterRecovery` hooks | Complete | All CRUD hooks for backup/restore |
| `useTriggerBackup` hook | Complete | Manual backup trigger |
| 5 existing cron jobs | Active | Cleanup jobs (location history, sessions, tokens) |
| `send-notification` edge function | Complete | Push/SMS/Email notifications |
| Supabase Storage buckets | Complete | 13 buckets including kyc-documents, menu-photos, receipts |
| pg_cron + pg_net extensions | Enabled | Ready for scheduled HTTP calls |

### Missing
| Feature | Status |
|---------|--------|
| Automated daily backup edge function | Need to create |
| Cron job to trigger daily backup | Need to add |
| Storage backup edge function | Need to create |
| Enhanced backup logging with file URLs | Need to update |
| Admin `/admin/backups` page (simplified view) | Need to create |
| Admin `/admin/system/recovery` guide page | Need to create |
| Backup failure alerting | Need to add |
| Downloadable backup links | Need to implement |

---

## Implementation Plan

### 1) Database Backup Edge Function

**File to Create:** `supabase/functions/run-database-backup/index.ts`

**Purpose:** Export critical tables to JSON and store in Supabase Storage or external S3.

**Tables to Backup:**
- `orders` / `customer_orders` (order data)
- `driver_payouts` (payout records)
- `profiles` (user data)
- `support_tickets` (customer service)
- `loyalty_points` (loyalty program)
- `marketing_campaigns` (campaign data)
- `restaurants` (merchant data)
- `drivers` (driver profiles)

**Logic:**
```typescript
serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  
  // 1. Create backup_logs entry (status: in_progress)
  const { data: backupLog } = await supabase
    .from("backup_logs")
    .insert({
      backup_type: "full",
      backup_target: "database",
      status: "in_progress",
      started_at: new Date().toISOString(),
      retention_days: 30,
    })
    .select()
    .single();

  try {
    // 2. Export each table to JSON
    const tablesToBackup = [
      "customer_orders",
      "driver_payouts", 
      "profiles",
      "support_tickets",
      "loyalty_points",
      "marketing_campaigns",
      "restaurants",
      "drivers"
    ];
    
    const backupData: Record<string, any> = {};
    let totalRows = 0;
    
    for (const table of tablesToBackup) {
      const { data, count } = await supabase
        .from(table)
        .select("*", { count: "exact" })
        .limit(100000); // Paginate for large tables
      
      backupData[table] = data;
      totalRows += count || 0;
    }
    
    // 3. Store backup file
    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `db-backup-${dateStr}-${backupLog.id}.json`;
    const filePath = `backups/database/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from("system-backups")
      .upload(filePath, JSON.stringify(backupData), {
        contentType: "application/json",
      });
    
    if (uploadError) throw uploadError;
    
    // 4. Update backup_logs with success
    await supabase
      .from("backup_logs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        storage_location: filePath,
        size_bytes: JSON.stringify(backupData).length,
        metadata: { tables: tablesToBackup, total_rows: totalRows },
      })
      .eq("id", backupLog.id);
    
    // 5. Also update backup_runs for simple view
    await supabase.from("backup_runs").insert({
      backup_type: "db",
      status: "success",
      file_url: filePath,
    });
    
    return new Response(JSON.stringify({ success: true, backup_id: backupLog.id }));
    
  } catch (error) {
    // 6. Update backup_logs with failure
    await supabase
      .from("backup_logs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: error.message,
      })
      .eq("id", backupLog.id);
    
    await supabase.from("backup_runs").insert({
      backup_type: "db",
      status: "failed",
    });
    
    // 7. Send alert notification
    await supabase.functions.invoke("send-notification", {
      body: {
        type: "admin_alert",
        title: "⚠️ Database Backup Failed",
        body: `Daily backup failed: ${error.message}`,
        priority: "critical",
        event_type: "backup_failed",
      },
    });
    
    // 8. Insert admin alert
    await supabase.from("alerts").insert({
      type: "system",
      severity: "critical",
      title: "Database Backup Failed",
      message: error.message,
      created_at: new Date().toISOString(),
    });
    
    throw error;
  }
});
```

### 2) Storage Backup Edge Function

**File to Create:** `supabase/functions/run-storage-backup/index.ts`

**Purpose:** List and catalog files in critical buckets, optionally copy to backup bucket.

**Buckets to Backup:**
- `kyc-documents` (KYC files - most critical)
- `menu-photos` (restaurant images)
- `delivery-proofs` (order receipts/proofs)

**Logic:**
```typescript
serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  
  const bucketsToBackup = [
    "kyc-documents",
    "menu-photos", 
    "delivery-proofs"
  ];
  
  const { data: backupLog } = await supabase
    .from("backup_logs")
    .insert({
      backup_type: "files",
      backup_target: "storage",
      status: "in_progress",
      started_at: new Date().toISOString(),
      retention_days: 90,
    })
    .select()
    .single();

  try {
    const manifest: Record<string, any> = {};
    let totalFiles = 0;
    let totalSize = 0;
    
    for (const bucket of bucketsToBackup) {
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list("", { limit: 10000 });
      
      if (error) throw error;
      
      manifest[bucket] = {
        file_count: files.length,
        files: files.map(f => ({
          name: f.name,
          size: f.metadata?.size || 0,
          created_at: f.created_at,
        })),
      };
      
      totalFiles += files.length;
      totalSize += files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
    }
    
    // Store manifest
    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `storage-manifest-${dateStr}.json`;
    const filePath = `backups/storage/${fileName}`;
    
    await supabase.storage
      .from("system-backups")
      .upload(filePath, JSON.stringify(manifest), {
        contentType: "application/json",
      });
    
    await supabase
      .from("backup_logs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        storage_location: filePath,
        size_bytes: totalSize,
        metadata: { 
          buckets: bucketsToBackup, 
          total_files: totalFiles,
          manifest_type: "storage_catalog"
        },
      })
      .eq("id", backupLog.id);
    
    await supabase.from("backup_runs").insert({
      backup_type: "storage",
      status: "success",
      file_url: filePath,
    });
    
    return new Response(JSON.stringify({ success: true }));
    
  } catch (error) {
    // Handle failure same as database backup
    await supabase
      .from("backup_logs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: error.message,
      })
      .eq("id", backupLog.id);
    
    await supabase.from("backup_runs").insert({
      backup_type: "storage",
      status: "failed",
    });
    
    // Alert admin
    await supabase.functions.invoke("send-notification", {
      body: {
        type: "admin_alert",
        title: "⚠️ Storage Backup Failed",
        body: `Storage backup failed: ${error.message}`,
        priority: "critical",
      },
    });
    
    throw error;
  }
});
```

### 3) Create System Backups Storage Bucket

**Migration:**
```sql
-- Create system-backups bucket for storing backup files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('system-backups', 'system-backups', false, 1073741824) -- 1GB limit
ON CONFLICT (id) DO NOTHING;

-- RLS: Only service role and admins can access
CREATE POLICY "Admins can read system backups"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'system-backups' 
  AND public.has_role(auth.uid(), 'admin')
);
```

### 4) Scheduled Cron Jobs

**Database Backup - Daily at 02:00 UTC:**
```sql
SELECT cron.schedule(
  'daily-database-backup',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/run-database-backup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

**Storage Backup - Daily at 03:00 UTC:**
```sql
SELECT cron.schedule(
  'daily-storage-backup',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/run-storage-backup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

### 5) Admin Backups Page (Simplified View)

**File to Create:** `src/pages/admin/BackupsPage.tsx`

**Route:** `/admin/backups`

**Features:**
- Summary stats (last backup time, status, total backups)
- List of recent backup_runs with status and download link
- Manual trigger buttons for database and storage backups
- Filter by backup_type (db/storage)

**UI Layout:**
```text
+----------------------------------------------------------+
|  System Backups                    [Backup Now ▼]         |
+----------------------------------------------------------+
|                                                           |
|  +------------------+  +------------------+               |
|  | LAST DB BACKUP   |  | LAST STORAGE     |               |
|  | 2h ago ✓         |  | 26h ago ✓        |               |
|  +------------------+  +------------------+               |
|                                                           |
|  +------------------+  +------------------+               |
|  | TOTAL BACKUPS    |  | FAILED (7 DAYS)  |               |
|  | 127              |  | 0                |               |
|  +------------------+  +------------------+               |
|                                                           |
|  Recent Backups                                           |
|  +------------------------------------------------------+|
|  | Type   | Status    | Time        | Size   | Actions  ||
|  +------------------------------------------------------+|
|  | DB     | ✓ Success | 2h ago      | 45 MB  | Download ||
|  | Storage| ✓ Success | 26h ago     | 1.2 GB | Download ||
|  | DB     | ✓ Success | 1 day ago   | 44 MB  | Download ||
|  +------------------------------------------------------+|
|                                                           |
+----------------------------------------------------------+
```

**Hook to Create:** `src/hooks/useBackups.ts`
```typescript
export function useBackupRuns(limit = 50)
export function useTriggerDatabaseBackup()
export function useTriggerStorageBackup()
export function useDownloadBackup(backupId: string)
```

### 6) Recovery Guide Page

**File to Create:** `src/pages/admin/RecoveryGuidePage.tsx`

**Route:** `/admin/system/recovery`

**Content:**
- Step-by-step database restore instructions
- Step-by-step storage restore instructions
- Emergency contact information
- Service restart procedures
- RTO/RPO targets display
- Links to Supabase dashboard

**Sections:**
1. **Quick Reference**
   - RTO Target: 4 hours
   - RPO Target: 1 hour
   - Emergency contacts

2. **Database Restore**
   - Download latest backup from /admin/backups
   - Use Supabase SQL Editor or psql to restore
   - Verify row counts post-restore
   - Run data integrity checks

3. **Storage Restore**
   - Access system-backups bucket
   - Download file manifest
   - Re-upload files to original buckets
   - Verify file access

4. **Service Restart**
   - Pause affected services via /admin/recovery
   - Clear caches if needed
   - Resume services
   - Monitor for errors

5. **Escalation Path**
   - Level 1: On-call admin
   - Level 2: Engineering lead
   - Level 3: External Supabase support

### 7) Backup Failure Alerting

**Integrate with existing `send-notification`:**

When backup fails:
1. Insert row into `alerts` table (existing)
2. Insert row into `tenant_admin_alerts` table (if exists)
3. Call `send-notification` with `priority: "critical"`
4. Send email to admin distribution list via Resend

**File to Modify:** `supabase/functions/send-notification/index.ts`

Add handling for `event_type: "backup_failed"`:
```typescript
if (eventType === "backup_failed") {
  // Always send email for backup failures
  await sendEmail({
    to: ADMIN_EMAIL_LIST,
    subject: `[CRITICAL] ZIVO Backup Failed - ${title}`,
    body: body,
  });
}
```

### 8) Update Routes

**File to Modify:** `src/App.tsx`

```typescript
// Add lazy imports
const BackupsPage = lazy(() => import("./pages/admin/BackupsPage"));
const RecoveryGuidePage = lazy(() => import("./pages/admin/RecoveryGuidePage"));

// Add routes
<Route path="/admin/backups" element={
  <ProtectedRoute requireAdmin><BackupsPage /></ProtectedRoute>
} />
<Route path="/admin/system/recovery" element={
  <ProtectedRoute requireAdmin><RecoveryGuidePage /></ProtectedRoute>
} />
```

---

## Database Changes

### Migration Summary
| Change | Purpose |
|--------|---------|
| Create `system-backups` storage bucket | Store backup files |
| Add RLS policies | Admin access to backups |
| Schedule `daily-database-backup` cron | Automated daily DB backup |
| Schedule `daily-storage-backup` cron | Automated daily storage backup |

---

## File Summary

### New Edge Functions (2)
| File | Purpose |
|------|---------|
| `supabase/functions/run-database-backup/index.ts` | Export tables to JSON backup |
| `supabase/functions/run-storage-backup/index.ts` | Catalog storage buckets |

### New Pages (2)
| File | Purpose |
|------|---------|
| `src/pages/admin/BackupsPage.tsx` | Simplified backup management UI |
| `src/pages/admin/RecoveryGuidePage.tsx` | DR procedures documentation |

### New Hooks (1)
| File | Purpose |
|------|---------|
| `src/hooks/useBackups.ts` | Backup-specific hooks |

### Modified Files (3)
| File | Changes |
|------|---------|
| `supabase/functions/send-notification/index.ts` | Add backup failure email |
| `supabase/config.toml` | Register new edge functions |
| `src/App.tsx` | Add routes for new pages |

---

## Backup Schedule

| Backup Type | Schedule | Retention | Target |
|-------------|----------|-----------|--------|
| Database (full) | Daily 02:00 UTC | 30 days | 8 critical tables |
| Storage catalog | Daily 03:00 UTC | 90 days | 3 buckets |

---

## Data Flow

```text
Cron Job (02:00 UTC)
        ↓
net.http_post → run-database-backup
        ↓
Create backup_logs entry (in_progress)
        ↓
Export tables to JSON:
├── customer_orders
├── driver_payouts
├── profiles
├── support_tickets
├── loyalty_points
├── marketing_campaigns
├── restaurants
└── drivers
        ↓
Upload to system-backups bucket
        ↓
Update backup_logs (completed)
        ↓
Insert backup_runs row
        ↓
If failed:
├── Update backup_logs (failed)
├── Insert alert
├── Send admin notification (push + email)
└── Log error

---

Admin Views Backups
        ↓
/admin/backups page
        ↓
View list from backup_runs
        ↓
Click Download → Get signed URL → Download JSON
```

---

## Security Controls

### 1. Service Role Only
Edge functions use service_role_key for full database access.

### 2. Admin Access
Only admins can view/download backups via RLS.

### 3. Private Bucket
`system-backups` bucket is not public.

### 4. Signed URLs
Download links are time-limited signed URLs (1 hour).

### 5. Encryption
Supabase storage encrypts data at rest.

---

## Alerting Matrix

| Event | Alert Type | Channels |
|-------|------------|----------|
| Backup started | Info | Log only |
| Backup completed | Success | Log only |
| Backup failed | Critical | Push + Email + Alert table |
| Backup delayed (>24h) | Warning | Push + Email |

---

## Summary

This implementation provides:

1. **Automated Daily Backups** - Database at 02:00 UTC, storage at 03:00 UTC
2. **Critical Table Coverage** - 8 essential tables exported to JSON
3. **Storage Cataloging** - File manifests for 3 critical buckets
4. **Backup Logging** - Complete audit trail in backup_logs and backup_runs
5. **Admin UI** - Simple /admin/backups page with download links
6. **Recovery Guide** - Documented procedures at /admin/system/recovery
7. **Failure Alerting** - Immediate push + email on backup failure
8. **30-Day Retention** - Automatic expiry tracking

Builds on existing disaster recovery infrastructure with minimal new tables.

