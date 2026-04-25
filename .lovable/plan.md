# Story Viewer Polish + E2E Coverage

Tighten the fullscreen story overlay so nothing underneath leaks through during the open animation, make sure the "Your story" ring renders correctly for text-only and media stories at every breakpoint, harden the portal against SSR/build edge cases, and add a Playwright test that locks in the single-header / single-control invariants.

---

## 1. Block underlying UI during the entrance animation

File: `src/components/stories/StoryViewer.tsx`

- The motion wrapper currently animates `opacity 0 → 1` + `scale 0.95 → 1`. During that 200ms the Profile page (parallax sections, action buttons) is partially visible and still receives pointer events.
- Wrap the portal in a non-animated `fixed inset-0 z-[1600]` shell that is opaque (`bg-black`) from frame 0, then run the existing `motion.div` (with the media + chrome) inside it. The shell guarantees the underlying page is covered and clicks are captured the instant the viewer mounts, even before Framer's first animation frame.
- Add `pointer-events-auto` and `touch-none` on the shell, and `overscroll-contain` so background scroll cannot bleed through on mobile Safari.
- Ensure `data-story-open="true"` is set synchronously on `document.body` in a `useLayoutEffect` (not `useEffect`) so the bottom mobile nav hides on the same paint as the viewer appears.

## 2. SSR-safe portal

File: `src/components/stories/StoryViewer.tsx`

- Before calling `createPortal`, guard with `typeof document === "undefined" || !document.body` → return `null`. This prevents runtime errors in any SSR/prerender/build pipeline that imports the component.

## 3. Story ring thumbnail sizing

File: `src/components/social/FeedStoryRing.tsx` (and `src/components/profile/ProfileStories.tsx`, `src/components/chat/ChatStories.tsx` if they share the same pattern)

- The "Your story" ring renders the latest media (`<img>` / `<video>`) inside a 64×64 circular container, but text-only stories (no `media_url`, only `text_overlay`) currently fall through to the avatar. Treat text-only stories explicitly:
  - If `mediaType === "text"` (or `mediaUrl` is empty), render a centered gradient tile with a clamped 1-line preview of `caption` / `text_overlay` instead of the avatar.
- Normalize the inner container so all three states (image, video, text) share identical sizing:
  - Outer ring stays `h-[64px] w-[64px] p-[2.5px]`.
  - Inner tile uses `h-full w-full rounded-full overflow-hidden` with `object-cover` on media and `flex items-center justify-center` for text.
- Audit the ProfileStories carousel for the same pattern at its responsive sizes (compact mobile vs. desktop) and apply the same normalization so padding/scale don't shift between breakpoints.

## 4. Playwright test: single header & controls

New file: `tests/e2e/story-viewer.spec.ts`

- Use the existing config (`baseURL` + dev server). Sign in via storage state if the suite already has a fixture; otherwise stub `localStorage` auth using the same approach as `swipe-close.spec.ts`.
- Test flow:
  1. Navigate to `/profile`.
  2. Click the user's story ring (or a known seeded ring via `data-testid`).
  3. Wait for the viewer (`[data-testid="story-viewer"]`) — add this `data-testid` on the motion shell.
  4. Assert exactly one of each:
     - `await expect(page.locator('[data-testid="story-close"]')).toHaveCount(1)`
     - `await expect(page.locator('[data-testid="story-pause"]')).toHaveCount(1)`
     - `await expect(page.locator('[data-testid="story-header"]')).toHaveCount(1)`
- Add the corresponding `data-testid` attributes in `StoryViewer.tsx` (header bar, close button, pause/play button) so the test has stable selectors. No visual change.

## 5. Manual re-verification (after build)

After the changes deploy, run a quick browser pass on:
- `/profile` — open own story, confirm overlay is opaque from first frame, only one header / close / pause is visible.
- `/feed` — open another user's story from the rings.
- `/chat` — open a story from `ChatStories`.

Confirm in each: no duplicate header, no underlying buttons clickable, fullscreen on iPhone-sized viewport (390×844).

---

## Files touched

- `src/components/stories/StoryViewer.tsx` — opaque shell wrapper, SSR-safe portal guard, `useLayoutEffect` for body flag, `data-testid`s.
- `src/components/social/FeedStoryRing.tsx` — text-only ring state, normalized sizing.
- `src/components/profile/ProfileStories.tsx` — same ring normalization (if pattern present).
- `src/components/chat/ChatStories.tsx` — same ring normalization (if pattern present).
- `tests/e2e/story-viewer.spec.ts` — new Playwright spec.

No database, RLS, or edge-function changes required.
