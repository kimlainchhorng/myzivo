# Move avatar dropdown items into the left sidebar

## Goal

The top-right avatar dropdown on `/feed` (Picture 1) currently hides important account actions:
- **Your Business Pages** (e.g. Koh Sdach Resort)
- **Create new Business**
- **Join ZIVO+** (or **Membership** when you already subscribe)
- **Sign out**
- *(plus My Profile, My Trips)*

These will be moved into the left **FeedSidebar** (Picture 2) as new always-visible sections, so they sit alongside Switch / View profile / Navigate / Services / More — no popover needed on desktop.

## New sidebar layout (desktop, lg+)

```text
┌─────────────────────────┐
│  [profile card]         │
│  ZIVO ✓   Switch        │
│  @username              │
│  View profile           │
├─────────────────────────┤
│  YOUR BUSINESS PAGES    │  ← NEW
│  🏝  Koh Sdach Resort    │
│      Resort             │
│  🏢  Create new Business │
├─────────────────────────┤
│  NAVIGATE               │
│  Rides / Eats / Map …   │
├─────────────────────────┤
│  SERVICES               │
│  Flights / Hotels / Cars│
├─────────────────────────┤
│  MORE                   │
│  My Trips, …            │
├─────────────────────────┤
│  👑  Join ZIVO+          │  ← NEW (or "Membership" if subscriber)
│  ↪  Sign out            │  ← NEW
└─────────────────────────┘
```

## Implementation

### 1. `src/components/social/FeedSidebar.tsx` — add three new blocks

a. **Business Pages section** (only when `user`):
- Reuse the existing `useOwnerStores()` hook the NavBar already uses (line 412 of `NavBar.tsx`).
- For each store: avatar (logo) + name + category, click → `resolveBusinessDashboardRoute(store.category, store.id).path`.
- Always render a "Create new Business" row → `/business/new?new=1`.
- Section label: `YOUR BUSINESS PAGES`. Hidden entirely if no user.

b. **Membership row** above the footer:
- If `!isMember` (from `useZivoPlus`) → "Join ZIVO+" → `/membership` (amber crown).
- If `isMember` → "Membership" → `/account/membership`.

c. **Sign out** at the bottom of the sidebar (destructive color), calls `signOut()` from `useAuth`.

### 2. `src/components/home/NavBar.tsx` — slim the avatar dropdown on desktop

On lg+ screens (where the sidebar is visible), the avatar dropdown becomes redundant. Two options:

**Option A (recommended):** Keep the avatar dropdown but **remove the duplicated items** (Business Pages, Create new Business, Join ZIVO+, Sign out) when the viewport is lg+. The dropdown then only shows: identity header + My Profile + My Trips + a "Switch account" affordance, since Sidebar already covers the rest. On mobile the dropdown stays unchanged because there is no sidebar.

**Option B:** Hide the avatar dropdown entirely on lg+ and just show the avatar as a link to `/profile`.

I'll go with **Option A** to preserve a quick-access menu without duplicating items.

### 3. Hooks to import in FeedSidebar
- `useOwnerStores` (or whatever NavBar uses — I'll match its exact import to stay consistent)
- `useZivoPlus` for `isMember`
- `signOut` from `useAuth` (already partially used)
- `resolveBusinessDashboardRoute` from `@/lib/business/dashboardRoute`

### 4. No backend / migration changes
This is pure UI restructuring. No database, RLS, or edge-function work.

## Files changed
- `src/components/social/FeedSidebar.tsx` — add Business Pages section, Membership row, Sign out row
- `src/components/home/NavBar.tsx` — hide the duplicated dropdown items on lg+ breakpoint

## Out of scope
- Mobile (< lg) layout: the avatar dropdown stays exactly as today.
- The Switch Account sheet keeps working unchanged.
