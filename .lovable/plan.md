
# Next Update — Full Feature Build

## ✅ Phase 1: Post Creation Upgrade — DONE
- Multi-image carousel (up to 10), @mention tagging, location tags, CSS filters

## ✅ Phase 2: Stories Feature — DONE
- Story creation, story rings, story viewer with progress bar, auto-cleanup

## ✅ Phase 3: Comments & Notifications — DONE
- Threaded comments with emoji reactions, real-time social notifications

## ✅ Phase 4: Call Enhancements — DONE
- Call quality indicator, screen sharing, picture-in-picture, call recording removed

## ✅ Phase 5: Group Calls — DONE
- Mesh WebRTC, speaker detection, group call screen, chat invites

## ✅ Phase 6: Mega Feature Update — DONE

### Feature 1: DMs Polish
- TypingIndicator component (animated dots)
- ReadReceipt component (single/double/blue check marks)
- MessageReactionPicker (emoji picker for message reactions)
- message_reactions DB table with RLS

### Feature 2: Explore/Discover Page
- `/explore` route with search, trending grid, hashtag browsing
- User search with avatar previews
- Masonry-style trending posts grid (large/small alternating)

### Feature 3: Profile Enhancements
- Already had: ProfileContentTabs (grid/list views), SocialListModal (followers/following)
- Post stats, follower counts integrated

### Feature 4: Reels/Video Feed
- Already had: `/feed` (TikTok-style vertical swipe) and `/reels` (Instagram-style cards)
- Auto-play, like/comment/share overlays

### Feature 5: Travel Integration
- TripCard component — shareable flight card with route, dates, price
- Bookmark and share actions integrated

### Feature 6: Settings/Privacy Controls
- `/account/privacy` page with profile visibility (public/followers/private)
- Activity status, read receipts, message request toggles
- Blocked users list with unblock action
- blocked_users, muted_conversations, privacy_settings DB tables

### Feature 7: Push Notifications
- Already had: comprehensive usePushNotifications hook (Capacitor + Web Push)
- Native + web push with route-based action handling

### Feature 8: Saved/Bookmarks
- `/saved` page with All/Posts/Flights/Food tabs
- useBookmark hook for toggle save/unsave
- bookmarks DB table with RLS

### Feature 9: Social Sharing
- useShareContent hook (Web Share API + clipboard fallback)
- sharePost, shareProfile, shareFlight utilities

### Feature 10: Map Integration
- NearbyMap component showing nearby restaurants
- Geolocation with fallback, list view of nearby places

## Architecture Notes
- All new DB tables use RLS with auth.uid() checks
- Bookmarks use unique constraint on (user_id, item_type, item_id)
- Privacy settings use upsert pattern for first-time creation
- Share uses Web Share API with clipboard fallback for older browsers
