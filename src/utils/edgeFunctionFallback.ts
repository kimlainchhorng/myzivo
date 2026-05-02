type EdgeFunctionFallbackOptions<T> = {
  functionName: string;
  error: unknown;
  fallback: T;
  context?: Record<string, unknown>;
  throttleMs?: number;
};

type EdgeFunctionLikeError = {
  name?: string;
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
  status?: number;
};

const lastWarningByFunction = new Map<string, number>();

function normalizeError(error: unknown): EdgeFunctionLikeError {
  if (error && typeof error === "object") {
    return error as EdgeFunctionLikeError;
  }
  return { message: String(error) };
}

function shouldLog(functionName: string, throttleMs: number): boolean {
  const now = Date.now();
  const last = lastWarningByFunction.get(functionName) ?? 0;
  if (now - last < throttleMs) {
    return false;
  }
  lastWarningByFunction.set(functionName, now);
  return true;
}

export function edgeFunctionFallback<T>({
  functionName,
  error,
  fallback,
  context,
  throttleMs = 60_000,
}: EdgeFunctionFallbackOptions<T>): T {
  if (shouldLog(functionName, throttleMs)) {
    const normalized = normalizeError(error);
    console.warn(`[edge-function] ${functionName} failed; using fallback`, {
      status: normalized.status,
      code: normalized.code,
      name: normalized.name,
      message: normalized.message,
      details: normalized.details,
      hint: normalized.hint,
      context,
    });
  }

  return fallback;
}