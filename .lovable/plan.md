# Instagram-style stories — full polish

Three changes, applied together.

## 1. IG gradient ring on all carousels

Replace the current avatar ring styling on **Feed, Profile, and Chat** so it matches Instagram exactly:

- Unseen ring: `bg-[conic-gradient(from_180deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888,#f09433)]` (the iconic IG sunset → magenta gradient).
- Seen ring: `bg-muted-foreground/25` (subtle grey).
- Avatar size: `h-[64px] w-[64px]`, `p-[2.5px]` ring thickness, inner `border-2 border-card`.
- "Your story" tile: same avatar with a **black `+` badge** at bottom-right (`bg-foreground`, white plus, `border-[2.5px] border-card`). Tapping it: opens viewer if a story exists, otherwise opens `CreateStorySheet`.
- Username below in `text-[11px]`, bold-foreground when unseen, medium-muted when seen.

Files:
- `src/components/social/FeedStoryRing.tsx`
- `src/components/profile/ProfileStories.tsx`
- `src/components/chat/ChatStories.tsx`

## 2. Owner action toolbar in StoryViewer (IG bottom row)

Today, when you view your own story, the right side shows generic Eye / Trash icons. Replace this with the **Instagram bottom row** for owners:

```
Activity  ·  Facebook  ·  Mention  ·  Send  ·  More
```

Layout: horizontal row docked at the bottom of the viewer (above safe-area), 5 equally-spaced buttons. Each = icon (24px, white) + label (11px, white).

Wiring:
| Button | Icon | Action |
|---|---|---|
| Activity | `BarChart2` | Opens existing viewers sheet (was Eye button) |
| Facebook | `Facebook` (lucide) | Calls `navigator.share` with Facebook intent fallback `https://www.facebook.com/sharer/sharer.php?u=<storyDeepLinkUrl>` |
| Mention | `AtSign` | Opens a small "Mention a friend" sheet that posts a story_comment of the form `@<friend>` (reuses existing `postComment` mutation + a friend picker query) |
| Send | `Send` | Opens existing `StoryForwardSheet` |
| More | `MoreHorizontal` | Opens an action sheet: **Save to device** · **Share to feed** · **Delete** (existing `deleteStory` mutation) |

Right-side floating Like/Comment/Share stack stays for **non-owners** only. Hide it for owners (replaced by the bottom row above).

The non-owner reply input ("Reply to {name}…") already exists and stays.

Files: `src/components/stories/StoryViewer.tsx` (replace `isOwner` block at lines 606-632 with the bottom toolbar; gate the Like/Comment/Share stack at 569-604 with `{!isOwner && (...)}`).

## 3. "Save to device" + small sub-sheet

For the "More" sheet's Save action, fetch `currentStory.mediaUrl`, blob it, and trigger an `<a download>` click — works on mobile Safari for images, prompts native share for video on iOS.

## Out of scope

- Story creation flow, viewer, deep-link routing — unchanged.
- Bottom-nav z-index hide — already shipped.
- Real-time delivery for mentions (just inserts a `story_comments` row tagging the mentioned user; push notification piggybacks on existing comment trigger if present).

## Files touched

- `src/components/social/FeedStoryRing.tsx` — ring restyle
- `src/components/profile/ProfileStories.tsx` — ring restyle
- `src/components/chat/ChatStories.tsx` — ring restyle
- `src/components/stories/StoryViewer.tsx` — owner toolbar + hide right stack for owners + More sheet + Mention sheet + Save handler
