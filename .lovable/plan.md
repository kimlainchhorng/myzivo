# Polish: A11y, Loading Skeletons, Responsive, Deep-Linked Comments

Four focused improvements to the social feed (Reels + Profile) without changing the existing visual design.

## 1. Accessibility for engagement actions

Add screen-reader text and `aria-label`s to every interactive element in the action row + comments link, so totals are announced (e.g. "Like post, 1.2k likes" instead of just an icon).

Changes in `src/pages/ReelsFeedPage.tsx` (FeedCard action row, ~L2528–2597) and `src/components/profile/ProfileFeedCard.tsx` (~L357–399):

- **Like button** — `aria-label={liked ? "Unlike post" : "Like post"}` + `aria-pressed={liked}`. Append `, {n} likes` when count > 0.
- **Comment button** — `aria-label="Open comments, {n} comments"` (omit count when 0).
- **Share button** — `aria-label="Share post, {n} shares"`.
- **Bookmark button** — `aria-label={saved ? "Remove bookmark" : "Save post"}` + `aria-pressed`.
- **Reaction emojis** — `aria-label={`React with ${emoji}`}` on each picker button; container gets `role="toolbar" aria-label="Reactions"`.
- **View all comments link** — promote from `<button>`/`<p>` to a real `<a href="...">` (see §4) with `aria-label={`View all ${n} comments on this post`}`.
- **Visible counts** — keep visible numerals; wrap aria-only context in `<span className="sr-only">` so the visual stays clean.

Also update `CollapsibleCaption` (`src/components/social/CollapsibleCaption.tsx`) to set `aria-expanded` on the See more / See less buttons and `aria-label="Show full caption" / "Collapse caption"`.

## 2. Skeleton placeholders for loading states

Right now the action row and comments link render with `0`/missing data while the post object resolves, causing a brief empty-flash. Add a tiny skeleton component used while a post is hydrating its engagement counts.

- New file `src/components/social/EngagementSkeleton.tsx` — three pill-shaped `Skeleton` blocks (heart/comment/share widths) + a thin one-line bar mimicking "View all comments". Reuses `@/components/ui/skeleton` (already shimmer-animated).
- In `ReelsFeedPage.tsx` FeedCard, render `<EngagementSkeleton />` instead of the action row when the parent feed `isLoading` is true OR when `item` was just inserted optimistically and counts are still `undefined`. Same pattern in `ProfileFeedCard.tsx`.
- For the comments modal first-open: in `CommentsSheet.tsx`, when `loading` is true and `comments.length === 0`, render 3 skeleton rows (avatar circle + 2 text lines) instead of the current empty state, so the sheet doesn't briefly flash blank.

## 3. Responsive verification (360px and iPad)

Audit and fix any overlap of action row, "… See more" mask, and bottom navigation at narrow widths and tablet widths.

- **360px (small Android)**: shrink the action-row horizontal padding from `px-3` to `px-2.5` and reduce the per-button `min-w-[40px]` to `min-w-[36px]` only when viewport < 380px (use a `sm:` reset). Verify the count digits never wrap by adding `whitespace-nowrap` to the count `<span>`s.
- **CollapsibleCaption mask**: the absolute "… See more" overlay uses `pl-10` of fading gradient; on very narrow screens with short last lines the mask can cover the whole word. Reduce to `pl-8` and add `max-w-[60%]` so it never overlaps the start of the line.
- **iPad / md breakpoints (768–1180)**: ensure the action row stays left-aligned with `max-w-[600px] mx-auto` already provided by the feed container; verify the bookmark stays right-aligned via `ml-auto` (already in place). No layout change expected — only verification.
- **Bottom nav spacing**: confirm `pb-[env(safe-area-inset-bottom)] + nav-height` padding on the feed scroll container so the last card's "View all comments" link is never hidden under `ZivoMobileNav`. If missing, add `pb-24 md:pb-8` on the feed list wrapper.

After edits, switch to default mode and use `browser--set_viewport_size` at 360×800, 390×844, and 820×1180 to visually confirm.

## 4. Deep-link "View all comments"

There is no dedicated `/post/:id` page; comments live in a modal sheet. Make the link deep-linkable using URL state so it survives reload and external sharing.

- **URL contract**: `/feed?post=<postId>&src=<user|store>&comments=1`. Same pattern works on `/profile` and `/user/:id`.
- **Open from link**: render the comments link as `<Link to={`?post=${id}&src=${source}&comments=1`} replace>` so tapping it pushes history (back button closes the sheet). Use `useSearchParams` in `ReelsFeedPage` and the profile pages to detect the params on mount and call `setShowComments(true)` for the matching feed item, scrolling it into view.
- **Close cleanly**: `CommentsSheet.onClose` clears the three params via `setSearchParams` so the URL returns to `/feed`.
- **Shareable**: the existing share sheet already uses `getPostShareUrl`; add a "Copy link to comments" action that copies the deep-link variant.

Files touched: `src/pages/ReelsFeedPage.tsx`, `src/components/profile/ProfileFeedCard.tsx`, `src/pages/profile/*` consumers, `src/components/social/CommentsSheet.tsx`.

## Technical notes

- No new dependencies. Reuses existing `Skeleton`, `react-router-dom` `useSearchParams`, and current `formatCount` / `commentsLinkLabel` helpers.
- All `aria-label` strings derived from `formatCount(n)` so screen-reader text matches displayed shorthand ("1.2k").
- Deep-link params are additive — pages that don't read them keep working unchanged.
- No DB / RLS / edge-function changes.

## Files to create / edit

```text
NEW  src/components/social/EngagementSkeleton.tsx
EDIT src/components/social/CollapsibleCaption.tsx     (aria + mask width)
EDIT src/components/social/CommentsSheet.tsx          (loading skeletons, close clears params)
EDIT src/pages/ReelsFeedPage.tsx                      (a11y, skeleton, deep-link, narrow-px)
EDIT src/components/profile/ProfileFeedCard.tsx       (a11y, skeleton, deep-link)
```
