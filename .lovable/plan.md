## Contacts Page — Add-Ons

Extend `src/pages/chat/ContactsPage.tsx` with four new capabilities. All actions live in the existing top header row or as new sections inside the page — no breaking changes to current layout.

### 1. Top header (next to Add)
Add three icon buttons before the existing `UserPlus`:
- **Share2 / Invite** → opens `InviteFriendsSheet`
- **QrCode** → navigates to `/profile/qr` (existing `QRProfilePage`) with a "Scan" toggle
- Existing `UserPlus` (add by username) stays

### 2. Invite via SMS / Email
New component: `src/components/chat/InviteFriendsSheet.tsx`
- Bottom sheet with personal invite link: `https://hizivo.com/i/{username}` (falls back to user id)
- Three actions:
  - **Copy link** (clipboard with triple-fallback per branded-link infra)
  - **Send SMS** → opens `sms:?body=...` on mobile, otherwise calls existing `send-employee-sms-invite` edge function pattern via a new lightweight `send-invite-sms` function (Twilio gateway, reuses 5/day rate limit from OTP engine)
  - **Send Email** → opens `mailto:?subject=...&body=...`; if user enters address, calls new `send-invite-email` edge function (Resend connector if available, otherwise mailto fallback only)
- Native share via `navigator.share` when available

### 3. Sync phone contacts (native)
New tile button "Sync phone" added as a 4th item in the quick-action grid (changes `grid-cols-3` → `grid-cols-2 gap-2` with 2 rows of 2, OR keep 3-col and wrap — will use **2x2 grid** for clarity).

Logic in new hook `src/hooks/useNativeContacts.ts`:
- Detects Capacitor via `Capacitor.isNativePlatform()`
- Uses `@capacitor-community/contacts` plugin (needs `bun add @capacitor-community/contacts`)
- Requests permission, reads contacts, extracts E.164 phones
- Hashes locally with existing `hashPhoneE164` from `src/lib/phoneHash.ts`
- Calls existing `contact-match` edge function (already used by `FindContactsPage`)
- Returns matches → user taps "Add" to call `useContacts.add()`
- Web fallback: button routes to existing `/chat/find-contacts` paste flow

After adding the plugin user must run `npx cap sync` (we'll instruct them).

### 4. QR code scan/share
- The QR button in header navigates to existing `/profile/qr` (no new code needed for share)
- For scanning: new route `/chat/scan-qr` using `src/components/chat/QrScanSheet.tsx` (already may exist — check; otherwise build with `@capacitor-mlkit/barcode-scanning` on native, `html5-qrcode` on web)
- Scanned URLs of form `hizivo.com/u/{username}` auto-open `AddContactSheet` prefilled

### 5. Suggested / People you may know
New section between the search bar and contact list, only shown when `searchQuery` is empty:
- Header: "People you may know"
- Horizontal scroll of avatar cards (max 12)
- Source: union of (a) mutual followers via `follows` table where target follows me & I don't follow back, (b) recent DM partners not yet in `user_contacts`
- New hook `src/hooks/useSuggestedContacts.ts` returning `{ user_id, full_name, username, avatar_url, reason }`
- Each card has small "Add" button → `useContacts.add(id, { via: "suggested" })`

### Files to create
- `src/components/chat/InviteFriendsSheet.tsx`
- `src/components/chat/SuggestedContactsRow.tsx`
- `src/hooks/useNativeContacts.ts`
- `src/hooks/useSuggestedContacts.ts`
- `supabase/functions/send-invite-sms/index.ts` (Twilio gateway, rate-limited)
- `supabase/functions/send-invite-email/index.ts` (Resend or generic SMTP)

### Files to modify
- `src/pages/chat/ContactsPage.tsx` — header buttons, 2x2 quick-action grid (Find by phone, Sync phone, Requests, Nearby), suggested row, invite sheet wiring
- `src/App.tsx` — add `/chat/scan-qr` route if scanner is added
- `package.json` — add `@capacitor-community/contacts`

### Notes
- Uses existing emerald tokens, lucide icons (Share2, QrCode, Smartphone, UserPlus2)
- Invite SMS reuses Twilio connector (already linked per OTP engine memory)
- All new endpoints require auth and respect existing rate-limit patterns
- After approval, user should run `npx cap sync` for the contacts plugin to work on device