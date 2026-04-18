
User wants more link-safety hardening across the platform — extending what we did for chat to every other surface that renders user/DB-supplied URLs.

## Plan — Platform-Wide Link Safety Sweep

Apply the same `assessLinkSync` + `ExternalLinkWarning` pattern everywhere a URL from an untrusted source is rendered.

### 1. Audit & wrap remaining link surfaces
- **Profile social links** (`social_links` JSONB on profiles) — Instagram/FB/TikTok/etc. rendered on profile page → route through warning
- **Post/Reel captions** — auto-linkified URLs in post text → risk badge + interstitial
- **Comments** — same treatment as captions
- **Bio links** — single "website" field on profile → validated + warned
- **Live chat messages** (stream chat, not DM) — same as DM links
- **Rich link previews on Feed posts** — show inline risk badge like we did in chat

### 2. Centralize the pattern
- Create `src/components/security/SafeExternalLink.tsx` — drop-in `<a>` replacement that:
  - Runs `assessLinkSync` on render → shows inline badge (trusted/suspicious/blocked)
  - Forces `rel="noopener noreferrer nofollow"` + `target="_blank"`
  - Intercepts click → opens `ExternalLinkWarning` modal
  - Blocks click entirely if level === "blocked"
- Create `src/lib/linkify.tsx` (or upgrade existing) — turns plain text URLs into `<SafeExternalLink>` instead of raw `<a>`

### 3. Surfaces to update
- `src/pages/Profile.tsx` (social_links + website)
- Post/Reel caption renderers (whichever component linkifies caption text)
- Comment renderers
- Live stream chat message renderer
- Feed `LinkPreviewCard` (mirror the chat version)

### 4. Bonus hardening
- Strip tracking params from outbound URLs (utm_*, fbclid, gclid) — privacy + harder to fingerprint
- Log blocked-click attempts to a lightweight `link_security_events` table for ops visibility (optional — flag if you want the migration)

### Verify
- Click a partner link on profile → trusted badge, no warning needed
- Paste a punycode URL in a post → suspicious badge + interstitial on click
- Paste `javascript:alert(1)` → blocked, click does nothing

Approve and I'll do the sweep in one pass.
