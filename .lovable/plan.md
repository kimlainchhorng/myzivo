# Profile mobile polish: a11y, haptics, safe-area, persistence, cover reset

Five small, focused improvements to `src/pages/Profile.tsx` (plus a tiny CSS token check). No new dependencies — `useHaptics` and the safe-area tokens already exist.

## 1. Accessibility — sticky header

**Mobile sticky header (lines 471–504)**
- Header `<motion.header>`: add `role="banner"` and `aria-label="Profile quick navigation"`.
- Avatar: wrap in a non-interactive `<span aria-hidden="true">` (decorative — name is the label).
- Name container: add `aria-live="polite"` so screen readers announce the user when it slides in.
- Back button: add `aria-label="Go back"` (replace generic "Back") and visible focus ring `focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-background`.
- Notification toggle button: keep current `aria-label`/`aria-pressed`, add the same `focus-visible:*` ring classes, plus `aria-controls="profile-notif-panel"` and `aria-expanded={showNotifPanel}`. Give the existing notif panel container an `id="profile-notif-panel"`.
- Add an unread badge dot inside the sticky header bell (mirrors line 608–612 styling) so the sticky surface is informative.

## 2. Haptics + animated press on back button

- Import existing `useHaptics` from `@/hooks/useHaptics` (already in the project — works on Capacitor, no-op on web).
- Wrap back/notif actions:
  ```tsx
  const { impact, selectionChanged } = useHaptics();
  const handleBack = () => { impact('light'); navigate(-1); };
  const handleToggleNotif = () => { selectionChanged(); setShowNotifPanel(p => !p); };
  ```
- Convert the back `<button>` to `<motion.button whileTap={{ scale: 0.86 }} whileHover={{ scale: 1.04 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>` and add `active:bg-muted/70` for an immediate press tint.
- Apply the same `whileTap` + haptic to the sticky notif button for consistency with the cover-area buttons (which already use `whileTap`).

## 3. Safe-area verification (iOS / Android)

- Sticky header currently uses `safe-area-top` utility class only; the height (`h-14`) doesn't grow with the inset, so on notched devices the avatar can sit under the Dynamic Island.
- Switch to the project's standard sticky token by replacing the inline structure with:
  ```tsx
  className="lg:hidden fixed top-0 inset-x-0 z-40 px-3 flex items-center gap-3 bg-background/85 backdrop-blur-xl border-b border-border/40"
  style={{ paddingTop: 'var(--zivo-safe-top, env(safe-area-inset-top, 0px))', height: 'calc(56px + var(--zivo-safe-top, env(safe-area-inset-top, 0px)))' }}
  ```
  This matches the pattern documented in `mem://style/mobile-native-ux-standards` and verified by `tests/e2e/safe-area.spec.ts`.
- Add `data-testid="profile-sticky-header"` so a follow-up test can be wired into the existing safe-area Playwright suite.
- Confirm the cover-photo area's existing `pt-0` doesn't compound — it doesn't, because the sticky header is `position: fixed` and content below already accounts for it via `pb-24` and natural scroll.

## 4. Persistent notifications panel

Currently `showNotifPanel` is component state — lost on rotation if React unmounts/remounts, and lost on tab switch only if the route unmounts. Make it survive both:

- Persist via `sessionStorage` under key `zivo:profile:notif-panel`.
  ```tsx
  const [showNotifPanel, setShowNotifPanel] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('zivo:profile:notif-panel') === '1';
  });
  useEffect(() => {
    sessionStorage.setItem('zivo:profile:notif-panel', showNotifPanel ? '1' : '0');
  }, [showNotifPanel]);
  ```
- Add an `orientationchange` + `visibilitychange` listener that re-reads the value (covers Android Chrome edge cases where state survives but layout reflows close transient sheets):
  ```tsx
  useEffect(() => {
    const restore = () => {
      const v = sessionStorage.getItem('zivo:profile:notif-panel') === '1';
      setShowNotifPanel(v);
    };
    window.addEventListener('orientationchange', restore);
    document.addEventListener('visibilitychange', restore);
    return () => {
      window.removeEventListener('orientationchange', restore);
      document.removeEventListener('visibilitychange', restore);
    };
  }, []);
  ```
- Clear the key when the user explicitly navigates away via "View All" / a notification item (those handlers already call `setShowNotifPanel(false)` — the persistence effect handles cleanup automatically).

## 5. Tap-to-reset cover position

In the cover repositioning toolbar (lines 626–640):

- Add a third pill button between Save and Cancel that snaps `coverPosition` back to **50** (default center) and triggers a light haptic.
  ```tsx
  <button
    onClick={() => { impact('light'); setCoverPosition(50); }}
    aria-label="Reset cover position to center"
    className="p-1.5 rounded-full bg-muted/70 text-foreground hover:bg-muted transition active:scale-90 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none"
  >
    <RotateCcw className="h-3.5 w-3.5" />
  </button>
  ```
- Also enable **double-tap** on the cover image itself (only when `coverRepositioning`) to trigger the same reset — matches Facebook/Instagram behavior:
  ```tsx
  onDoubleClick={coverRepositioning ? () => { impact('medium'); setCoverPosition(50); } : undefined}
  ```
- Import `RotateCcw` from `lucide-react` (other lucide icons are already imported).

## Files to edit
- `src/pages/Profile.tsx` — all five changes above.

No DB, no new packages, no other files touched.
