

# Implement ZIVO Premium Auth Page Design

## Overview

Replace the current login/signup pages with a unified, premium authentication experience featuring:
- Dark zinc aesthetic with animated holographic gradients
- Combined login/signup toggle mode in a single component
- Glassmorphism card with subtle glow effects
- Premium input styling with icon indicators
- Social login buttons (Google, Apple)

---

## Design Comparison

| Current Design | New Premium Design |
|----------------|-------------------|
| Separate Login/Signup pages | Unified toggle between modes |
| Card-based with backdrop blur | Full-screen dark zinc with holographic background |
| 3-column social buttons | 2-column (Google + Apple only) |
| Standard form inputs | Premium inputs with glow effects |
| ZivoLogo component | "ZIVO." text branding |

---

## Implementation Steps

### Step 1: Update Login Page (`src/pages/Login.tsx`)

Transform into the premium unified auth component:

**Changes:**
- Add `isLogin` toggle state for switching between login/signup modes
- Implement animated holographic background (cyan/purple gradient orbs)
- Replace Card with glassmorphism container (`bg-zinc-900/80 backdrop-blur-2xl`)
- Style inputs with dark theme (`bg-zinc-800/50 border-zinc-700`)
- Update action button with gradient glow effect
- Simplify social login to Google + Apple only
- Add mode toggle at bottom

**Key Visual Elements:**
- Background: Animated cyan/purple gradient orbs with blur
- Card: `rounded-3xl border border-white/10 shadow-2xl`
- Inputs: Dark zinc with subtle glow on focus
- Button: Gradient `from-sky-500 to-cyan-400` with glow

### Step 2: Update/Remove Signup Page

**Option A (Recommended):** Keep `/signup` route but redirect to `/login` with signup mode active

**Rationale:** The premium design combines both modes, so having a separate signup page is redundant. However, keeping the route maintains backward compatibility for any links/bookmarks.

**Implementation:**
- Modify `Signup.tsx` to redirect to `/login?mode=signup`
- Or import the same unified component with `defaultMode="signup"`

### Step 3: Preserve Existing Logic

The new design must retain all existing auth functionality:
- Email/password login with validation
- Social login (Google, Apple) via `signInWithProvider`
- Email verification check and redirect
- Profile setup check after login
- Allowlist validation for signup
- Error handling and toast notifications

---

## Technical Details

### Form Validation (preserved)
```text
Login:
- email: z.string().email()
- password: z.string().min(6)

Signup (additional fields):
- fullName: z.string().min(2).max(100)
- confirmPassword: z.string() (must match password)
```

### Social Providers
Reduce from 3 to 2:
- Google (keep)
- Apple (keep)
- ~~Facebook~~ (remove)

### Styling Classes
```text
Background orbs:
- bg-gradient-to-br from-cyan-500/30 to-purple-500/20 blur-3xl

Glass card:
- bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl

Inputs:
- bg-zinc-800/50 border-zinc-700 focus:border-cyan-500 text-white

Action button:
- bg-gradient-to-r from-sky-500 to-cyan-400 shadow-lg shadow-cyan-500/30
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Complete redesign with premium UI |
| `src/pages/Signup.tsx` | Either redirect to Login or reuse same component |

---

## Testing Checklist

After implementation:
1. Verify login mode works with email/password
2. Verify signup mode shows name + confirm password fields
3. Verify Google OAuth initiates correctly
4. Verify toggle switches between login/signup smoothly
5. Verify form validation errors display properly
6. Verify mobile responsiveness (inputs should not trigger iOS zoom)

