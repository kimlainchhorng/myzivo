
# Fix Google OAuth Redirect for Lovable Preview Domain

## Problem Summary
Google OAuth is redirecting to `hizivo.com`, which doesn't exist yet (no DNS configured). The browser shows "can't reach this page" with error `DNS_PROBE_FINISHED_NXDOMAIN`.

## Solution
Update the OAuth redirect logic to use the Lovable preview domain instead of `hizivo.com` until you're ready to connect a custom domain.

---

## Changes Required

### 1. Update `src/contexts/AuthContext.tsx`

**Current code (lines 117-124):**
```typescript
const isCapacitor = typeof (window as any).Capacitor !== 'undefined';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const redirectUrl = (isCapacitor || isLocalhost)
  ? 'https://hizivo.com/auth-callback'
  : `${window.location.origin}/auth-callback`;
```

**Updated code:**
```typescript
const isCapacitor = typeof (window as any).Capacitor !== 'undefined';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Use Lovable preview domain for all cases until custom domain is connected
const PRODUCTION_CALLBACK = 'https://id-preview--72f99340-9c9f-453a-acff-60e5a9b25774.lovable.app/auth-callback';

const redirectUrl = (isCapacitor || isLocalhost)
  ? PRODUCTION_CALLBACK
  : `${window.location.origin}/auth-callback`;
```

### 2. Update `src/hooks/useCrossAppAuth.ts`

Change the `main` URL in APP_URLS (line 6):
```typescript
const APP_URLS = {
  main: "https://id-preview--72f99340-9c9f-453a-acff-60e5a9b25774.lovable.app",
  restaurant: "https://zivorestaurant.lovable.app",
  driver: "https://zivo-driver-app.rork.app",
} as const;
```

---

## Supabase Configuration Required

After the code changes, update your [Supabase URL Configuration](https://supabase.com/dashboard/project/slirphzzwcogdbkeicff/auth/url-configuration):

| Setting | Value |
|---------|-------|
| Site URL | `https://id-preview--72f99340-9c9f-453a-acff-60e5a9b25774.lovable.app` |
| Redirect URLs | Add: `https://id-preview--72f99340-9c9f-453a-acff-60e5a9b25774.lovable.app/auth-callback` |

---

## Future: When You Connect hizivo.com

Once you connect `hizivo.com` as a custom domain in Lovable and it becomes **Active**:

1. Update the code back to use `https://hizivo.com`
2. Update Supabase Site URL to `https://hizivo.com`
3. Add `https://hizivo.com/auth-callback` to Supabase Redirect URLs
4. Add `https://hizivo.com` to Google Cloud Console's Authorized JavaScript origins

---

## Technical Details

**Why this happened:**
The previous code change set `hizivo.com` as the redirect target for Capacitor/localhost, but since that domain has no DNS records pointing anywhere, the browser can't reach it.

**Files to modify:**
- `src/contexts/AuthContext.tsx` (line 122-123)
- `src/hooks/useCrossAppAuth.ts` (line 6)
