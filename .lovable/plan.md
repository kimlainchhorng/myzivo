# Polish Feed & Profile post cards

Make captions, like/comment/share counts, and the "View all comments" link behave and look identical across the Reels feed (`ReelsFeedPage.tsx`) and the Profile "All" tab (`ProfileFeedCard.tsx`), then verify on mobile widths.

## 1. Reliable inline "See more" truncation

The current implementation puts "… See more" inside a `line-clamp-3` block, so when the caption fills the clamp it gets clipped along with the rest of the text and never appears.

Fix: introduce a small shared component `CollapsibleCaption` used everywhere a caption is rendered.

Behavior:
- Collapsed: render the caption with `line-clamp-3` (or `line-clamp-2` for the dark Reels overlay variant).
- After mount, measure with a `ResizeObserver` whether the text is actually overflowing (`scrollHeight > clientHeight`). Only then render an inline `… See more` link positioned at the end of the last visible line using a `::after` pseudo-element trick (absolute-positioned span with a gradient mask fading from transparent to `bg-card`, so it overlays the truncated tail cleanly).
- Expanded: full text + a trailing inline `See less` in muted color.
- Tap target uses a real `<button>` so it stays accessible; clicking the caption body itself does NOT toggle (prevents accidental expand when scrolling).

Apply to:
- Sharer caption + embedded original caption in `ReelsFeedPage.tsx` (lines ~2113 and ~2181).
- Sharer caption, embedded original caption, and own caption in `ProfileFeedCard.tsx` (lines ~170, ~224, ~304).
- Dark overlay caption inside the fullscreen Reels viewer (line ~1487) — uses the variant with white text + lighter gradient mask.

## 2. Engagement counts: consistent formatting + zero-state

Create a shared helper `formatCount(n)`:
```
0           → null (don't render number)
1–999       → "1", "42", "999"
1,000–9,999 → "1.2k"
10k–999k    → "12k"
≥1M         → "1.2M"
```

Apply consistently to like / comment / share buttons in both `ReelsFeedPage.tsx` (lines ~2542–2580) and `ProfileFeedCard.tsx` (lines ~370–404).

Zero-state rules (matches Instagram/Facebook):
- Like button: always show icon. Show count only when > 0.
- Comment button: always show icon. Show count only when > 0 AND comments aren't disabled.
- Share button: always show icon. Show count only when > 0.

This removes the awkward `0` next to icons and keeps the row tight when a post has no engagement yet.

## 3. "View all comments" link styling

Promote the link from plain muted text to a clearer affordance:

- Show only when `commentsCount > 0` (already correct in feed; profile already gates on `> 0`).
- Style: `text-[13px] text-muted-foreground font-medium`, with a subtle hover/active state (`active:text-foreground`).
- Copy:
  - 1 comment → "View 1 comment"
  - 2–999 → "View all 12 comments"
  - ≥1k → "View all 1.2k comments"
- Position: directly under the action row, before the comments sheet trigger area, with consistent `px-3 pb-2` spacing.
- Hidden when `commentSetting === "off"` (replaced by the existing "Comments are turned off" pill).
- Add to the embedded original post inside shared cards too, if the original has comments — currently only the outer share has it.

## 4. Responsive verification

After implementation, take screenshots at 320×568, 375×812, 390×844, and 414×896 of both `/feed` and `/profile` to confirm:
- Caption "See more" stays inline on the last visible line at every width (no orphan word, no wrap).
- Engagement row never wraps — icons + counts stay on one line; bookmark stays right-aligned.
- "View all comments" sits correctly above the bottom nav with the safe-area padding the `AppLayout` already provides.
- Shared post card edges stay flush (no horizontal margin regression).

## Technical notes

Files touched:
- New: `src/components/social/CollapsibleCaption.tsx` (shared truncation component with overflow detection).
- New: `src/lib/social/formatCount.ts` (shared count formatter, exported as `formatCount`).
- `src/pages/ReelsFeedPage.tsx` — replace 3 inline caption blocks (sharer, original, dark overlay) with `CollapsibleCaption`; swap inline count math for `formatCount`; update "View all comments" copy + style.
- `src/components/profile/ProfileFeedCard.tsx` — replace 3 inline caption blocks with `CollapsibleCaption`; swap inline count math for `formatCount`; update "View all comments" copy + style; show share count when present.

The `CollapsibleCaption` overflow-detection trick:
```text
[caption clamped to 3 lines........................]
[lorem ipsum dolor sit amet consectetur adipiscing]
[elit sed do eiusmod tempor incididunt ut labore  ]
[et dolore magna aliqua ut enim ad mi… See more   ]
                                       ^^^^^^^^^^
                              absolutely-positioned span,
                              right-aligned on last line,
                              with bg-card gradient mask
                              fading in from the left
```

No DB or routing changes. No new dependencies.
