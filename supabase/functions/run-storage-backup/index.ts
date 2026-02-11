/**
 * Run Storage Backup Edge Function
 * Catalogs files in critical storage buckets and creates manifests
 */
import { serve, createClient } from "../_shared/deps.ts";

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

    // Recursive function to list files at any depth
    async function listRecursive(prefix: string) {
      const { data: items } = await supabase.storage
        .from(bucketName)
        .list(prefix, { limit: 1000 });

      for (const item of items || []) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.id) {
          // It's a file
          files.push({
            name: item.name,
            size: item.metadata?.size || 0,
            created_at: item.created_at || null,
            path: fullPath,
          });
        } else {
          // It's a folder - recurse into it
          await listRecursive(fullPath);
        }
      }
    }

    await listRecursive("");
  } catch (err) {
    console.warn(`Failed to list bucket ${bucketName}:`, err);
  }

  return files;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: require service role key or admin user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ success: false, error: "Authentication required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const token = authHeader.replace("Bearer ", "");
  if (token !== supabaseServiceKey) {
    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const roleCheck = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isAdmin } = await roleCheck.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
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
