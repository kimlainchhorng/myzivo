## Final safe-area sweep

Audited every `sticky top-0` element in the codebase. After the previous batches, **15 real mobile headers** still lack safe-area padding, plus a few using inline `paddingTop: var(...)` that should be standardized.

### Files to update (add `pt-safe`)

**Shared chat components (used as fullscreen panels on mobile):**
- `src/components/chat/ChatSearch.tsx` (line 54)
- `src/components/chat/ChatNotificationSettings.tsx` (line 161)
- `src/components/chat/ChatMiniApps.tsx` (line 215)
- `src/components/chat/ChatSecurity.tsx` (line 150)
- `src/components/chat/StickerKeyboard.tsx` (line 886) — only when used as fullscreen; safe to add since it just adds top padding when at top of screen

**Pages:**
- `src/pages/ChatHubPage.tsx` (line 1149) — conditional sticky branch
- `src/pages/MorePage.tsx` (line 542)
- `src/pages/PublicProfilePage.tsx` (line 1212) — drag handle header
- `src/pages/Profile.tsx` (line 710)
- `src/pages/business/PartnerOnboarding.tsx` (line 177)
- `src/pages/business/BusinessPageWizard.tsx` (line 466)
- `src/pages/app/personal/PersonalSchedulePage.tsx` (line 186)
- `src/pages/admin/lodging/AdminLodgingReservationDetailPage.tsx` (line 260)
- `src/components/profile/SocialListModal.tsx` (line 234)

**Standardize inline style → class:**
- `src/pages/ReelsFeedPage.tsx` (line 713) — replace inline `style={{ paddingTop: 'var(--zivo-safe-top-sticky)' }}` with `pt-safe` class for consistency

### Excluded (intentionally)

- `src/components/admin/AdminLayout.tsx`, `StoreOwnerLayout.tsx` — desktop sidebars
- `src/components/admin/ads/ResponsiveBreakdown.tsx` — table `<thead>`
- `src/components/social/CreatePostModal.tsx` — modal inside dialog (no status bar overlap)
- `src/pages/PublicProfilePage.tsx` line 809 — `hidden lg:block` (desktop only)
- `src/components/admin/store/lodging/LodgingPropertyProfileSection.tsx` — admin desktop section
- `src/pages/dev/SafeAreaQAPage.tsx` — QA harness page

### Change pattern

Append `pt-safe` to each header's className. Where `pt-4`/`py-3` is already present, the global `!important` rule from the previous fix ensures `pt-safe` wins.

### Verify

- `bunx tsc --noEmit`
- Spot-check Profile, MorePage, ChatHub, PartnerOnboarding, ReelsFeed at 428×703 viewport.

### Expected result

This completes the safe-area pass — no remaining mobile sticky headers will sit under the iPhone status bar / Dynamic Island.
