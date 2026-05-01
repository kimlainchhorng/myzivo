## Goal

Make the Live page show **only real data**. Hide every section and decoration that's still using mock/Unsplash placeholders until a real backend exists.

## Why

The previous pass added a feature-flag system but only wired flags around ~6 sections. The page still has **40+ unflagged sections** and several mock decorations inside the live watcher (Watch next grid, Top Fans avatars, pinned welcome, gift goal bar, fake Follow button). All of these render hardcoded Unsplash photos and fake names — that's what looks fake.

## What to change

### 1. Expand the feature-flag registry

Update `src/config/liveFeatureFlags.ts` to cover every mock-only section currently rendered in `LiveStreamPage.tsx`. All new flags default to `false`.

New flags to add:
- `newsTicker`, `liveNowStories`, `followingTicker`, `countryPicker`, `dailyRewards`
- `pkBattlesGrid`, `trendingHashtags`, `voiceRoomsGrid`
- `liveEvents`, `miniGames`, `liveShopping`, `newFaces`
- `replays`, `pkSeasonRanking`, `agencySpotlight`, `arStudio`, `datingLive`
- `becomeHostPromo`, `auctions`, `studyRooms`
- `dailyMissions`, `upcomingScheduled`
- `gameHub`, `petLive`, `travelLive`, `hotNews`, `sportsLive`, `zodiacLive`
- `djMixRooms`, `comedyLive`, `quizLive`
- `creatorOfDay`, `risingStars`, `cosplayLive`, `asmrRooms`, `cryptoLive`, `magicLive`
- `coinRechargePromo`, `categoriesGrid`, `topCreatorsBoard`, `multiGuestRecommended`

### 2. Wrap each section in its flag

In `src/pages/LiveStreamPage.tsx`, wrap every mock section (lines 1244 → 3288, per the section-comment markers) with `{LIVE_FEATURE_FLAGS.<flag> && ( … )}`. The two real-data sections (`recentlyWatched`, `topGifters`) already work and stay enabled.

### 3. Clean the live watcher overlay

Remove these mock decorations from inside the `LiveWatcher` component so the live video view stops showing fake people:
- **"Watch next" recommendation grid** (lines ~474–507): replace with a single "Back to Live" button only — until we build a real recommendations query.
- **"Top Fans" floating overlay** with 3 hardcoded Unsplash avatars (lines ~628–646): remove entirely. We'll re-add it later wired to `live_gift_displays` for the current stream.
- **Pinned welcome message** "Welcome — hit follow if you're new" (lines ~610–626): remove. Will return when host-pinned messages have a backend.
- **Gift Goal progress bar** showing a hardcoded `4,280/10K` (lines ~598–607): remove. Will return when stream gift goals are stored.
- **Follow button** in the top bar (lines ~570–578): remove the toggle (it's purely client state with no DB write). Re-add later when wired to the existing `follows` table.

### 4. Visual result

After this pass, the Live page renders only:
- Live streams list pulled from `live_streams`
- The user's own Recently Watched (real)
- Top Gifters from real gift events (real)
- Empty-state messaging where there is no real data yet

Everything else stays in the codebase but is hidden behind a single flag flip per section, so we can re-enable each one the moment its backend ships.

## Files touched

- `src/config/liveFeatureFlags.ts` — add ~35 new flags, all default `false`
- `src/pages/LiveStreamPage.tsx` — wrap 35+ sections in flag guards; remove 5 mock blocks from the watcher overlay

No DB migrations. No new hooks. No design changes to the surviving real-data sections.
