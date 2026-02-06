

# Add Email OTP Verification

## Overview

Replace the current "click a link to verify" flow with a **6-digit email OTP code** verification system. Users will receive a code via email and enter it in a dedicated OTP input screen.

---

## Current Flow vs. New Flow

```text
CURRENT FLOW:
┌─────────────────────────────────────────────────────────────┐
│ Sign Up → Check Email → Click Link → Auth Callback → Setup │
└─────────────────────────────────────────────────────────────┘

NEW FLOW:
┌──────────────────────────────────────────────────────────────────┐
│ Sign Up → OTP Screen → Enter 6-Digit Code → Verified → Setup    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Implementation Components

### 1. New Edge Function: `send-otp-email`

Creates and sends a 6-digit verification code via email using Resend.

**What it does:**
- Generates a random 6-digit OTP code
- Stores the code in a new `otp_codes` database table (with expiry)
- Sends a branded email with the code via Resend
- Code expires after 10 minutes

### 2. New Edge Function: `verify-otp-code`

Validates the OTP code entered by the user.

**What it does:**
- Checks if the code matches and hasn't expired
- Marks the user's email as verified in Supabase Auth
- Returns success/failure response

### 3. Database Table: `otp_codes`

Stores pending OTP codes for verification.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References auth user |
| email | text | Target email address |
| code | text | 6-digit OTP code |
| expires_at | timestamp | Expiry time (10 min) |
| verified_at | timestamp | When verified (nullable) |
| created_at | timestamp | Creation time |

### 4. New Page: `/verify-otp`

A dedicated OTP input screen using the existing `InputOTP` component.

**UI Design:**
```text
┌────────────────────────────────────────┐
│                                        │
│              [ZIVO ID]                 │
│                                        │
│         Enter Verification Code        │
│                                        │
│    We sent a 6-digit code to your      │
│    email: j***@example.com             │
│                                        │
│        ┌─┐ ┌─┐ ┌─┐  ┌─┐ ┌─┐ ┌─┐        │
│        │ │ │ │ │ │  │ │ │ │ │ │        │
│        └─┘ └─┘ └─┘  └─┘ └─┘ └─┘        │
│                                        │
│         [ Verify Email → ]             │
│                                        │
│    Didn't receive it?                  │
│    Resend Code (available in 60s)      │
│                                        │
└────────────────────────────────────────┘
```

**Features:**
- Auto-focus on first digit
- Auto-submit when all 6 digits entered
- Resend button with 60-second cooldown
- Masked email display for privacy
- Dark zinc theme matching login page

### 5. Updated Signup Flow

Modify `Login.tsx` to:
1. After successful signup, call `send-otp-email` edge function
2. Navigate to `/verify-otp` instead of `/verify-email`
3. Pass email as state to the OTP page

---

## Flow Diagram

```text
User Signs Up
      │
      ▼
┌──────────────────┐
│ call signUp()    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ invoke send-otp-email        │
│ (generates code, sends email)│
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────┐
│ navigate to      │
│ /verify-otp      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ User enters 6-digit code     │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ invoke verify-otp-code       │
│ (validates, confirms email)  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────┐
│ navigate to      │
│ /setup           │
└──────────────────┘
```

---

## Files to Create

| File | Description |
|------|-------------|
| `supabase/functions/send-otp-email/index.ts` | Generate and send OTP via Resend |
| `supabase/functions/verify-otp-code/index.ts` | Validate OTP and confirm email |
| `src/pages/VerifyOTP.tsx` | OTP input page with 6-digit code entry |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Call `send-otp-email` after signup, redirect to `/verify-otp` |
| `src/App.tsx` | Add route for `/verify-otp` |

## Database Changes

| Table | Change |
|-------|--------|
| `otp_codes` | New table for storing OTP codes |

---

## Security Considerations

1. **Rate Limiting**: Max 5 OTP requests per email per hour
2. **Code Expiry**: Codes expire after 10 minutes
3. **Single Use**: Codes are invalidated after successful verification
4. **Brute Force Protection**: Lock after 5 failed attempts
5. **Secure Generation**: Use crypto-random for code generation

---

## Email Template

The OTP email will use ZIVO branding:

```text
Subject: Your ZIVO verification code

┌─────────────────────────────────────┐
│            [ZIVO Logo]              │
├─────────────────────────────────────┤
│                                     │
│  Your verification code is:        │
│                                     │
│       ┌─────────────────────┐       │
│       │      1 2 3 4 5 6    │       │
│       └─────────────────────┘       │
│                                     │
│  This code expires in 10 minutes.   │
│                                     │
│  If you didn't request this, you    │
│  can safely ignore this email.      │
│                                     │
└─────────────────────────────────────┘
```

---

## Testing Checklist

After implementation:
1. Sign up with new email → should receive OTP email
2. Enter correct code → should verify and go to /setup
3. Enter wrong code → should show error
4. Wait 10+ minutes → code should expire
5. Resend button → should send new code
6. Resend cooldown → should enforce 60-second wait

