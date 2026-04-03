
# Next Update — Full Feature Build

Based on existing infrastructure (WebRTC calling, mesh group calls already built), here's what's needed:

## Phase 1: Post Creation Upgrade
- **Multi-image carousel** — Allow up to 10 images per post with swipe preview
- **User tagging** — @mention autocomplete in captions with profile search
- **Location tags** — Search and attach location to posts
- **Image filters** — Brightness, contrast, saturation sliders + preset filters (Vivid, Warm, Cool, B&W, Vintage)

## Phase 2: Stories Feature (DB already created)
- **Story creation** — Camera/gallery upload with text overlay, color picker, position
- **Story ring** — Gradient ring around avatars in feed for users with active stories
- **Story viewer** — Fullscreen with progress bar, swipe between users, auto-advance
- **Viewers list** — Who viewed your story (eye icon tap)
- **Auto-cleanup** — Stories expire after 24h (already handled by DB policy)

## Phase 3: Call Enhancements (WebRTC already built)
- **Call quality indicator** — Show connection quality badge (excellent/good/poor) during calls using existing useCallQuality hook
- **Picture-in-picture** — Already built per memory, verify and polish
- **Screen sharing** — Already built per memory, verify and polish
- **Call recording** — Intentionally removed per memory, skip

## Phase 4: Group Calls (Mesh already built)
- **Participant grid layout** — 2x2 grid for up to 4 participants with speaker detection highlight
- **Group call invite** — Send group call invites via chat
- **Group call UI polish** — Add/remove participants, mute indicators

## Implementation Order
1. Post creation upgrade (new UI work)
2. Stories (new feature, DB ready)
3. Call enhancements (mostly polish on existing)
4. Group calls (mostly polish on existing)
