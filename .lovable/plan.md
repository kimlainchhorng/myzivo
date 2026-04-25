# Polish the Create Story sheet + Chat upload menu — premium "beefy" pass

Two visible problems from the screenshots:

1. **Create Story sheet** (IMG_2178 / IMG_2180) feels thin and unfinished — page content shows through, the bottom tab bar leaks on top, and the sheet itself is a plain white card with no depth.
2. **Chat upload menu** (IMG_2179) is floating untethered in the top-left of the screen instead of anchoring to the upload button — it looks broken.

## 1. Create Story sheet — premium redesign

File: `src/components/profile/CreateStorySheet.tsx`

- **Solid scrim**: replace the leaky backdrop with a real `bg-background/80 backdrop-blur-xl` overlay that fully covers the page, including hiding the bottom mobile nav (`z-[60]` so it sits above `ZivoMobileNav`).
- **Beefier sheet**:
  - Larger rounded top corners (`rounded-t-3xl`), subtle 1px hairline border, soft elevated shadow (`shadow-[0_-8px_40px_-12px_hsl(var(--foreground)/0.25)]`).
  - Header: bigger title (`text-xl font-bold`), tappable 44×44 close button with hover ring.
  - "Public · 24h" pill becomes a soft badge with a globe icon inside a small chip.
- **Three option rows → premium cards**:
  - Each row gets a 14px gradient icon tile (emerald → glow for Photo, amber → orange for Camera, violet → pink for Text), 2-line layout with title in `font-semibold`, description in `text-muted-foreground`.
  - Hover/active state: `hover:bg-accent/40 active:scale-[0.98] transition` for tactile feedback.
  - Right-side chevron so it reads as "tap to continue".
- **Safe-area aware**: `pb-[env(safe-area-inset-bottom)]` on the sheet body so the last row isn't crowded by the home indicator.
- **Hide the mobile nav** while the sheet is open (the same pattern other modal sheets in the app use — apply `data-modal-open` attr or render at portal level above the nav's z-index).

## 2. Chat upload menu — anchor and style

File: `src/components/chat/...` (the upload trigger in the Chat hub — locate the popover that lists Photo Library / Take Photo / Choose File).

- Replace the absolutely-positioned div with a proper shadcn `DropdownMenu` or `Popover` anchored to the trigger button so it always opens next to the icon.
- Add the same glassmorphic style used elsewhere: `bg-background/95 backdrop-blur-xl border rounded-2xl shadow-xl p-1`.
- Each menu item: 44px tall, gradient icon tile, label in `font-medium`, hover `bg-accent`.
- On mobile, if there's no room beside the trigger, fall back to a bottom sheet using the same component family so it never floats in dead space.

## 3. Shared polish

- Apply the project's emerald signature gradient to the primary CTA tile so the sheet feels on-brand.
- Add a tiny `motion.div` slide-up + fade entrance on the sheet (`framer-motion`, 220 ms, easeOut) and a fade for each row staggered by 40 ms — matches the FaceTime/iMessage v2026 feel in your design memory.

## Files

Edited:
- `src/components/profile/CreateStorySheet.tsx` — sheet container, header, option rows, scrim, mobile-nav suppression
- `src/components/chat/<ChatUploadMenu>.tsx` (the file owning the menu shown in IMG_2179) — convert to anchored dropdown/popover, restyle items
- Possibly `src/index.css` — add a reusable `.modal-scrim` utility if not already present

No DB or backend changes.
