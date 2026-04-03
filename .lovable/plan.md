
# Social Features Upgrade Plan

## Phase 1: Comments Section Upgrade
- Add reply threads (nested comments with parent_id)
- Emoji reactions on comments (❤️ 😂 😮 😢 🔥)
- Improved comment UI with avatars, timestamps, like counts
- "View replies" expandable threads
- Migration: Add `parent_comment_id` and `comment_reactions` table

## Phase 2: Stories Feature
- 24-hour disappearing stories with auto-cleanup
- Story creation: photo/video upload with text overlay
- Story viewer with progress bar and swipe navigation
- Viewers list for story owner
- Story ring around profile avatars in feed
- Migration: Create `stories` and `story_views` tables

## Phase 3: Post Creation Upgrade
- Multi-image carousel posts (up to 10 images)
- User tagging (@mentions) in captions
- Location tags with search
- Basic image filters (brightness, contrast, saturation)
- Migration: Update `user_posts` for multi-media and location

## Phase 4: Notifications System
- In-app notification center with bell icon + badge count
- Real-time notifications for: likes, comments, shares, follows, mentions
- Notification grouping (e.g., "3 people liked your post")
- Mark as read / mark all read
- Migration: Create `notifications` table with type enum

## Implementation Order
1. Phase 1 (Comments) — builds on existing comment system
2. Phase 4 (Notifications) — needed by all other features
3. Phase 2 (Stories) — new standalone feature
4. Phase 3 (Post Creation) — enhances existing flow
