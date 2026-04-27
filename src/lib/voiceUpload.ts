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
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export class UploadAbortedError extends Error {
  constructor() {
    super("Upload aborted");
    this.name = "UploadAbortedError";
  }
}

export class UploadHttpError extends Error {
  status: number;
  retriable: boolean;
  url?: string;
  constructor(status: number, message: string, url?: string) {
    super(message);
    this.name = "UploadHttpError";
    this.status = status;
    this.url = url;
    // 408 timeout, 429 rate limit, 5xx — safe to retry
    this.retriable = status === 408 || status === 429 || (status >= 500 && status < 600);
  }
}

/** Returns environment-level diagnostics for the voice upload pipeline. */
export function getVoiceUploadDiagnostics(): {
  hasAnonKey: boolean;
  supabaseUrl: string;
} {
  return {
    hasAnonKey: !!SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20,
    supabaseUrl: SUPABASE_URL || "",
  };
}

export interface PreflightResult {
  ok: boolean;
  status: number;
  url: string;
  reason?: string;
}

/**
 * Lightweight bucket/RLS preflight. Fires a single OPTIONS to the storage
 * object endpoint with the user's auth headers. A 401/403 response means
 * the bucket policy will reject the actual PUT — we surface that immediately
 * instead of burning the full retry budget on a guaranteed failure.
 *
 * Note: this never throws. Network errors → { ok: true, status: 0 } (we let
 * the actual upload attempt the request and produce the real error).
 */
export async function preflightVoiceBucket(opts: {
  bucket: string;
  path: string;
  signal?: AbortSignal;
}): Promise<PreflightResult> {
  const url = `${SUPABASE_URL}/storage/v1/object/${opts.bucket}/${encodeURI(opts.path)}`;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) return { ok: false, status: 401, url, reason: "Not authenticated" };
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };
    if (SUPABASE_ANON_KEY) headers["apikey"] = SUPABASE_ANON_KEY;
    const res = await fetch(url, {
      method: "OPTIONS",
      headers,
      signal: opts.signal,
    });
    // Storage returns 200 (or 204) for OPTIONS regardless of object existence
    // when the caller is allowed. 401/403 means the gateway / RLS will block.
    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        status: res.status,
        url,
        reason: `Storage permissions blocked this request (HTTP ${res.status}). Check the chat-media-files bucket RLS policies.`,
      };
    }
    return { ok: true, status: res.status, url };
  } catch {
    // CORS or network — don't block; let the real PUT surface the error.
    return { ok: true, status: 0, url };
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
    // PUT upserts (POST returns 409 on duplicate). Storage REST requires BOTH
    // the project anon `apikey` header and the user's Bearer token.
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    if (SUPABASE_ANON_KEY) xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
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
