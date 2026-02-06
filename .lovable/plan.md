

# Update Login Page with ZivoAuth Design

## Overview

Update the Login page (`src/pages/Login.tsx`) to incorporate the cleaner visual design from your ZivoAuth snippet while **preserving critical functionality** like allowlist validation, email verification routing, and OAuth configuration.

---

## Key Differences: Current vs. Your Design

| Feature | Current Implementation | Your ZivoAuth Design |
|---------|----------------------|---------------------|
| Form validation | react-hook-form + Zod | Native form handling |
| Signup fields | Name, Email, Password, Confirm | Email, Password only |
| Allowlist check | Yes (edge function) | No |
| OAuth redirect | `/auth-callback` with prompt | `/onboarding` direct |
| Background | Framer Motion animated orbs | Static dark gradient |
| Title | "ZIVO." | "ZIVO ID" |
| Subtitle (login) | "Welcome back, traveler." | "Welcome back, Traveler" |
| Subtitle (signup) | "Join the future of travel." | "Create your secure account" |
| Input styling | Icon in separate box | Icon positioned in input |

---

## Implementation Plan

### 1. Visual Updates

Update the Login page with your design's aesthetic:

**Header Changes:**
```text
Current: "ZIVO."
New:     "ZIVO ID"

Current: "Welcome back, traveler."  
New:     "Welcome back, Traveler"

Current: "Join the future of travel."
New:     "Create your secure account"
```

**Background Simplification:**
- Remove Framer Motion animated orbs
- Use a simpler static gradient background

**Input Styling:**
- Update input styling to match your design with icons positioned inside the inputs
- Use `bg-zinc-950 border-zinc-800` color scheme

**Button Text:**
- Login: "Sign In" (keep current)
- Signup: "Create Account" (keep current)

### 2. Form Simplification Option

You have two choices:

**Option A - Keep Current Form (Recommended)**
- Retains password confirmation for security
- Retains full name collection during signup
- Keeps react-hook-form validation

**Option B - Match Your Design Exactly**
- Remove password confirmation field
- Remove full name field from signup
- Note: Name would need to be collected during Setup instead

### 3. Preserved Critical Functionality

The following **will NOT change** to maintain security and proper flow:

1. **Allowlist Checking**: The edge function call to `check-signup-allowlist` remains for signup security
2. **OAuth Configuration**: Keep `redirectTo: /auth-callback` with `prompt: "select_account"` for account chooser
3. **Email Verification**: Route to `/verify-email` for unverified accounts
4. **Setup Detection**: Route to `/setup` if profile incomplete
5. **Auth Context**: Continue using `useAuth` hook for proper state management

---

## Technical Changes

### File: `src/pages/Login.tsx`

**1. Header Section**
```typescript
// Change title
<h1>ZIVO ID</h1>

// Update subtitles
{isLogin ? "Welcome back, Traveler" : "Create your secure account"}
```

**2. Background**
```typescript
// Remove Framer Motion animated orbs
// Add simpler gradient overlay
<div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
```

**3. Input Styling**
```typescript
// Update input classes to match your design
className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 
           text-white focus:outline-none focus:ring-2 focus:ring-blue-600 
           focus:border-transparent transition-all"
```

**4. Google Button**
```typescript
// Update to match your design with full-width Google logo text
<button>
  <GoogleLogo />
  Google
</button>
```

---

## Routing Clarification

Your design references `/auth` and `/onboarding`, but the project uses:
- `/login` for authentication
- `/setup` for onboarding

I will keep the existing routes to avoid breaking navigation.

---

## What Will Change

| Change | Before | After |
|--------|--------|-------|
| Title | ZIVO. | ZIVO ID |
| Subtitle (login) | "Welcome back, traveler." | "Welcome back, Traveler" |
| Subtitle (signup) | "Join the future of travel." | "Create your secure account" |
| Background | Animated orbs | Static gradient |
| Input borders | `border-zinc-700` | `border-zinc-800` |
| Input background | `bg-zinc-800/50` | `bg-zinc-950` |

---

## What Will NOT Change

- Allowlist validation on signup
- Email verification flow
- OAuth callback configuration (security)
- react-hook-form + Zod validation
- Password confirmation field (security)
- Full name collection (needed for profile)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Visual updates, copy changes, styling |

---

## Testing Checklist

After implementation:
1. Login flow works with email/password
2. Signup validates allowlist and sends verification email
3. Google OAuth redirects correctly and shows account chooser
4. Apple OAuth works correctly
5. Visual styling matches dark zinc theme
6. Mobile responsiveness maintained

