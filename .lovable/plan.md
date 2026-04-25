# Account flow polish — round 5

After looking at the screenshots, the main complaint is that on `/profile` mobile **the user has to scroll down a lot to see anything useful** — there's a giant blank/loading area before the content tabs. Plus a few more bugs and missing pieces across the account flow.

## What's wrong (from the screenshots + audit)

### A) `/profile` mobile — too much wasted vertical space
1. **`ParallaxSection` initial offset** wraps the profile card with `initial={{ opacity: 0, y: 50 }}` and `whileInView` triggers. On a slow mount the card is invisible/translated for the first ~600 ms, so the user sees a giant blank area until the animation settles. **Disable parallax for the hero profile card** (or render it instantly with no `whileInView`).
2. **`ProfileContentTabs` shows a tall white loading area** when the user has no posts yet. The empty state just displays a tiny "No posts" line in the middle of a viewport-tall container, leaving most of the screen blank (this is the big blank gap in `IMG_2170`). Replace with a compact friendly empty state (icon + headline + "Create your first post" CTA) anchored at the top of the tab panel — no `min-h-screen` filler.
3. **"Your story" tile is the only thing visible mid-page**, floating alone with huge padding around it. Tighten `ProfileStories` empty-state padding so it sits flush under the profile card.
4. **Cover photo height** — `h-48 sm:h-56 md:h-60` (192–240 px) is fine, but combined with the avatar `-mt-11 px-6` block and the long bio/edit/stats stack, the first viewport (≈ 700 px) is fully consumed before any post or tab appears. **Reduce mobile cover to `h-40` (160 px)** and tighten the spacing between cover→avatar→name→bio→stats→tabs.
5. **Sticky header back button on `/profile`** — when arriving from bottom-nav "Account" there is no history; back navigates to a previous, sometimes irrelevant page. Fall back to `/feed` if `window.history.length <= 1`.

### B) `/profile` — buttons / actions that look but don't work
6. **"Your story" tile** (the only story shown when user has none) has no handler — tapping it does nothing. Wire it to open the story creator at `/stories/new` (or whatever the existing story-create route is).
7. **Avatar camera button** works, **but the cover-photo "change cover" button** silently fails on Safari iOS when the file input has no `click()` polyfill — confirm by adding `accept="image/*"` (already there) and ensure the input is appended to body. Also: after upload show a success toast (currently silent).
8. **Bio "Add bio" pill** is good, but the **save** action does not give the input focus when reopened and the textarea has no character counter — add `0/160` counter under the field.
9. **"Get blue verified" pill** is great, but on tap it pushes to `/account/verification` — confirm the page exists and renders (it's listed in `src/pages/account/VerificationRequestPage.tsx`); if it errors, show a graceful fallback toast.

### C) `/more` — leftover issues from round 4
10. **Settings hub link** in profile-card area still points users to the global Settings; users searching the new search bar for "edit profile" should also surface the profile-card edit path. Index profile-card actions in the search.
11. **Profile-card mini-card on `/more`** has no avatar fallback color (just default gray) — match the verified ring style used on `/profile`.
12. **`/more` Switch Account confirm** — the dialog text says "you'll be signed out" but on iOS PWA `signOut()` can leave a stale Supabase session in localStorage; explicitly clear `localStorage` keys starting with `sb-` before redirecting.
13. **`/more` Theme toggle** uses `next-themes` `setTheme(next)` — confirm the `<ThemeProvider>` wraps the app at root; if not, the row toggles invisibly. Add the provider if missing.

### D) Missing / broken sub-pages reached from `/more`
14. **`/account/security`** — Two-Factor Auth and Login & Devices both link here. Audit: does the page actually have a 2FA section + sessions list? If only the password section exists, add stub sections so taps don't dead-end.
15. **`/account/privacy#blocked`** — passing `#blocked` does nothing unless the page reads `location.hash` and scrolls. Add a `useEffect` in `PrivacySettingsPage` that scrolls to the matching `id`.
16. **"Delete Account"** — added in round 4. Verify `/profile/delete-account` route exists and renders without errors; if it 404s, build a minimal page (warning + 30-day grace explanation + confirm button calling `delete-account` edge function).
17. **"Get App"** → `/install` — verify route exists; if not, build a simple install/PWA-instructions page.
18. **"Help Center"** → `/help` — verify route; if missing, add a lightweight FAQ + contact-support page.
19. **"Safety Center"** → `/safety` — verify route; if missing, add a basic safety/abuse-reporting landing page.

### E) New polish + add-ons
20. **Add a tiny "Quick Actions" row** below the profile card on `/profile`: `Edit profile · Share profile · Insights · Settings` (4 pill buttons), so users don't have to dig into `/more` for common actions.
21. **Add a real "Share profile" sheet** on `/profile` — copy link, QR, native share — wired to the existing `/qr-profile` flow.
22. **Cover photo overlay gradient** is a bit heavy on light mode, washing out the cover. Reduce gradient opacity on light theme.
23. **Avatar ring color** — currently `ring-card` (background-colored), invisible against cover. Switch to `ring-background` and keep the primary glow.

## Files to edit / create

Edit:
- `src/pages/Profile.tsx` — disable parallax wrapper on hero card, tighten spacing, reduce cover height, wire Your story tile, add Quick Actions row, add Share sheet, history fallback, character counter.
- `src/components/profile/ProfileContentTabs.tsx` — compact empty state, remove `min-h-screen` filler.
- `src/components/profile/ProfileStories.tsx` — tighten empty-state padding, wire onClick to open story creator.
- `src/pages/MorePage.tsx` — index profile-card actions in search, clear `sb-*` localStorage on switch, avatar ring polish.
- `src/pages/account/PrivacySettingsPage.tsx` — read `location.hash`, scroll to anchor.

Create (only if route is missing — verify first):
- `src/pages/account/DeleteAccountPage.tsx` (route `/profile/delete-account`).
- `src/pages/InstallPage.tsx` (route `/install`).
- `src/pages/HelpCenterPage.tsx` (route `/help`).
- `src/pages/SafetyCenterPage.tsx` (route `/safety`).
- Add any missing 2FA / sessions sections to `src/pages/account/AccountSecurity.tsx`.

## Verification (after build)
- Open `/profile` on a 390×844 viewport — within the first viewport you should see: cover (160 px), avatar, name + verified, bio pill, stats, and the new Quick Actions row. No giant blank gap before tabs.
- Tap "Your story" tile → story creator opens (or graceful "Coming soon" toast).
- Tap "Share profile" pill → bottom sheet with Copy link / QR / Native share.
- On `/more` search, type "edit profile" → profile-card edit appears in results.
- Tap "Two-Factor Auth" on `/more` → lands on `/account/security` and the 2FA section is visible.
- Tap "Blocked Users" → `/account/privacy` opens and auto-scrolls to the Blocked section.
- All four bottom links (Help, Safety, Install, Delete) load real pages (no 404).

## Out of scope
- Re-skinning the entire profile (only the spacing/blank-area fix here).
- Building real 2FA enrollment flow (just the section UI + "Coming soon" if backend isn't there).
- Real multi-account picker.
