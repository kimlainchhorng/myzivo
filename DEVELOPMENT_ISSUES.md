# App Development Issues & Fixes Needed

## 🔴 CRITICAL ISSUES

### 1. Route Mismatch (Feed Pages Swapped)
**File:** `src/App.tsx`
**Issue:** Routes are backwards
```
Current (WRONG):
  /feed     → ReelsFeedPage  (should be FeedPage)
  /reels    → FeedPage        (should be ReelsFeedPage)

Correct (NEEDED):
  /feed     → FeedPage        (main feed/home)
  /reels    → ReelsFeedPage   (short-form videos)
```

**Impact:** Users clicking "Feed" go to reels, "Reels" goes to feed. Confusing navigation.

---

## 🟡 DUPLICATE/OVERLAPPING COMPONENTS

### 2. Multiple Feed Pages
- `FeedPage.tsx` - Main activity feed
- `ActivityFeedPage.tsx` - Activity timeline
- `ReelsFeedPage.tsx` - Reels/videos

**Action:** Confirm which is which, consolidate if needed

### 3. Multiple Profile Pages
- `Profile.tsx` - Current user profile
- `PublicProfilePage.tsx` - Other user profiles
- `CompanyProfile.tsx` - Business profiles
- `StoreProfilePage.tsx` - Shop profiles

**Status:** ✅ These seem intentional (different use cases)

### 4. Chat & Messaging
- `ChatHubPage.tsx` - Main chat interface
- Multiple chat components in `src/components/chat/`

**Status:** ✅ Seems organized

---

## 🟡 WORKFLOW ISSUES TO CHECK

### When you log in, check these:

1. **Home Tab Flow**
   - Does "Home" take you to feed or reels?
   - Should show recent posts/activities
   - Should have smooth infinite scroll

2. **Chat Workflow**
   - Can you start new conversations?
   - Do notifications show sender name + avatar?
   - Does tapping notification open the chat?

3. **Profile Navigation**
   - Clicking on user avatars → goes to PublicProfilePage
   - Your profile → goes to Profile.tsx
   - Smooth transitions between profiles?

4. **Social Features**
   - Comments workflow (post → comments visible?)
   - Mentions working (can tag people?)
   - Likes showing properly (actor name + count?)
   - Follow/unfollow smooth?

---

## 📋 TESTING CHECKLIST

Log in with `klainkonkat@gmail.com` and check:

### Navigation
- [ ] Bottom nav works smoothly
- [ ] No missing/broken links
- [ ] Tab switching doesn't lag
- [ ] Back button works correctly

### Home/Feed
- [ ] Posts load quickly
- [ ] Infinite scroll works
- [ ] No duplicate posts
- [ ] Images load properly

### Chat
- [ ] Chat list shows all conversations
- [ ] New messages appear in real-time
- [ ] Avatars/names showing correctly
- [ ] Can send messages

### Profile
- [ ] Profile loads your info
- [ ] Can edit profile
- [ ] Can view other profiles
- [ ] Follower/following counts accurate

### Social
- [ ] Can like posts
- [ ] Can comment
- [ ] Can mention people
- [ ] Comments show commenter avatar/name

---

## PROPOSED FIXES

### FIX #1: Swap Feed Routes
```jsx
// In src/App.tsx, change:
<Route path="/feed" element={<FeedPage />} />           // ← was ReelsFeedPage
<Route path="/reels" element={<ReelsFeedPage />} />     // ← was FeedPage
```

### FIX #2: Consolidate Feed Logic
- If FeedPage and ActivityFeedPage are similar, merge them
- If ReelsFeedPage is just for videos, keep separate

### FIX #3: Check for Hidden Duplicates
- Look for unused/dead code in each feed page
- Remove duplicate imports/components

---

## PRIORITY ORDER
1. **High:** Fix route swap (affects navigation)
2. **High:** Test chat workflow (critical for messaging)
3. **Medium:** Consolidate feeds if overlapping
4. **Medium:** Ensure social features work
5. **Low:** Performance optimization

