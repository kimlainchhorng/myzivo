/**
 * Run Storage Backup Edge Function
 * Catalogs files in critical storage buckets and creates manifests
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Buckets to backup/catalog
const BUCKETS_TO_BACKUP = [
  "kyc-documents",
  "menu-photos",
  "delivery-proofs",
  "driver-documents",
  "receipts",
];

const RETENTION_DAYS = 90;

interface FileInfo {
  name: string;
  size: number;
  created_at: string | null;
  path: string;
}

interface BucketManifest {
  bucket_name: string;
  file_count: number;
  total_size: number;
  files: FileInfo[];
  cataloged_at: string;
}

async function listBucketFiles(
  supabase: ReturnType<typeof createClient>,
  bucketName: string
): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  
  try {
    // List root level
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list("", { limit: 1000 });

    if (error) {
      console.warn(`Error listing ${bucketName}:`, error.message);
      return files;
    }

    for (const item of data || []) {
      if (item.id) {
        // It's a file
        files.push({
          name: item.name,
          size: item.metadata?.size || 0,
          created_at: item.created_at || null,
          path: item.name,
        });
      } else {
        // It's a folder - list contents
        const { data: folderData } = await supabase.storage
          .from(bucketName)
          .list(item.name, { limit: 1000 });

        for (const subItem of folderData || []) {
          if (subItem.id) {
            files.push({
              name: subItem.name,
              size: subItem.metadata?.size || 0,
              created_at: subItem.created_at || null,
              path: `${item.name}/${subItem.name}`,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Failed to list bucket ${bucketName}:`, err);
  }

  return files;
}

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
      backup_type: "files",
      backup_target: "storage",
      status: "in_progress",
      started_at: new Date().toISOString(),
      retention_days: RETENTION_DAYS,
      metadata: { buckets: BUCKETS_TO_BACKUP, trigger: "scheduled" },
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
    const manifests: BucketManifest[] = [];
    let totalFiles = 0;
    let totalSize = 0;

    // Catalog each bucket
    for (const bucketName of BUCKETS_TO_BACKUP) {
      const files = await listBucketFiles(supabase, bucketName);
      const bucketSize = files.reduce((sum, f) => sum + f.size, 0);

      manifests.push({
        bucket_name: bucketName,
        file_count: files.length,
        total_size: bucketSize,
        files: files,
        cataloged_at: new Date().toISOString(),
      });

      totalFiles += files.length;
      totalSize += bucketSize;

      console.log(`Cataloged ${bucketName}: ${files.length} files, ${bucketSize} bytes`);
    }

    // Generate manifest file
    const dateStr = new Date().toISOString().split("T")[0];
    const timestamp = Date.now();
    const fileName = `storage-manifest-${dateStr}-${timestamp}.json`;
    const filePath = `backups/storage/${fileName}`;

    const manifestJson = JSON.stringify({
      version: "1.0",
      created_at: new Date().toISOString(),
      backup_id: backupLog.id,
      buckets: BUCKETS_TO_BACKUP,
      total_files: totalFiles,
      total_size: totalSize,
      manifests: manifests,
    });

    const manifestSize = new TextEncoder().encode(manifestJson).length;

    // Upload manifest to storage
    const { error: uploadError } = await supabase.storage
      .from("system-backups")
      .upload(filePath, manifestJson, {
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
        size_bytes: totalSize,
        expires_at: expiresAt.toISOString(),
        metadata: {
          buckets: BUCKETS_TO_BACKUP,
          total_files: totalFiles,
          total_storage_bytes: totalSize,
          manifest_file: fileName,
          manifest_type: "storage_catalog",
        },
      })
      .eq("id", backupLog.id);

    // Also insert into backup_runs for simple view
    await supabase.from("backup_runs").insert({
      backup_type: "storage",
      status: "success",
      file_url: filePath,
    });

    console.log(`Storage backup completed: ${filePath} (${totalFiles} files, ${totalSize} bytes)`);

    return new Response(
      JSON.stringify({
        success: true,
        backup_id: backupLog.id,
        file_path: filePath,
        total_files: totalFiles,
        total_size: totalSize,
        buckets_cataloged: BUCKETS_TO_BACKUP.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Storage backup failed:", errorMessage);

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
      backup_type: "storage",
      status: "failed",
    });

    // Send failure notification
    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          title: "⚠️ Storage Backup Failed",
          body: `Daily storage backup failed: ${errorMessage}`,
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
