import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to Supabase Storage with real-time progress tracking via XHR.
 * Returns the public URL on success.
 */
export function uploadWithProgress(
  bucket: string,
  filePath: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    // Get current session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || SUPABASE_PUBLISHABLE_KEY;

    const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        resolve(data.publicUrl);
      } else {
        let msg = "Upload failed";
        try { msg = JSON.parse(xhr.responseText)?.message || msg; } catch {}
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload aborted"));

    xhr.send(file);
  });
}
