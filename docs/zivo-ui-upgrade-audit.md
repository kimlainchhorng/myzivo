# ZIVO UI Upgrade Audit

## Current App Shape

ZIVO is a Vite, React, TypeScript, Tailwind v4, shadcn/radix super-app with large route families for social feed, reels, chat, rides, eats, hotels, shopping, marketplace, creator tools, partner/admin dashboards, account settings, and mobile Capacitor shells.

The feed already has the strongest social foundation:

- `/feed` renders the Instagram/Facebook-style social feed.
- `/reels` renders the full-screen short-video experience.
- `/chat` supports DMs, groups, requests, bots, folders, settings, saved messages, media, calls, and unread state.
- The shell has desktop top navigation, a desktop feed sidebar, a right rail, and mobile bottom navigation.

## UX Gaps Found

- The website has many feature routes, but the user journey can feel like separate apps instead of one ZIVO workflow.
- Feed, Reels, Chat, Rides, Eats, Marketplace, and Services need clearer handoffs: create content, start conversation, transact, then return to feed.
- Guest users need a softer social onboarding path that explains why to log in without pushing content below the fold too much.
- Desktop right rail was mostly shortcuts and promos; it needed an action workflow layer.
- Chat unread state exists in chat and mobile feed header, but should remain visible across desktop social navigation.
- Creator and commerce actions need stronger Instagram-style entry points: story, reel, post, live, shop, jobs.

## First Upgrade Pass

- Added desktop Chat unread badge in `src/components/home/NavBar.tsx`.
- Added a feed guest CTA and creator workflow strip in `src/pages/ReelsFeedPage.tsx`.
- Added a desktop right-rail workflow panel:
  - `Today on ZIVO`: DMs, Alerts, Live, Create.
  - `Post a reel`: starts the reel composer.
  - `Start a chat`: opens chat or login redirect.
  - `Book from feed`: jumps into services.
  - `Build your loop`: Share -> Connect -> Convert.

## Recommended Build Roadmap

1. Social shell
   - Finish Instagram-style feed spacing, story rail, composer, right rail, and mobile bottom nav parity.
   - Keep content first; avoid marketing blocks on app screens.

2. Cross-app workflow
   - Add persistent workflow state for content -> chat -> booking/order.
   - Surface active trip/order/chat reminders in feed and app home.

3. Creator commerce
   - Add shoppable reel/product attachment prompts.
   - Add creator dashboard shortcuts from feed posts and profile.

4. Search and discovery
   - Unify feed search, global app search, people search, stores, places, services, and hashtags.
   - Add recent searches and suggested workflows.

5. Mobile polish
   - Tighten safe-area behavior, bottom nav badges, sticky headers, and post/reel handoffs.
   - Validate at 390px, 430px, tablet, and desktop.

6. Design system cleanup
   - Consolidate repeated badges, counters, action rows, right-rail panels, and social cards.
   - Keep shadcn primitives for dialogs, sheets, avatars, buttons, tabs, badges, skeletons, and menus.

## Verification Checklist

- `npx tsc --noEmit --pretty false`
- Desktop feed at `1440x926`
- Current in-app browser viewport
- Mobile feed at common phone widths
- Login redirects for guest actions
- Chat and notification badges with zero, single digit, double digit, and `99+`
- No browser console errors after reload
