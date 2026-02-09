

# Stability Improvements — Global Retry & Error Handling

## Problem

React Query is initialized with no configuration (`new QueryClient()`) in `App.tsx`. This means:
- Failed queries are retried 3 times by default, but with no intelligent backoff or error-type awareness
- Mutations have no retry at all
- There is no global error handler to show the "Service temporarily unavailable" message
- The existing `withRetry` utility in `supabaseErrors.ts` and `categorizeError` are not connected to React Query

## Changes

### 1. `src/App.tsx` — Configure QueryClient defaults

Replace the bare `new QueryClient()` with smart defaults:

- **Queries**: retry up to 2 times with exponential backoff (1s, 2s); skip retry for auth errors (401/403)
- **Queries**: set `staleTime: 30000` (30s) to reduce redundant refetches across navigation
- **Mutations**: retry once for network/5xx errors only (safe because mutations that already succeeded won't match the retry condition)
- **Global `onError`**: show a toast with the user-friendly message from the existing `categorizeError` utility — specifically "Service temporarily unavailable. Please try again shortly." for 502/503/504 errors

### 2. `src/lib/supabaseErrors.ts` — Add the exact message requested

Update the 502/503/504 branch `userMessage` from the current generic wording to the exact copy requested:

> "Service temporarily unavailable. Please try again shortly."

This message is already close but not an exact match. The update ensures consistency with what the user asked for.

## Technical Detail

```text
src/App.tsx (line ~574)
──────────────────────
Before:
  const queryClient = new QueryClient();

After:
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          // Don't retry auth errors
          const info = categorizeError(error);
          if (info.type === "auth") return false;
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      },
      mutations: {
        retry: (failureCount, error) => {
          const info = categorizeError(error);
          return info.type === "network" && failureCount < 1;
        },
      },
    },
  });
```

```text
src/lib/supabaseErrors.ts (503 branch, ~line 72)
─────────────────────────────────────────────────
Before:
  userMessage: "Service temporarily unavailable. Please try again."

After:
  userMessage: "Service temporarily unavailable. Please try again shortly."
```

## File Summary

| File | Action | What |
|---|---|---|
| `src/App.tsx` | Update | Add `defaultOptions` to QueryClient with retry logic, staleTime, and retryDelay |
| `src/lib/supabaseErrors.ts` | Update | Align 502/503/504 user message to exact requested copy |

Two small edits, no new files. Leverages the existing `categorizeError` function so retry decisions are intelligent (no retrying expired sessions, only retrying transient failures).

