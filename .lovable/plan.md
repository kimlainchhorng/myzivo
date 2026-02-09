
# Coupons & Promo Codes - Implementation Status

## Executive Summary
The promo code system is **95% complete**. All checkout integration, validation, discount display, and success messaging are already implemented. The only missing piece is the dedicated `/account/promos` page to view available coupons.

---

## Current State Analysis

### Already Complete

| Feature | Status | Location |
|---------|--------|----------|
| Promo code input field | Complete | `src/components/eats/PromoCodeInput.tsx` (Eats) |
| Promo code input field | Complete | `src/components/ride/PromoCodeInput.tsx` (Rides) |
| Promo validation service | Complete | `src/lib/promoCodeService.ts` |
| Eats promo hook | Complete | `src/hooks/useEatsPromo.ts` |
| Rides promo validation | Complete | `src/hooks/useRidePromoValidation.ts` |
| Discount calculation | Complete | Shows discount amount and updated total |
| Success message | Complete | "Promo applied successfully" toast |
| User promo wallet component | Complete | `src/components/eats/UserPromoWallet.tsx` |
| User promo wallet hook | Complete | `src/hooks/useMarketing.ts` (`useUserPromoWallet`) |
| Database tables | Complete | `promo_codes`, `user_promo_wallet` |
| Credit wallet page | Complete | `/account/wallet` for credits |

### Checkout Flow (Already Working)
```text
+------------------------------------------+
| [🏷️] Enter promo code                    |
|      [          ] [Apply]                |
+------------------------------------------+
          ↓ (on success)
+------------------------------------------+
| [✓] SUMMER20                             |
|     20% off                  -$4.50   X  |
+------------------------------------------+
          ↓
Order Summary shows:
- Discount line: -$4.50
- Updated total with discount applied
- Toast: "Promo applied successfully"
```

### Missing Piece

| Item | What's Needed |
|------|---------------|
| `/account/promos` page | Dedicated page showing available coupons, expiration dates, usage rules |

---

## Implementation Plan

### 1) Create Promos Page

**File to Create:** `src/pages/account/PromosPage.tsx`

**Purpose:** Show all available promo codes assigned to the user, with expiration dates and usage rules.

**UI Design:**
```text
+------------------------------------------+
|   ←        My Promos                     |
+------------------------------------------+
|                                          |
|  ┌────────────────────────────────────┐  |
|  │  [🏷️]  You have 3 promos          │  |
|  │                                    │  |
|  │  Use them at checkout to save!     │  |
|  └────────────────────────────────────┘  |
|                                          |
|  Available Promos                        |
|  ┌────────────────────────────────────┐  |
|  │ [🏷️] SUMMER20                      │  |
|  │      20% off                       │  |
|  │  ─────────────────────────────────  │  |
|  │  [📅] Expires Feb 28               │  |
|  │  [💰] Min order: $15               │  |
|  │                                    │  |
|  │      [Copy]  [Use Now →]           │  |
|  └────────────────────────────────────┘  |
|  ┌────────────────────────────────────┐  |
|  │ [🏷️] FIRST50                       │  |
|  │      $50 off                       │  |
|  │  ─────────────────────────────────  │  |
|  │  [⚡] No expiration                 │  |
|  │  [💰] First order only             │  |
|  │                                    │  |
|  │      [Copy]  [Use Now →]           │  |
|  └────────────────────────────────────┘  |
|                                          |
|  How to Use                              |
|  • Enter code at checkout                |
|  • Discount applies automatically        |
|  • One promo per order                   |
+------------------------------------------+
```

**Features:**
- Fetches from `user_promo_wallet` (assigned promos) via existing `useUserPromoWallet` hook
- Also fetches general available promos from `promo_codes` table
- Shows expiration dates with color coding (expiring soon = amber)
- Shows min order/usage rules when applicable
- Copy button for each code
- "Use Now" button navigates to Eats or relevant checkout
- Empty state when no promos available

### 2) Add Route to App.tsx

**File to Modify:** `src/App.tsx`

Add route for the promos page:
```typescript
<Route path="/account/promos" element={<ProtectedRoute><PromosPage /></ProtectedRoute>} />
```

### 3) Add Link to Mobile Account

**File to Modify:** `src/pages/mobile/MobileAccount.tsx`

Add promos link to account menu items:
```typescript
{ icon: Tag, label: "My Promos", path: "/account/promos" },
```

### 4) Add Link to Wallet Page

**File to Modify:** `src/pages/account/WalletPage.tsx`

Update the "Promo Codes" section to link to the new page:
```typescript
<button onClick={() => navigate("/account/promos")} className="...">
  <Tag className="w-5 h-5 text-amber-400" />
  <div>
    <p className="font-medium">Promo Codes</p>
    <p className="text-xs text-zinc-500">View your available codes</p>
  </div>
  <ExternalLink className="w-4 h-4 text-zinc-600" />
</button>
```

---

## File Summary

### New Files (1)
| File | Purpose |
|------|---------|
| `src/pages/account/PromosPage.tsx` | Full-page view of available promo codes |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/account/promos` route |
| `src/pages/mobile/MobileAccount.tsx` | Add promos link to menu |
| `src/pages/account/WalletPage.tsx` | Make promo section clickable |

---

## Data Sources

### User Promo Wallet (Assigned Promos)
Uses existing `useUserPromoWallet` hook which fetches from `user_promo_wallet` table:
- Promos assigned to user via campaigns
- Shows expiration from `expires_at`
- Filter by `is_active = true` and not used

### General Available Promos
New query to fetch publicly available promo codes:
```typescript
const { data: publicPromos } = await supabase
  .from("promo_codes")
  .select("*")
  .eq("is_active", true)
  .is("city", null)  // Not city-restricted
  .gt("expires_at", new Date().toISOString())
  .or("expires_at.is.null");
```

---

## Promo Card Details

Each promo card shows:

| Field | Source | Display |
|-------|--------|---------|
| Code | `promo_code.code` | Bold monospace text |
| Discount | `discount_type` + `discount_value` | "20% off" or "$5 off" |
| Expiration | `expires_at` | "Expires Feb 28" or "No expiration" |
| Min Order | `min_fare` | "Min order: $15" if set |
| Max Discount | `max_discount` | "Up to $25 off" if set |
| Usage | `max_uses`, `uses` | Progress or "Unlimited" |

**Expiration Colors:**
- Expiring within 3 days: Amber warning
- Expiring within 7 days: Normal
- No expiration: Green "No expiration"

---

## Technical Notes

### Existing Infrastructure Leveraged
The page reuses existing hooks and components:
- `useUserPromoWallet` - Already fetches user's assigned promos
- `UserPromoWallet` component patterns - For card UI consistency
- Copy functionality from existing component

### Navigation Flow
```text
Mobile Account
     ↓
"My Promos" link
     ↓
/account/promos (new page)
     ↓
"Use Now" button
     ↓
/eats (or /rides with code in state)
```

### Success Toast (Already Implemented)
When user applies promo at checkout:
- `useEatsPromo` shows "Promo applied successfully" toast
- `usePromoCode` shows "Promo applied successfully" toast
- Both use `sonner` toast library

---

## Summary

The promo code system is **nearly complete**:

| Requirement | Status |
|-------------|--------|
| Enter promo code field at checkout | Complete (Eats + Rides) |
| Show discount amount | Complete |
| Show updated total | Complete |
| "Promo applied successfully" message | Complete |
| `/account/promos` page | **Need to create** |
| Show available coupons | **Need to create** |
| Show expiration dates | **Need to create** |
| Show usage rules | **Need to create** |

**Implementation scope:** 1 new file (PromosPage), 3 small modifications to add routing and links.

The checkout promo functionality, validation, discount calculation, and success messaging are all working - only the dedicated promos management page needs to be built.
