
# Add Resend Cooldown Timer to /verify-phone

## What Changes

Add a 60-second countdown timer to the "Resend code" and "Send Code" buttons on the phone verification page. After a code is sent, both buttons are disabled until the timer expires, preventing users from spamming OTP requests (which also protects the 5 SMS/day limit).

## User Experience

1. User enters phone number and taps "Send Code" -- code is sent, timer starts at 60s
2. On the OTP step, "Resend code" shows "Resend in 42s" (countdown) and is disabled
3. If user goes back to "Change number" step, the "Send Code" button also respects the cooldown
4. After 60 seconds, buttons re-enable normally

## Technical Details

**File:** `src/pages/VerifyPhonePage.tsx` (single file change)

**New state:**
- `cooldown` (number) -- seconds remaining, starts at 0
- `useEffect` with `setInterval` that decrements `cooldown` every second and clears when it hits 0

**Button changes:**
- "Send Code" button: disabled when `cooldown > 0` (in addition to existing checks), label shows "Resend in Xs" when cooling down
- "Resend code" button: same cooldown logic
- After successful `handleSendCode`, set `cooldown = 60`

No new dependencies, no database changes, no edge function changes.
