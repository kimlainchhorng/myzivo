

# Update ZivoOnboarding with Auto-Skip & UI Enhancements

## Overview

Update the Setup page with the enhanced version you provided, which adds:
- Auto-skip functionality (redirects to home if profile is already complete)
- "Verifying profile..." loading screen on mount
- Updated UI with `ArrowRight` icon in the submit button
- Refined copy and styling

---

## Key Changes

| Current Implementation | New Design |
|----------------------|------------|
| No auto-check on load | Auto-checks if profile complete → redirects to `/` |
| Simple loading spinner | Full-screen "Verifying profile..." state |
| Button says "Complete Setup" | Button says "Complete Setup →" with arrow icon |
| Copy: "Just a few details..." | Copy: "One last step before you fly." |
| Phone label: "(Optional)" | Phone label: no "(Optional)" text |
| Loading state only during submit | Loading state on mount AND during submit |

---

## Implementation Details

### 1. Add Auto-Check on Mount

When the component loads, it will:
1. Start with `loading: true`
2. Check if user is authenticated (redirect to `/login` if not)
3. Fetch the profile from the database using `user_id`
4. If `setup_complete` is true, redirect to `/` immediately
5. Otherwise, prefill the name and show the form

**Important Fix**: Your provided code queries with `.eq('id', user.id)` but the database schema uses `user_id` as the foreign key column. I'll use `.eq('user_id', user.id)` to match the correct schema.

### 2. Enhanced Loading Screen

Replace the simple spinner with:
```text
┌─────────────────────────────┐
│                             │
│        🔄 (spinner)         │
│   "Verifying profile..."    │
│                             │
└─────────────────────────────┘
```

Full-screen white background with centered content.

### 3. Updated Submit Button

Add the `ArrowRight` icon:
```text
[ Complete Setup → ]
```

Import `ArrowRight` from lucide-react and add it after the text.

### 4. Copy Updates

- Subtitle: "One last step before you fly."
- Phone label: "Phone Number" (without "Optional")
- Toast on success: "You're all set!"

### 5. Force Reload on Complete

Change from `navigate("/")` to `window.location.href = "/"` to ensure all cached states are cleared after setup.

---

## Technical Notes

### Database Query Fix

The provided code uses:
```javascript
.eq('id', user.id)  // ❌ Wrong column
```

I'll correct this to:
```javascript
.eq('user_id', user.id)  // ✓ Correct column
```

This matches your database schema where `profiles.user_id` references the auth user.

### Auth Check Route

The provided code redirects to `/auth`, but the project uses `/login`. I'll update this to match:
```javascript
navigate("/login");  // Matches existing routing
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Setup.tsx` | Add auto-check, update UI, add ArrowRight icon |

---

## Testing Checklist

After implementation:
1. New user → should see onboarding form
2. Existing user with `setup_complete: true` → should auto-redirect to `/`
3. "Verifying profile..." should show briefly on page load
4. Submit button should have arrow icon
5. Force reload should clear all cached states

