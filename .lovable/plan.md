## What's actually broken

I logged in as your test account, published a Text story, and reproduced the bug end-to-end. The toast says "Story shared 🎉", but the "Your story" ring stays grey and tapping it re-opens the Create Story sheet instead of the viewer.

The Story Debug Panel (`/feed?debug=stories`) confirmed the split-brain:

- Database (direct, filtered by your user_id): ✅ 3 active stories
- Feed carousel cache: amber, **0 rows**, status = "success"
- Profile carousel: missing
- Chat carousel: missing

The "Force refresh all" button doesn't fix it either — the carousels really do come back empty.

### Root cause (found in network trace)

`GET /rest/v1/stories?select=id,user_id,media_url,media_type,caption,audio_url,created_at,expires_at,views_count` returns **HTTP 400** with:

```
{"code":"42703","message":"column stories.caption does not exist"}
```

So FeedStoryRing / ProfileStories / ChatStories all crash silently at the network layer. React Query treats the failed `data` as `[]`, which is why the toast says "shared" but the ring never lights up.

The `stories` table actually has these columns:

```
id, user_id, media_url, media_type, text_overlay, text_position,
text_color, background_color, duration_seconds, view_count,
expires_at, created_at, audio_url
```

Two mismatches:
1. Code reads `caption` → real column is **`text_overlay`** (and the publish step in `CreateStorySheet` writes a non-existent `caption` column too — that insert is silently dropping the text).
2. Code reads `views_count` → real column is **`view_count`** (singular).

The SELECT query fails on the very first unknown column (`caption`), so the whole carousel goes dark.

### Why publish "succeeds" anyway

`CreateStorySheet` does `insert({ ..., caption: captionToSave })`. PostgREST has historically accepted unknown columns silently on insert in this project (or it errors but we swallow it). Either way, the media row IS being created — that's why the debug panel sees 3 rows directly — but the `caption` text the user typed is never persisted.

## The fix

Two small, surgical changes — no schema migration required (the column we want already exists).

### 1. Replace `caption` → `text_overlay` and `views_count` → `view_count` everywhere

Files to edit:

- `src/components/social/FeedStoryRing.tsx`
  - `RawStory` type: `caption` → `text_overlay`, `views_count` → `view_count`
  - `.select(...)` string
  - mapping: `caption: s.caption` → `caption: s.text_overlay`, `viewsCount: s.views_count` → `viewsCount: s.view_count`

- `src/components/profile/ProfileStories.tsx` — same three changes

- `src/components/chat/ChatStories.tsx` — same three changes

- `src/components/profile/CreateStorySheet.tsx` (line ~306–310): the insert payload key `caption: captionToSave` becomes `text_overlay: captionToSave`. UI state variable name (`caption`) can stay as-is — only the DB column name changes.

The `StoryViewer` and the rest of the UI keep using the JS field name `caption` — only the DB layer changes.

### 2. Verify

After editing, with the debug panel still open:

- Publish a new Text story.
- Network trace should now show `200 OK` for the `stories?select=...` request.
- Feed / Profile / Chat carousel rows in the debug panel should flip to ✅ green within ~1s.
- "Your story" ring should show the gradient border, and tapping it should open the StoryViewer with the just-published text — not the Create Story sheet.

I'll run that verification myself once you approve.

## Out of scope (intentionally)

- The 3 stale stories already in the DB have `text_overlay = NULL` (their captions were lost on insert). I'm not back-filling them — they expire in <24h. New stories created after the fix will keep their caption text correctly.
- The other "blank /profile screen" you saw was just the profile page mid-load after a fresh login; it rendered fine on a second visit. Not related to stories. If it recurs after the fix, we can investigate separately.
