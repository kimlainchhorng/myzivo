## What you're seeing in the video

In Telegram, when you scroll **down** the chat list, the "Stories" row (My Story, Telegram, BB Q Nich, Sky movie…) smoothly **collapses up and hides** behind the header, leaving only the search bar + filters visible. When you scroll **up** (or pull to top), the Stories row **slides back down** into view.

Right now in ZIVO, the `<ChatStories />` strip stays in the normal document flow above the search bar, so it just scrolls away with the rest of the page and doesn't reappear until you scroll all the way back to the top. That's why it feels "stuck"/non-native compared to Telegram.

## What I'll change

Make the Stories strip in `src/pages/ChatHubPage.tsx` behave exactly like Telegram:

1. **Collapse on scroll down** — once the user scrolls past ~20px, animate `<ChatStories />` to `height: 0` + `opacity: 0` (slide up).
2. **Expand on scroll up** — the moment scroll direction reverses (any upward delta > 4px), slide it back to full height + opacity 1.
3. **Always expanded at top** — when `scrollTop <= 4`, force expanded state (so pull-to-refresh still shows stories cleanly).
4. **Smooth motion** — use a single `framer-motion` `motion.div` wrapper with `animate={{ height, opacity }}` and a 220ms `easeOut` transition, matching the existing v2026 chat motion language.
5. **Search bar + filter chips stay put** — they remain in normal flow directly under the header, so collapsing Stories pulls the search bar up under the header just like Telegram.

## Technical details

- Add a `useScrollDirection` effect inside `ChatHubPage` that listens to `window` scroll (the page is the scroll container — `PullToRefresh` wraps `min-h-screen`, confirmed at line 2089).
- State: `const [storiesCollapsed, setStoriesCollapsed] = useState(false);` driven by `lastY` ref + direction delta.
- Wrap line 1219 `<Suspense><ChatStories /></Suspense>` in:
  ```tsx
  <motion.div
    animate={{ height: storiesCollapsed ? 0 : "auto", opacity: storiesCollapsed ? 0 : 1 }}
    transition={{ duration: 0.22, ease: "easeOut" }}
    style={{ overflow: "hidden" }}
  >
    <Suspense fallback={null}><ChatStories /></Suspense>
  </motion.div>
  ```
- Only enable the behavior when `!embedded` (same guard as today).
- No change to `ChatStories.tsx` itself — its compact 54px Telegram-style sizing stays.
- No change to search bar, filters, or chat rows.

## Out of scope

- No header/title collapse (Telegram's "Chats" title stays — yours will too).
- No change to the order of elements (Stories still sits above search).
- No change to PullToRefresh behavior.
