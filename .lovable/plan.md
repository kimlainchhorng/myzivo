# Phase 10 — Polish, Type Safety & Final Hardening

The lodging admin sweep (Phases 1–8) and the SECURITY DEFINER lockdown (Phase 9) are done. Linter went **732 → 55**, and the remaining 55 warnings are all expected (54 are the 56 RPCs we explicitly re-granted; 1 is the public-bucket finding deferred from Phase 9).

What's left is **technical debt and one real security finding**, plus the user is currently sitting on the `employee-rules` tab — worth giving that section the same audit treatment we gave the lodging sections.

## What's still worth fixing

```text
┌─ A. Public bucket listing (1 real WARN)         ─ security
├─ B. ~30 `as any` casts in lodging admin         ─ type safety / DX
├─ C. LodgingPropertyProfileSection.tsx (506 LOC) ─ maintainability
├─ D. StoreEmployeeRulesSection.tsx (293 LOC)     ─ audit current tab
└─ E. Verify Phase 9 didn't break any used RPC     ─ runtime regression check
```

The 54 "Public/Signed-In Users Can Execute SECURITY DEFINER Function" warnings are **intentional** — they're the 56 RPCs the app actually calls (`auth_precheck_login`, `accept_job_offer`, `mark_messages_read`, etc.). They should stay granted. We'll leave them as-is and document why in `SECURITY.md` so a future sweep doesn't try to "fix" them.

---

## A. Lock down the public bucket listing

The last real linter finding. One public bucket has a `storage.objects` SELECT policy broad enough to let anyone enumerate every object key in the bucket.

Steps:
1. Query `storage.buckets` + `pg_policies` on `storage.objects` to identify the offending bucket (likely `user-posts`, `user-stories`, or `store-assets`).
2. Replace its broad `SELECT` policy with one of:
   - `bucket_id = '<bucket>' AND (storage.foldername(name))[1] = auth.uid()::text` (owner-folder pattern), or
   - keep individual object reads working via signed/public URLs but deny `LIST` operations by removing the wildcard SELECT.
3. Re-run `supabase--linter` — must drop to **54** (the expected RPCs) with **0 real findings**.

## B. Remove the `as any` debt in lodging admin

About 30 casts cluster in 8 files, all caused by tables added after the last `src/integrations/supabase/types.ts` regeneration: `lodge_property_profiles`, `lodge_payout_requests`, `lodge_room_blocks`, `lodging_reviews`, `lodging_housekeeping_*`.

Approach:
1. Regenerate `src/integrations/supabase/types.ts` from the live schema (Lovable handles this automatically — no manual edit; it's read-only).
2. In each file below, drop the `(supabase as any)` and `as any` row casts where the new types now cover them:
   - `LodgingPoliciesSection.tsx` (8 casts)
   - `LodgingCalendarSection.tsx` (4 casts)
   - `LodgingHousekeepingSection.tsx` (3 casts)
   - `LodgingReviewsSection.tsx` (2 casts)
   - `LodgingGallerySection.tsx`, `LodgingOverviewSection.tsx`, `LodgingPayoutsSection.tsx`, `LodgingPayoutHistoryTable.tsx`, `WalkInBookingSheet.tsx`, `LodgingReservationsSection.tsx` (1–3 each)
3. Leave casts that are intentional (e.g. `import.meta as any` for env, dynamic key indexing in `PropertyCompletenessMeter`).
4. Run `tsc --noEmit -p tsconfig.app.json` — must stay clean.

## C. Split LodgingPropertyProfileSection (506 LOC)

A `property-profile/` subfolder already exists — extract the natural sub-blocks into it:

```text
property-profile/
  BasicInfoCard.tsx         (name, type, description, year built)
  ContactCard.tsx           (phone, email, website, social)
  AddressCard.tsx           (street, city, region, postal, country, lat/lng)
  PoliciesQuickCard.tsx     (check-in/out times, languages)
  HighlightsCard.tsx        (USPs, awards, accessibility chips)
  index.ts                  (re-exports)
```

Parent `LodgingPropertyProfileSection.tsx` becomes ~80–120 LOC: load profile, hold form state, render the cards, save.

## D. Audit `StoreEmployeeRulesSection.tsx` (current tab)

The user is on `?tab=employee-rules` — give it the same treatment as the 28 lodging sections:
- Verify it has empty state, loading skeleton, error toast, and save toast.
- Verify any RPC it uses is in the 56-RPC allowlist (otherwise Phase 9 broke it).
- Verify mobile width on this 1306px viewport (no overflow, sticky header behaves).
- File is 293 LOC — manageable; only refactor if a clear seam exists.

## E. Phase 9 regression sweep

Open the network tab on these flows and confirm no `permission denied for function` errors:

```text
1. Login (auth_precheck_login, auth_record_login_attempt) — anon path
2. /admin/stores/<id>?tab=lodge-frontdesk — change a reservation status
3. /admin/stores/<id>?tab=lodge-payouts — open request payout sheet
4. /chat — mark_messages_read, get_friend_count
5. /feed — feed ranking RPCs
```

If any RPC errors with `permission denied`, add it to the allowlist in a tiny follow-up migration.

---

## Files (planned)

Migrations (1):
- `supabase/migrations/<ts>_bucket_listing_lockdown.sql` — tighten one storage.objects SELECT policy

Code (refactor + de-anyify):
- `src/integrations/supabase/types.ts` — regenerated (auto)
- `src/components/admin/store/lodging/LodgingPropertyProfileSection.tsx` — slimmed
- `src/components/admin/store/lodging/property-profile/*.tsx` — new sub-cards
- `src/components/admin/store/lodging/LodgingPoliciesSection.tsx`
- `src/components/admin/store/lodging/LodgingCalendarSection.tsx`
- `src/components/admin/store/lodging/LodgingHousekeepingSection.tsx`
- `src/components/admin/store/lodging/LodgingReviewsSection.tsx`
- `src/components/admin/store/lodging/LodgingGallerySection.tsx`
- `src/components/admin/store/lodging/LodgingOverviewSection.tsx`
- `src/components/admin/store/lodging/LodgingPayoutsSection.tsx`
- `src/components/admin/store/lodging/LodgingPayoutHistoryTable.tsx`
- `src/components/admin/store/lodging/LodgingReservationsSection.tsx`
- `src/components/admin/store/lodging/WalkInBookingSheet.tsx`
- `src/components/admin/store/StoreEmployeeRulesSection.tsx` — only if audit finds gaps

Docs:
- `SECURITY.md` — note that the 54 remaining linter warnings are intentional re-grants
- `.lovable/plan.md` — Phase 10 entry

## Verification

1. `supabase--linter` → 54 warnings, 0 unexpected
2. `tsc --noEmit -p tsconfig.app.json` → 0 errors
3. `rg "as any" src/components/admin/store/lodging/ | wc -l` → drops from ~30 to ≤8 (intentional ones only)
4. `wc -l src/components/admin/store/lodging/LodgingPropertyProfileSection.tsx` → < 150
5. Manual smoke in preview: each of the 5 flows in section E succeeds, no console errors.

## Outcome

After Phase 10: zero real linter findings, no public bucket leaking object names, ~75% fewer `as any` casts in the lodging admin, Property Profile maintainable, and confirmation that Phase 9 didn't silently break anything in production paths.

## Suggested order

A → E → B → C → D, so security and regression-safety land first, then DX, then refactor, then the per-tab audit.

---

**Ready to proceed?** Or do you want to skip any section (e.g., defer the Property Profile split, or skip the employee-rules audit)?
