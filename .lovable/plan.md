

# Fix Back Button on Eats Address Page

## Problem
`window.history.length` is unreliable -- browsers typically start with a history length of 1 or more even when there's no previous page to go back to. So `navigate(-1)` fires but does nothing, leaving the user stuck.

## Fix

**File:** `src/pages/EatsAddress.tsx`

Change the back button to always navigate to `/eats` instead of trying `navigate(-1)`. This is the safest and most predictable approach since the address page is always accessed from the Eats flow.

```typescript
// Change line 144 from:
onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/eats")}

// To:
onClick={() => navigate("/eats")}
```

This guarantees the button always works regardless of how the user arrived at the page.

