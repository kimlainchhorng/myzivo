

# Unified ZIVO Design System (2026 UI Standard)

## Current State

The project already has a solid foundation: CSS custom properties in `index.css`, a `brandTokens.ts` config, Shadcn UI components, and service-specific color tokens. However, there are inconsistencies:

- Button variants reference undefined CSS classes (`gradient-rides`, `gradient-eats`, `glass-card`)
- Spacing is ad-hoc across components (mix of `p-4`, `p-6`, `p-8`, `gap-3`, `gap-4`, etc.)
- Card styles vary: some use `rounded-2xl shadow-md`, others use `rounded-3xl`, custom glassmorphism, or inline styles
- Typography uses different font stacks (`Inter` in CSS body vs `Work Sans` in Tailwind config vs `Outfit` in brandTokens)
- No centralized spacing scale or layout utilities beyond Tailwind defaults
- Admin/Mission Control uses a completely separate dark theme with different patterns

## Plan

### 1. Fix Broken CSS Classes + Add Missing Utilities (index.css)

Add the missing utility classes that button variants and components reference:

- `.gradient-rides` -- emerald gradient background
- `.gradient-eats` -- orange/red gradient background  
- `.glass-card` -- glassmorphic card with backdrop-blur
- `.glow-rides` -- emerald glow shadow
- `.glow-eats` -- orange glow shadow

Add standardized spacing utility classes:
- `.space-section` (16px padding)
- `.space-section-lg` (24px padding)
- `.space-card` (16px padding, 24px on larger screens)

Add loading skeleton styles for lists:
- `.skeleton-card` -- card-shaped loading placeholder
- `.skeleton-text` -- text line loading placeholder
- `.skeleton-avatar` -- circular loading placeholder

### 2. Standardize Typography (index.css)

Consolidate on **Inter** as the primary UI font across all contexts (body, headings, buttons). Keep Work Sans and Lora as secondary/serif options but remove the conflict between CSS body font-family and Tailwind config.

Update the typography utility classes to use consistent sizes:
- `.text-display-lg`: 48px (large titles)
- `.text-display`: 36px (page titles)
- `.text-heading-lg`: 30px (section headers)
- `.text-heading`: 24px (card headers)
- `.text-subheading`: 18px (sub-sections)
- `.text-body-lg`: 18px (featured body)
- `.text-body`: 16px (standard body)
- `.text-small`: 14px (secondary text)
- `.text-caption`: 12px (captions, labels)

### 3. Standardize Card System (card.tsx + index.css)

Update the base `Card` component and add CSS utility variants so all cards follow the same pattern:

- Base card: `rounded-2xl`, `border border-border/50`, `shadow-sm`, `p-4 sm:p-6`
- `.card-elevated`: stronger shadow for prominent cards
- `.card-soft`: subtle background, minimal border
- `.card-glass`: glassmorphic with backdrop-blur (for dark overlays)
- `.card-interactive`: adds hover lift + shadow transition

### 4. Standardize Button System (button.tsx)

Fix the broken variant classes and ensure all button variants work:

- `default`: Verdant green bg, white text, rounded-xl
- `secondary`: Outline style, neutral border
- `destructive`: Red accent, white text
- `outline`: Border only, transparent bg
- `ghost`: No border, subtle hover
- `rides`: Emerald gradient (fix missing CSS)
- `eats`: Orange gradient (fix missing CSS)
- `glass`: Glassmorphic (fix missing CSS)
- `hero`: Dark bg, light text, bold

### 5. Standardize Icon Usage (index.css)

Add icon sizing utility classes matching the existing `componentSizes.icon` tokens:

- `.icon-xs`: 12px
- `.icon-sm`: 16px
- `.icon-md`: 20px (default)
- `.icon-lg`: 24px
- `.icon-xl`: 32px

Ensure all icons use consistent `strokeWidth={1.5}` via a CSS default.

### 6. Standardize Navigation Patterns (AppBottomNav.tsx, AppHeader.tsx)

Ensure bottom nav and header follow the same pattern:
- Bottom nav: 64px height, safe-area padding, `bg-card border-t`
- Header: 56px height, safe-area padding, `bg-background/95 backdrop-blur-sm`
- Back button: consistent chevron icon, same size across all pages
- Search bars: consistent height (44px), rounded-xl, muted background

### 7. Add Smooth Transition Defaults (index.css)

Standardize interaction animations:
- Button press: `active:scale-[0.98]` (already on default, extend to all)
- Card hover: `transition-all duration-200 hover:shadow-md`
- Page transitions: keep existing framer-motion fade-ins
- Loading skeletons: `animate-pulse` with `bg-muted rounded-lg`

### 8. Dark Mode Ready (already implemented)

The `.dark` theme is already defined in `index.css` with all CSS variables. Verify all new utility classes respect dark mode by using `hsl(var(--...))` references instead of hardcoded colors.

## Files Modified

| File | Change |
|------|--------|
| `src/index.css` | Add missing gradient/glass/glow classes, spacing utilities, skeleton styles, icon utilities, fix typography scale, add `.text-caption` |
| `src/components/ui/button.tsx` | Fix variant class references to use properly defined CSS classes |
| `src/components/ui/card.tsx` | Add `card-interactive` hover effect to base styling |
| `src/config/brandTokens.ts` | Align font references to Inter, add spacing scale tokens, add icon size tokens |

## What This Does NOT Change

- No structural layout changes to existing pages
- No new dependencies
- No changes to routing or data fetching
- Dark mode theme stays as-is (already complete)
- Service-specific colors stay as-is (already well-defined)
- Admin Mission Control theme stays separate (intentionally different aesthetic)

