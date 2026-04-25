## Goal

Take the verified-badge work end-to-end: a single source of truth for "is this account blue-verified?", an admin control that works for both **users and stores**, live propagation to every client, accessibility, safe fallbacks for missing data, and tests covering all the surfaces.

The good news: most of the user side already exists — `profiles.is_verified`, the `set_profile_blue_verified_manual` RPC, the audit log, and the verify/unverify button in `AdminUsersPage`. We're closing the remaining gaps.

## What will change

### 1. Schema — add verification to stores
Migration:
- Add `store_profiles.is_verified boolean not null default false`.
- Add `store_profiles.verified_at timestamptz`, `verified_by uuid`.
- New RPC `set_store_blue_verified_manual(_store_id uuid, _verified boolean, _reason text)`:
  - `security definer`, asserts `has_role(auth.uid(), 'admin')`.
  - Updates the store, writes a row to the existing `blue_verified_audit_log` (extend it with optional `target_store_id` if it doesn't already accept stores; otherwise log as JSON metadata).
- RLS: `store_profiles` already publicly readable; only the new RPC mutates `is_verified`.

### 2. Single source of truth — `useVerification`
New file `src/lib/verification.ts`:
```ts
export type VerifiedSource = "user" | "store" | "platform";
export interface Verifiable { id?: string | null; is_verified?: boolean | null; source?: VerifiedSource; }
export const isBlueVerified = (v?: Verifiable | null): boolean =>
  !!v && v.is_verified === true;            // strict — missing data → false
export const VERIFIED_LABEL = "Verified account";
export const VERIFIED_TOOLTIP = "ZIVO has confirmed this account is authentic.";
```
New hook `src/hooks/useVerifiedStatus.ts` — given a `userId` or `storeId`, returns `{ verified, loading }` from a small react-query cache (5-min stale). Used as a fallback wherever the post payload didn't include the flag.

### 3. Realtime propagation
- New hook `src/hooks/useVerificationRealtime.ts` mounted once in `App.tsx`. Subscribes to:
  - `postgres_changes` on `profiles` filtered to `is_verified` updates
  - `postgres_changes` on `store_profiles` filtered to `is_verified` updates
- On any event, invalidate react-query keys: `["admin-users"]`, `["suggested-users"]`, `["follow-suggestions"]`, `["public-profile", id]`, `["verified-status", id]`, plus the feed/reels caches. Net effect: when an admin toggles verification, every open client updates within ~1 s without a refresh.

### 4. Accessible badge
Update `src/components/VerifiedBadge.tsx`:
- Wrap in shadcn `Tooltip` (`TooltipProvider` already in `App.tsx`).
- `role="img"`, `aria-label={VERIFIED_LABEL}`.
- The hidden checkmark `<title>` inside the SVG for older AT.
- Add a `tooltipText?: string` prop (default = `VERIFIED_TOOLTIP`) so context-specific copy is possible (e.g. "Verified business").
- `interactive?: boolean` (default true) — when false (e.g. inside a button row), suppress the tooltip wrapper to avoid nested interactives.

### 5. Safe fallbacks
- Every render site uses `isBlueVerified(...)` instead of raw `&&` on possibly-`undefined` flags.
- For surfaces that may not have fetched verification yet (e.g. share sheet author label), call `useVerifiedStatus(authorId)` with `enabled: !explicitFlag` so we never render a wrong state — when unknown, render **nothing** (no half-state, no skeleton).
- Store posts default to **unverified unless the column says true** — we no longer hard-code `store_is_verified: true`. The previous "all stores are verified" shortcut is removed; the `ZIVO Platform` store will get verified once an admin flips the new switch.

### 6. Admin UI for stores
Extend `AdminUsersPage.tsx` (or add a small `AdminStoresVerification` section):
- New tab/segment "Stores" listing `store_profiles` (id, name, slug, is_verified, owner).
- Verify / Unverify toggle calling `set_store_blue_verified_manual`.
- Search by name/slug, same look as the existing users table.

### 7. Tests
New `src/components/__tests__/VerifiedBadge.test.tsx`:
- Renders SVG with `aria-label="Verified account"`.
- Tooltip text appears on hover.
- Honors `size`, `className`, custom `tooltipText`.
- Snapshot for default render.

New `src/test/verification-surfaces.test.tsx` — integration-ish using react-testing-library + fixture data:
- Feed card shows badge when `author_is_verified`.
- Reels overlay shows badge for both verified user and verified store.
- CommentsSheet shows badge per-commenter.
- SuggestedUsersCarousel shows badge.
- PublicProfilePage shows badge in name row + on avatar corner.
- Negative case: when `is_verified` is `null`/`undefined`/`false` → no badge rendered.

Helper: `src/test/fixtures/profiles.ts` exporting `verifiedUser`, `unverifiedUser`, `verifiedStore`.

## Files

**New**
- `src/lib/verification.ts`
- `src/hooks/useVerifiedStatus.ts`
- `src/hooks/useVerificationRealtime.ts`
- `src/components/__tests__/VerifiedBadge.test.tsx`
- `src/test/verification-surfaces.test.tsx`
- `src/test/fixtures/profiles.ts`

**Edited**
- `src/components/VerifiedBadge.tsx` (tooltip + aria + props)
- `src/App.tsx` (mount realtime hook)
- `src/pages/admin/AdminUsersPage.tsx` (add stores section)
- `src/pages/ReelsFeedPage.tsx` (drop hard-coded store-verified, use `isBlueVerified`, fetch store `is_verified`)
- `src/pages/FeedPage.tsx` (same — fetch from `store_profiles.is_verified`)
- `src/pages/PublicProfilePage.tsx` (use helper)
- `src/components/social/CommentsSheet.tsx`, `SuggestedUsersCarousel.tsx`, `FollowSuggestions.tsx`, `CreatePostModal.tsx` (use `isBlueVerified`)

**Migration**
- `store_profiles.is_verified/verified_at/verified_by` columns
- `set_store_blue_verified_manual` RPC

## Out of scope

- A user-facing "request verification" form for stores (the backend is ready; UI can ship later).
- Changing the badge visual — already approved.
- Verification badges for non-account entities (rides, products, etc).
