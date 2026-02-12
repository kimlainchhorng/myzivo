

## Expand Help Center to Cover All ZIVO Services

The core Help Center infrastructure already exists. The gap is that the in-app Help Center (`RiderHelpPage.tsx` at `/help`) only covers ride-related FAQs. This plan expands it into a full-service Help Center with the requested topic sections and a direct link to support chat.

---

### What Already Exists (no changes needed)

| Feature | File |
|---------|------|
| Live Support Chat with image upload | `LiveSupportChatPage.tsx` at `/support/chat` |
| AI Chat Widget (floating) | `LiveChatWidget.tsx` |
| Ticket creation form | `NewTicketPage.tsx` at `/help/new` |
| Ticket history list | `MyTicketsPage.tsx` at `/help/tickets` |
| "Get Help" on order detail | `EatsOrderDetail.tsx` |
| Support Center (unified tickets) | `SupportCenterPage.tsx` |
| FAQ search component | `FAQSection.tsx` (shared) |

---

### What Will Be Changed

**1. Expanded Help Center: `src/pages/help/RiderHelpPage.tsx`**

Replace the ride-only FAQ list with a section-based Help Center covering all services:

**Topic sections** (displayed as icon cards at the top):
- Trips and Orders (car icon) -- ride issues, food orders, delivery tracking
- Payments and Wallet (wallet icon) -- charges, refunds, wallet balance, payment methods
- Account and Login (user icon) -- password reset, phone update, profile settings
- Promotions and Rewards (gift icon) -- promo codes, referrals, loyalty points

Tapping a section filters the FAQ list to that topic. Each section gets 3-4 FAQs covering the relevant service areas.

**New "Chat with Support" button** added prominently above the existing "Report an Issue" card. Links to `/support/chat` for live agent chat.

**Updated FAQ data**: Expand from 11 ride-only FAQs to ~20 FAQs across all four sections, each tagged with a section category.

**2. "Get Help" on Ride History** (if not already present)

Add a "Get Help" button to ride trip detail/history that navigates to `/support/chat?context=ride&rideId=XXX`, matching the existing pattern in `EatsOrderDetail.tsx`.

---

### Technical Details

**Modified files (1):**

| File | Change |
|------|--------|
| `src/pages/help/RiderHelpPage.tsx` | Expand to full-service Help Center with 4 topic sections, broader FAQs, and chat support link |

**Section cards design:**
```text
+-------------------+  +-------------------+
| [Car]             |  | [Wallet]          |
| Trips & Orders    |  | Payments & Wallet |
+-------------------+  +-------------------+
+-------------------+  +-------------------+
| [User]            |  | [Gift]            |
| Account & Login   |  | Promos & Rewards  |
+-------------------+  +-------------------+
```

Styled as a 2x2 grid of tappable cards with verdant green icon backgrounds (`bg-emerald-500/10`), `rounded-2xl`, and large readable labels.

**New FAQ categories added:**
- "Payments" -- wallet balance, refund timing, adding payment methods, subscription charges
- "Account" -- password reset, email change, phone verification, account deletion
- "Promotions" -- applying promo codes, referral rewards, loyalty points, expiration
- Existing ride/driver/safety/lost item categories remain

**Chat support button placement:**
Between the search bar and category filters, a prominent card with:
- MessageCircle icon + "Chat with Support"
- Subtitle: "Get instant help from our team"
- Links to `/support/chat`
- Verdant green gradient background

**No new files or routes needed** -- all infrastructure already exists.

