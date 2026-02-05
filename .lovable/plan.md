

# Fix: Display OAuth Errors on Homepage (hizivo.com fallback)

## Problem

When an unauthorized Google account tries to sign up:
1. The allowlist trigger blocks the account creation (correct)
2. Supabase returns an error in the URL: `?error=server_error&error_description=Database+error+saving+new+user`
3. BUT the error lands on the homepage (`/`) instead of `/auth-callback`
4. The homepage doesn't parse or display these errors
5. **Result**: User sees the normal homepage with no feedback about the rejection

## Root Cause

Supabase returns OAuth errors to the page that initiated the request (current origin), not always the configured redirect URL. When `hizivo.com` isn't in our safe list, the code tries to redirect to a Lovable URL, but the error still lands on `hizivo.com/`.

## Solution

Add error detection to the homepage that catches OAuth errors and redirects users to a proper error display page, or shows a toast notification.

### Two-part fix:

**Part 1: Create a global OAuth error handler**

Add a component that runs on every page load to detect OAuth errors in the URL (both query params and hash fragment) and display appropriate feedback.

**Part 2: Add error handling to the Index page**

Detect error params on the homepage and either:
- Show a toast with the error message, OR  
- Redirect to `/auth-callback` with the error params preserved (so existing error handling works)

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Add useEffect to detect OAuth errors in URL and display toast or redirect |

## Implementation Details

```typescript
// In Index.tsx, add at the top of the component:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  const error = params.get("error") || hashParams.get("error");
  const errorDesc = params.get("error_description") || hashParams.get("error_description");
  
  if (error) {
    // Parse user-friendly message
    let message = "Authentication failed. Please try again.";
    if (errorDesc?.toLowerCase().includes("database error") || 
        errorDesc?.toLowerCase().includes("saving new user")) {
      message = "This email is not authorized to sign up. Please request an invitation to join ZIVO.";
    }
    
    toast.error(message);
    
    // Clean URL without reloading page
    window.history.replaceState({}, "", window.location.pathname);
  }
}, []);
```

## Expected Behavior After Fix

1. User clicks "Continue with Google" on `hizivo.com`
2. Selects unauthorized Google account
3. Supabase rejects signup, redirects to `hizivo.com/?error=...`
4. Homepage detects error params
5. **Shows toast: "This email is not authorized to sign up. Please request an invitation to join ZIVO."**
6. URL is cleaned up (error params removed)
7. User understands why signup failed

## Alternative Approach (if preferred)

Instead of showing a toast on the homepage, we could:
1. Redirect to `/auth-callback?error=...` and let the existing error handling display the full error page
2. Create a dedicated `/auth-error` page for displaying OAuth failures

The toast approach is simpler and doesn't require additional navigation.

