

# Affiliate Link Tracking — Implementation Plan

## Overview
Add tracking for customers who join ZIVO through affiliate/partner links. When a user signs up with an `affiliate_code` URL parameter, capture and store this attribution. Show a subtle acknowledgment on the Account page ("You were referred by a partner").

---

## Current State Analysis

### Existing Infrastructure
| Component | Status | Purpose |
|-----------|--------|---------|
| `profiles` table | Exists | Stores user profile data |
| `useReferrals` hook | Exists | Handles user-to-user referral codes (`ref=` param) |
| `drivers` table | Exists | Already has affiliate tracking fields |
| UTM tracking (`subidGenerator.ts`) | Exists | Captures marketing attribution |
| Profile page (`src/pages/Profile.tsx`) | Exists | Account settings display |
| Setup page (`src/pages/Setup.tsx`) | Exists | Onboarding flow |

### Key Insight
The `drivers` table already has affiliate tracking fields (`affiliate_code`, `affiliate_partner_id`, `affiliate_partner_name`, `affiliate_captured_at`). The `profiles` table (for customers) does **not** have these fields yet.

---

## Implementation Plan

### 1) Database Migration — Add Affiliate Fields to Profiles

Add four new columns to the `profiles` table to track affiliate attribution:

| Column | Type | Description |
|--------|------|-------------|
| `affiliate_code` | text | The affiliate/partner code from URL |
| `affiliate_partner_name` | text | Human-readable partner name (optional) |
| `affiliate_captured_at` | timestamptz | When the code was captured |

```sql
ALTER TABLE public.profiles
ADD COLUMN affiliate_code text,
ADD COLUMN affiliate_partner_name text,
ADD COLUMN affiliate_captured_at timestamptz;

-- Index for admin queries
CREATE INDEX idx_profiles_affiliate_code ON public.profiles (affiliate_code)
WHERE affiliate_code IS NOT NULL;
```

### 2) Capture Affiliate Code on Signup

**File to Modify:** `src/pages/Login.tsx`

**Changes:**
- Read `affiliate_code` from URL search params
- Store in sessionStorage for persistence through OAuth/verification flows
- Pass to signup flow

**Pattern:**
```text
const [searchParams] = useSearchParams();

// On component mount, capture affiliate_code if present
useEffect(() => {
  const affiliateCode = searchParams.get('affiliate_code');
  if (affiliateCode) {
    sessionStorage.setItem('signup_affiliate_code', affiliateCode);
  }
}, [searchParams]);
```

### 3) Store Affiliate Code During Profile Creation

**File to Modify:** `src/pages/Setup.tsx`

**Changes:**
- On profile setup completion, check for stored affiliate code
- Include affiliate fields in profile upsert

**Pattern:**
```text
// In handleComplete():
const affiliateCode = sessionStorage.getItem('signup_affiliate_code');

const payload = {
  user_id: user.id,
  full_name: fullName,
  phone: phone || null,
  setup_complete: true,
  // Affiliate tracking
  affiliate_code: affiliateCode || null,
  affiliate_captured_at: affiliateCode ? new Date().toISOString() : null,
};

// Clear after use
if (affiliateCode) {
  sessionStorage.removeItem('signup_affiliate_code');
}
```

### 4) Handle OAuth Signups

**File to Modify:** `src/pages/AuthCallback.tsx`

**Changes:**
- Preserve affiliate code through OAuth redirect
- Store in profile after successful OAuth authentication

**Note:** The affiliate code is already stored in sessionStorage before OAuth redirect, so it persists through the flow.

### 5) Create Affiliate Attribution Hook

**File to Create:** `src/hooks/useAffiliateAttribution.ts`

**Purpose:** Fetch and expose affiliate attribution status for the current user.

**Implementation:**
```text
export function useAffiliateAttribution() {
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['affiliate-attribution', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('affiliate_code, affiliate_partner_name, affiliate_captured_at')
        .eq('user_id', user.id)
        .single();
      
      return {
        hasAffiliateAttribution: !!data?.affiliate_code,
        affiliateCode: data?.affiliate_code,
        partnerName: data?.affiliate_partner_name || 'a partner',
        capturedAt: data?.affiliate_captured_at,
      };
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Attribution never changes
  });
  
  return {
    hasAffiliateAttribution: data?.hasAffiliateAttribution ?? false,
    partnerName: data?.partnerName ?? 'a partner',
    isLoading,
  };
}
```

### 6) Display Partner Attribution on Account Page

**File to Modify:** `src/pages/Profile.tsx`

**Changes:**
- Import and use `useAffiliateAttribution` hook
- Add subtle info card below Account Status section

**Design:**
```text
┌────────────────────────────────────────────────────┐
│  🤝  Referred by Partner                           │
│  You joined through a partner link.                │
│  Enjoy exclusive partner benefits!                 │
└────────────────────────────────────────────────────┘
```

**Pattern:**
```text
// After Account Status card:
{affiliateAttribution.hasAffiliateAttribution && (
  <Card className="relative border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 ...">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex ...">
          <Users className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <p className="font-semibold">Referred by Partner</p>
          <p className="text-xs text-muted-foreground">
            You joined through {affiliateAttribution.partnerName}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

---

## File Summary

### Database Changes (1)
| Change | Description |
|--------|-------------|
| Migration | Add `affiliate_code`, `affiliate_partner_name`, `affiliate_captured_at` to `profiles` |

### New Files (1)
| File | Purpose |
|------|---------|
| `src/hooks/useAffiliateAttribution.ts` | Query and expose affiliate attribution |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/pages/Login.tsx` | Capture `affiliate_code` from URL params |
| `src/pages/Setup.tsx` | Store affiliate code in profile on setup |
| `src/pages/Profile.tsx` | Display "Referred by Partner" card |

---

## URL Parameter Format

Users arriving via affiliate links will have URLs like:
```
https://hizivo.com/signup?affiliate_code=PARTNER123
https://hizivo.com/login?affiliate_code=travelagent
https://hizivo.com/?affiliate_code=blogger_deal
```

---

## Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        Affiliate Tracking Flow                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. User lands with ?affiliate_code=PARTNER123                          │
│     └─> Login.tsx captures and stores in sessionStorage                 │
│                                                                         │
│  2. User signs up (email or OAuth)                                      │
│     └─> Code persists in sessionStorage through redirects               │
│                                                                         │
│  3. User completes onboarding (Setup.tsx)                               │
│     └─> Code saved to profiles.affiliate_code                           │
│     └─> sessionStorage cleared                                          │
│                                                                         │
│  4. User visits Profile page                                            │
│     └─> useAffiliateAttribution fetches attribution                     │
│     └─> "Referred by Partner" card displayed                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Account Page Display

### Before (existing Account Status card)
```text
┌────────────────────────────────────────────────────┐
│  🛡️  Account Status                      Active   │
│  Member since Jan 15, 2025                         │
└────────────────────────────────────────────────────┘
```

### After (new Partner Attribution card)
```text
┌────────────────────────────────────────────────────┐
│  🛡️  Account Status                      Active   │
│  Member since Jan 15, 2025                         │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  🤝  Referred by Partner                           │
│  You joined through a partner                      │
└────────────────────────────────────────────────────┘
```

Only shown when `affiliate_code` exists on the user's profile.

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| No affiliate code in URL | Nothing captured, no card shown |
| User already has account | Code not applied (existing users) |
| OAuth flow | Code persists in sessionStorage |
| Email verification flow | Code persists through OTP/verify |
| User clears sessionStorage | Attribution lost (acceptable) |

---

## No Ordering Flow Changes

As specified, the affiliate attribution is **invisible during ordering**. It's only:
1. Captured silently on signup
2. Displayed in the Profile/Account page

---

## Technical Details

### UserProfile Type Update
The `useUserProfile` hook will automatically pick up new fields from the database once the migration runs.

### sessionStorage Key
```text
Key: signup_affiliate_code
Value: The raw affiliate code string
Lifecycle: Set on landing → Cleared after profile setup
```

### Index for Admin Queries
```sql
CREATE INDEX idx_profiles_affiliate_code 
ON public.profiles (affiliate_code) 
WHERE affiliate_code IS NOT NULL;
```

This enables efficient admin reporting on affiliate signups.

---

## Summary

This implementation:

1. **Database** — Adds affiliate tracking columns to `profiles` table
2. **Capture** — Reads `affiliate_code` from URL on Login page
3. **Persist** — Stores in sessionStorage through OAuth/verification flows
4. **Save** — Writes to profile during onboarding setup
5. **Display** — Shows subtle "Referred by Partner" card on Account page
6. **No ordering impact** — Affiliate attribution is invisible during checkout

The feature enables tracking affiliate-driven signups while maintaining a clean user experience.

