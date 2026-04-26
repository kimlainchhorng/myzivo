# Sidebar Profile Card — Restore Verified Identity

## What happened (root cause)

Nothing was lost — two things on your profile row changed naturally over time, which made the new card look different from the old one:

1. **Old look ("ZIVO" + blue ✓)** — your `profile.full_name` was empty (or literally "ZIVO"), and `profile.is_verified` was `true`. The card displayed the brand-style placeholder with the blue check.
2. **New look ("kimlain Chhorng" + email, no ✓)** — `profile.full_name` is now populated with your real name (likely via Account → Edit profile, Google metadata, or a recent sync), and `profile.is_verified` is now `false`. The new sidebar code (Phase H) faithfully shows whatever the DB says.

The current code is technically correct, but the **result is worse than before**: lowercase casing, email exposed publicly on screen, and your verified status gone.

## What we'll fix

### 1. Hide email completely (privacy)
When no `@username` is claimed, do NOT fall back to email. Email belongs in Settings, not on a card visible to anyone glancing at your screen.

Replace fallback with:
- If `username` → show `@username`
- Else → show a subtle, tappable **"Set a username"** link that opens `/account/username` (or wherever the username setup lives — we'll grep for the existing route).

### 2. Auto-capitalize the display name
Render `kimlain Chhorng` → `Kimlain Chhorng` via a small title-case helper. Source of truth stays `profile.full_name`, but presentation is consistent regardless of how it was stored.

### 3. Restore the verified blue check for your account
- Re-enable `is_verified = true` on your profile row via a one-row migration (scoped strictly to `klainkonkat@gmail.com`).
- The badge logic itself is already correct — it just needs the DB flag back.

### 4. Optional: brand-name override for early/founder accounts
Add a tiny convention: if `profile.display_brand_name` is set (new optional column, nullable), show that **instead of** `full_name` in the card — so you (or any official ZIVO staff account) can render as "ZIVO" while keeping your real legal name in `full_name` for KYC/legal purposes.

This is the cleanest way to get the old "ZIVO" look back without overwriting your real name.

## Files to change

- `src/components/social/FeedSidebar.tsx` — update `displayName` resolution + subtitle line + add title-case helper. Apply same change to the mobile/collapsed variant (lines ~220–230).
- `src/lib/utils.ts` (or new `src/lib/formatName.ts`) — add `toTitleCase()` helper.
- New migration `supabase/migrations/<ts>_restore_verified_brandname.sql`:
  - `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_brand_name text;`
  - `UPDATE profiles SET is_verified = true, display_brand_name = 'ZIVO' WHERE id = (SELECT id FROM auth.users WHERE email = 'klainkonkat@gmail.com');`
- `src/integrations/supabase/types.ts` — regenerated automatically.

## What I will NOT do

- I will **not** log into your account with the password you shared. Sharing passwords in chat is unsafe — please rotate `Chhorng@1998` after this. All fixes can be done from code + a scoped one-row migration without ever signing in as you.
- I will not touch other users' `is_verified` flags.

## Result after approval

Your sidebar card will read:
```
[Avatar ●online]                    [Switch]
ZIVO  ✓                              ← brand name + blue verified
@kimlain   (or "Set a username")     ← no email exposed
[ View profile  › ]
```
