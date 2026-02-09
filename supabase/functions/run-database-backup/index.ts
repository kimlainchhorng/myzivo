/**
 * Run Database Backup Edge Function
 * Exports critical tables to JSON and stores in Supabase Storage
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Tables to backup - critical business data
const TABLES_TO_BACKUP = [
  "food_orders",
  "driver_payouts",
  "profiles",
  "support_tickets",
  "loyalty_points",
  "marketing_campaigns",
  "restaurants",
  "drivers",
  "ride_requests",
  "travel_orders",
];

const RETENTION_DAYS = 30;
const BATCH_SIZE = 10000;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Create backup log entry
  const { data: backupLog, error: logError } = await supabase
    .from("backup_logs")
    .insert({
      backup_type: "full",
      backup_target: "database",
      status: "in_progress",
      started_at: new Date().toISOString(),
      retention_days: RETENTION_DAYS,
      metadata: { tables: TABLES_TO_BACKUP, trigger: "scheduled" },
    })
    .select()
    .single();

  if (logError || !backupLog) {
    console.error("Failed to create backup log:", logError);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to create backup log" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const backupData: Record<string, unknown[]> = {};
    let totalRows = 0;
    const tableStats: Record<string, number> = {};

    // Export each table
    for (const table of TABLES_TO_BACKUP) {
      try {
        const { data, count, error } = await supabase
          .from(table)
          .select("*", { count: "exact" })
          .limit(BATCH_SIZE);

        if (error) {
          console.warn(`Error fetching ${table}:`, error.message);
          backupData[table] = [];
          tableStats[table] = 0;
          continue;
        }

        backupData[table] = data || [];
        const rowCount = count || (data?.length || 0);
        tableStats[table] = rowCount;
        totalRows += rowCount;

        console.log(`Backed up ${table}: ${rowCount} rows`);
      } catch (err) {
        console.warn(`Failed to backup ${table}:`, err);
        backupData[table] = [];
        tableStats[table] = 0;
      }
    }

    // Generate backup file
    const dateStr = new Date().toISOString().split("T")[0];
    const timestamp = Date.now();
    const fileName = `db-backup-${dateStr}-${timestamp}.json`;
    const filePath = `backups/database/${fileName}`;

    const backupJson = JSON.stringify({
      version: "1.0",
      created_at: new Date().toISOString(),
      backup_id: backupLog.id,
      tables: TABLES_TO_BACKUP,
      table_stats: tableStats,
      total_rows: totalRows,
      data: backupData,
    });

    const sizeBytes = new TextEncoder().encode(backupJson).length;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("system-backups")
      .upload(filePath, backupJson, {
        contentType: "application/json",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RETENTION_DAYS);

    // Update backup log with success
    await supabase
      .from("backup_logs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        storage_location: filePath,
        size_bytes: sizeBytes,
        expires_at: expiresAt.toISOString(),
        metadata: {
          tables: TABLES_TO_BACKUP,
          table_stats: tableStats,
          total_rows: totalRows,
          file_name: fileName,
        },
      })
      .eq("id", backupLog.id);

    // Also insert into backup_runs for simple view
    await supabase.from("backup_runs").insert({
      backup_type: "db",
      status: "success",
      file_url: filePath,
    });

    console.log(`Database backup completed: ${filePath} (${sizeBytes} bytes, ${totalRows} rows)`);

    return new Response(
      JSON.stringify({
        success: true,
        backup_id: backupLog.id,
        file_path: filePath,
        size_bytes: sizeBytes,
        total_rows: totalRows,
        tables_backed_up: TABLES_TO_BACKUP.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Database backup failed:", errorMessage);

    // Update backup log with failure
    await supabase
      .from("backup_logs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq("id", backupLog.id);

    // Insert failed backup run
    await supabase.from("backup_runs").insert({
      backup_type: "db",
      status: "failed",
    });

    // Send failure notification
    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          title: "⚠️ Database Backup Failed",
          body: `Daily database backup failed: ${errorMessage}`,
          priority: "critical",
          event_type: "backup_failed",
        },
      });
    } catch (notifyErr) {
      console.error("Failed to send backup failure notification:", notifyErr);
    }

    return new Response(
      JSON.stringify({ success: false, error: errorMessage, backup_id: backupLog.id }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
