# Fix: Tapping "Your story" does nothing

## Root cause

When you tap your story ring, the click handler **does** fire and the fullscreen `StoryViewer` **does** mount and play its open animation — you just can't see it.

`src/components/stories/StoryViewer.tsx` line 449 renders the viewer at:

```
className="fixed inset-0 z-[100] bg-black"
```

But other UI on the same screen is layered far higher:

| Layer | z-index |
|---|---|
| StoryViewer (today) | **z-[100]** |
| ZivoMobileNav (bottom tab bar) | z-[1401] |
| CreateStorySheet scrim | z-[1500] |
| Toasts / sheets | z-[1000+] |

So the viewer paints **underneath** the mobile nav and any sticky profile chrome, which on a 428×703 viewport covers the entire visible area — making it look like "nothing happens" even though the URL flips to `?story=<id>` and the viewer is mounted.

This affects all three entry points (Profile, Feed, Chat) because they all render the same shared `StoryViewer`.

## Fix

Raise the StoryViewer to sit above every other in-app surface (nav, sheets, toasts) — same tier as other true fullscreen overlays.

### Change 1 — `src/components/stories/StoryViewer.tsx`

- Line 449: change `z-[100]` → `z-[1600]` (above CreateStorySheet at 1500 and mobile nav at 1401, below only critical system overlays like incoming-call full-screen).
- Apply the same z-tier to the `StoryForwardSheet` portal it spawns so the "Send to" sheet still sits on top of the viewer.

### Change 2 — Quick QA pass on sibling overlays

- Confirm `StoryForwardSheet` (rendered from inside the viewer) uses `>= z-[1700]` so it stacks above the viewer.
- Confirm `CommentsSheet` / viewers list overlay used inside StoryViewer also sits above `z-[1600]`.

### Change 3 (defensive) — close the body-scroll-lock + nav-hide

While the viewer is open, hide the bottom nav with `body[data-story-open="true"]` or simply set a flag that `ZivoMobileNav` reads, so it doesn't draw on top in the rare case a future overlay shares the same tier. Set the flag in StoryViewer's mount effect and clear on unmount.

## Why this is the right fix (not a click-handler bug)

- `openStory()` in `useStoryDeepLink` calls `setSearchParams({ story: <id> })` synchronously — verified.
- `useStoryViewerLocation` resolves the deep-link to `(groupIndex, storyIndex)` whenever the active story id is found in the loaded groups — verified your story IS in the carousel (RLS allows `expires_at > now()` for everyone, and a row exists in the DB).
- `StoryViewer` only early-returns when `viewingGroup` or `currentStory` is null — both are present.
- The only remaining failure mode is "renders but invisible," which the z-index inversion above explains exactly.

## Out of scope (noted, not fixing here)

- The unrelated React `forwardRef` warning on `ProfileFeedCard` from `AnimatePresence` — separate cleanup, doesn't block stories.
