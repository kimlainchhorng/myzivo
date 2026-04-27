/**
 * voiceUpload — XHR-based upload to Supabase Storage with progress + abort support,
 * plus a small retry-with-backoff helper.
 *
 * Why XHR? supabase-js's storage `upload()` doesn't expose progress events.
 * For voice notes we want a per-bubble progress bar, so we PUT directly to the
 * Storage REST endpoint with the user's session access token.
 */
import { supabase } from "@/integrations/supabase/client";

export interface UploadVoiceOpts {
  blob: Blob;
  bucket: string;
  path: string;
  contentType?: string;
  cacheControl?: string;
  signal?: AbortSignal;
  onProgress?: (ratio: number) => void;
}

export interface UploadVoiceResult {
  publicUrl: string;
  path: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export class UploadAbortedError extends Error {
  constructor() {
    super("Upload aborted");
    this.name = "UploadAbortedError";
  }
}

export class UploadHttpError extends Error {
  status: number;
  retriable: boolean;
  constructor(status: number, message: string) {
    super(message);
    this.name = "UploadHttpError";
    this.status = status;
    // 408 timeout, 429 rate limit, 5xx — safe to retry
    this.retriable = status === 408 || status === 429 || (status >= 500 && status < 600);
  }
}

export async function uploadVoiceWithProgress(opts: UploadVoiceOpts): Promise<UploadVoiceResult> {
  const { blob, bucket, path, contentType, cacheControl = "3600", signal, onProgress } = opts;

  if (signal?.aborted) throw new UploadAbortedError();

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Not authenticated");

  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURI(path)}`;

  return await new Promise<UploadVoiceResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("cache-control", `max-age=${cacheControl}`);
    if (contentType) xhr.setRequestHeader("Content-Type", contentType);

    const onAbort = () => {
      try { xhr.abort(); } catch { /* noop */ }
    };
    if (signal) signal.addEventListener("abort", onAbort, { once: true });

    xhr.upload.onprogress = (e) => {
      if (!onProgress) return;
      if (e.lengthComputable && e.total > 0) onProgress(e.loaded / e.total);
    };

    xhr.onload = () => {
      signal?.removeEventListener("abort", onAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        onProgress?.(1);
        resolve({ publicUrl: data.publicUrl, path });
      } else {
        reject(new UploadHttpError(xhr.status, xhr.responseText || `HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      // Network-level failure — retriable
      const err = new UploadHttpError(0, "Network error");
      err.retriable = true;
      reject(err);
    };
    xhr.onabort = () => {
      signal?.removeEventListener("abort", onAbort);
      reject(new UploadAbortedError());
    };

    try {
      xhr.send(blob);
    } catch (e) {
      reject(e);
    }
  });
}

export interface RetryOpts {
  attempts?: number;
  baseDelayMs?: number;
  signal?: AbortSignal;
  isRetriable?: (err: unknown) => boolean;
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new UploadAbortedError());
    const t = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new UploadAbortedError());
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });

const defaultIsRetriable = (err: unknown): boolean => {
  if (err instanceof UploadAbortedError) return false;
  if (err instanceof UploadHttpError) return err.retriable;
  // Generic Error from supabase-js insert: retry network-ish errors only
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  if (!msg) return false;
  return (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("timeout") ||
    msg.includes("temporar") ||
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("504")
  );
};

export async function retryWithBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  opts: RetryOpts = {},
): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const base = opts.baseDelayMs ?? 600;
  const isRetriable = opts.isRetriable ?? defaultIsRetriable;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    if (opts.signal?.aborted) throw new UploadAbortedError();
    try {
      return await fn(i);
    } catch (err) {
      lastErr = err;
      if (err instanceof UploadAbortedError) throw err;
      if (i === attempts - 1 || !isRetriable(err)) throw err;
      const jitter = Math.random() * 200;
      const delay = base * Math.pow(2.2, i) + jitter;
      await sleep(delay, opts.signal);
    }
  }
  throw lastErr;
}
