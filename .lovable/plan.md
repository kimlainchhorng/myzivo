## Why pictures 2 & 3 look broken

Picture 1 (Profile) opens the premium `CreateStorySheet` — a bottom-anchored sheet with the green/amber/pink gradient row cards.

Pictures 2 (Chat) and 3 (Feed) open a raw hidden `<input type="file">`, which on iOS Safari renders that floating "Photo Library / Take Photo or Video / Choose File" panel anchored to the input's top-left coordinates — that's the chrome you see covering the page.

## Fix

Make Chat and Feed open the same `CreateStorySheet` Profile uses, so all three entry points feel identical.

### 1. `src/components/social/FeedStoryRing.tsx`
- Remove `fileRef`, the hidden `<input type="file">`, and the `handleAddStory` upload logic (it's duplicated by `CreateStorySheet`).
- Add `const [showCreate, setShowCreate] = useState(false)`.
- "Add story" button: if user has no story → `setShowCreate(true)`; otherwise keep opening the viewer.
- Render `<CreateStorySheet open={showCreate} onClose={() => setShowCreate(false)} />`.
- Drop the now-unused `Loader2` and `uploading` state.

### 2. `src/components/chat/ChatStories.tsx`
- Remove `fileInputRef`, the inline `<input type="file">`, `uploading` state, and `handleFileSelect`.
- Add `const [showCreate, setShowCreate] = useState(false)`.
- The avatar tap and the small `+` badge both call `setShowCreate(true)` when the user has no story (avatar still opens the viewer when they do).
- Import and render `<CreateStorySheet open={showCreate} onClose={() => setShowCreate(false)} />`.

### Result
- Tapping "Your story" from Feed, Chat, or Profile shows the identical premium sheet from Picture 1 — gradient icon tiles, header avatar + "Public · 24h" chip, safe-area padding, scrim above the bottom nav.
- iOS no longer pops the floating top-left native chooser; the file picker is launched from inside `CreateStorySheet`'s anchored buttons.
- Single source of truth for upload, validation, retry, audio, text-on-gradient, and storage rollback — Chat/Feed inherit all of it for free.

No DB, RLS, or analytics changes required.
