## What's wrong (from your screenshot + audit)

You opened `/chat/search` and the iOS status bar **(9:33 / signal / battery)** is overlapping the search input — the green border in your screenshot is exactly where the safe-area padding is missing. I audited all 18 chat pages and found the same issue on multiple pages, plus several pages with broken or missing back buttons.

### Audit results — chat pages

| Page | Header sticky? | Safe-area top? | Back button? | Issue |
|---|---|---|---|---|
| `ChatSearchAllPage.tsx` | yes | **NO** | yes | **Status bar overlaps search (your screenshot)** |
| `BroadcastListsPage.tsx` | yes | **NO** | yes | Status bar overlaps header |
| `CustomFoldersPage.tsx` | yes | **NO** | yes | Status bar overlaps header |
| `FindContactsPage.tsx` | yes | **NO** | yes | Status bar overlaps header |
| `settings/ChatPrivacyHubPage.tsx` | yes | **NO** | yes | Status bar overlaps header |
| `settings/StorageManagerPage.tsx` | yes | **NO** | yes | Status bar overlaps header |
| `JoinGroupPage.tsx` | — | no | **NO BACK** | No way back; only "Back to chats" if error |
| `GroupCallEntryPage.tsx` "Missing room" branch | — | no | **NO BACK** | Dead-end error screen |
| All other chat pages | — | OK | OK | Already correct |

### Back-button reliability problem

Pages that do have a back button use `navigate(-1)` directly. That breaks in 2 cases you described:
1. **"Some turn back not work"** — when the user opened the page via deep link / refresh / push notification, there is no history entry, so `navigate(-1)` does nothing or pops out of the app.
2. **"Some turn back is not back where is the first"** — in some flows we `navigate(...)` instead of `replace:true`, so going back lands on an intermediate page (e.g., search → result → back goes to search instead of chat list).

The codebase already has a `useSmartBack(fallback)` hook in `src/lib/smartBack.ts` built for exactly this — it goes back when in-app history exists, otherwise navigates to a sensible fallback route. It's just not used in chat pages.

## What I'll fix

### 1. Safe-area top padding on every chat page header
Apply the existing `pt-safe` utility class (defined in `src/index.css`) to every sticky/fixed header in the 6 affected files. This guarantees the header always clears the iOS notch / status bar:

```tsx
<header className="sticky top-0 z-10 ... pt-safe px-3 pb-3">
```

### 2. Add back buttons where missing
- **`JoinGroupPage.tsx`** — add a top header with a back chevron using `useSmartBack("/chat")`.
- **`GroupCallEntryPage.tsx`** — add a back chevron to the "Missing room name" error screen.

### 3. Replace fragile `navigate(-1)` with `useSmartBack`
Swap every `nav(-1)` / `navigate(-1)` back-chevron click in the chat sub-pages to use `useSmartBack("/chat")` (or a more specific fallback like `/chat/contacts` for sub-settings). Files touched:
- `ChatSearchAllPage.tsx`
- `BroadcastListsPage.tsx`
- `CustomFoldersPage.tsx`
- `FindContactsPage.tsx`
- `ContactRequestsPage.tsx`
- `ContactsPage.tsx`
- `NearbyChatPage.tsx`
- `NewBroadcastPage.tsx`
- `SecretChatPage.tsx`
- `settings/ChatPrivacyHubPage.tsx`
- `settings/StorageManagerPage.tsx`
- `settings/ActiveSessionsPage.tsx`
- `settings/LoginAlertsPage.tsx`
- `settings/PasscodeSetupPage.tsx`
- `settings/PrivacySecurityPage.tsx`
- `settings/TwoStepSetupPage.tsx`

This guarantees:
- If the user navigated to the page from inside the app → back goes to the previous in-app screen.
- If the user landed via deep link / refresh / notification → back goes to `/chat` (or the fallback) instead of dead-ending.

## Out of scope

- No visual redesign — only padding + back-button fixes.
- No changes to the in-chat (`PersonalChat` / `GroupChat`) overlays — those already handle close correctly.
- No route changes.
