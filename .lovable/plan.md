

# Fix for "Pay & Request" Stuck on Redirect

## Problem Identified

The **"Pay & Request"** button gets stuck on "Redirecting to Payment..." on the published site. Analysis shows:

1. **Edge Function Errors**: The `create-ride-checkout` function was failing because `req.headers.get("origin")` returns `null` in certain contexts (e.g., when called from the published domain), causing Stripe to reject the checkout session creation due to invalid URLs like `null/rides/success`.

2. **Fix Already Applied**: A fallback was added to use `referer` header or default to `https://myzivo.lovable.app`, which is now working (confirmed by successful test calls).

3. **Deployment Timing**: The user may have tested before the fix was fully deployed.

## Current Status

- Edge function has been re-deployed with the fix
- Test calls confirm the function now returns valid Stripe checkout URLs

## Additional Improvements Needed

To make this more robust and prevent future issues:

### 1. Add Better Logging to Edge Function

Add console.log statements to track the origin resolution:

```typescript
// After getting origin
console.log("[create-ride-checkout] Origin:", origin);
console.log("[create-ride-checkout] Headers origin:", req.headers.get("origin"));
console.log("[create-ride-checkout] Headers referer:", req.headers.get("referer"));
```

### 2. Add Error Recovery in Frontend

Update `src/pages/Rides.tsx` to:
- Add timeout to reset the "processing" state if redirect doesn't happen
- Add console logging to help debug future issues
- Try opening Stripe in a new tab if same-window redirect fails

```typescript
const handlePayment = async () => {
  if (!contactInfo.name || !contactInfo.phone || !selectedOption) return;
  setStep("processing");
  setIsSubmitting(true);
  try {
    const estimatedFare = calculateFare(...);
    console.log("[Rides] Starting checkout...");
    
    const { data, error } = await supabase.functions.invoke("create-ride-checkout", { ... });
    
    console.log("[Rides] Checkout response:", { data, error });
    
    if (error) throw error;
    if (!data?.url) throw new Error("No checkout URL returned");
    
    console.log("[Rides] Redirecting to:", data.url);
    
    // Try redirect - if it fails after 3 seconds, fall back to new tab
    window.location.href = data.url;
    
    setTimeout(() => {
      // If still on this page after 3 seconds, try new tab
      if (document.visibilityState === 'visible') {
        console.log("[Rides] Redirect may have failed, trying new tab");
        window.open(data.url, '_blank');
      }
    }, 3000);
    
  } catch (error) {
    console.error("Payment error:", error);
    toast.error("Failed to start payment. Please try again.");
    setStep("confirm");
    setIsSubmitting(false);
  }
};
```

### 3. Verify Published Site is Using Latest Build

The published site at `myzivo.lovable.app` may be caching an old version. The user should:
1. Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear browser cache if needed
3. Try in incognito mode

## Implementation Steps

1. Update edge function with better logging
2. Update frontend with timeout fallback and logging
3. Re-deploy edge function
4. User verifies with a fresh browser session

## Testing

After implementation:
1. Clear browser cache or use incognito
2. Go to myzivo.lovable.app/rides
3. Enter pickup/dropoff
4. Fill contact info
5. Click "Pay & Request"
6. Should redirect to Stripe checkout

