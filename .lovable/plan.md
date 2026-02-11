

## Phase: Verdant Green Design System Overhaul

Update the ZIVO design system foundation to a clean, modern 2026 aesthetic with Verdant Green (#22C55E) as the primary color, white backgrounds, soft shadows, and large typography.

---

### 1. CSS Variables (src/index.css)

**Light theme (:root):**

| Variable | Current | New |
|----------|---------|-----|
| `--background` | `0 0% 96%` (gray) | `0 0% 100%` (pure white) |
| `--foreground` | `0 0% 9%` | `0 0% 10%` (keep dark) |
| `--card` | `0 0% 98%` | `0 0% 100%` (white) |
| `--card-foreground` | `0 0% 9%` | `0 0% 10%` |
| `--popover` | `0 0% 89%` | `0 0% 100%` |
| `--primary` | `161 93% 30%` (dark teal) | `142 71% 45%` (Verdant #22C55E) |
| `--primary-foreground` | `151 80% 95%` | `0 0% 100%` (white) |
| `--secondary` | `0 0% 32%` | `142 20% 96%` (light green tint) |
| `--secondary-foreground` | `0 0% 98%` | `142 50% 20%` (dark green) |
| `--muted` | `0 0% 63%` | `210 20% 96%` (soft gray) |
| `--muted-foreground` | `0 0% 9%` | `215 16% 47%` (medium gray) |
| `--accent` | `166 76% 96%` | `142 30% 95%` (green-tinted) |
| `--accent-foreground` | `173 80% 40%` | `142 71% 35%` |
| `--border` | `0 0% 83%` | `220 13% 91%` (softer border) |
| `--input` | `0 0% 83%` | `220 13% 91%` |
| `--ring` | `161 93% 30%` | `142 71% 45%` |
| `--sidebar-primary` | `161 93% 30%` | `142 71% 45%` |
| `--sidebar-ring` | `161 93% 30%` | `142 71% 45%` |
| `--success` | `142 71% 45%` | Keep (already matches) |

**Dark theme (.dark):**

| Variable | New |
|----------|-----|
| `--primary` | `142 71% 45%` |
| `--primary-foreground` | `0 0% 100%` |
| `--ring` | `142 71% 45%` |
| `--sidebar-primary` | `142 71% 45%` |
| `--sidebar-ring` | `142 71% 45%` |

**Shadows -- softer, more modern:**

| Variable | New |
|----------|-----|
| `--shadow-card` | `0 1px 3px 0 rgb(0 0 0 / 0.04), 0 4px 16px -2px rgb(0 0 0 / 0.06)` |
| `--shadow-card-hover` | `0 8px 30px -5px rgb(0 0 0 / 0.1), 0 4px 12px -3px rgb(0 0 0 / 0.04)` |
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.04)` |
| `--shadow-md` | `0 2px 8px -2px rgb(0 0 0 / 0.08), 0 4px 16px -4px rgb(0 0 0 / 0.06)` |
| `--shadow-lg` | `0 4px 16px -2px rgb(0 0 0 / 0.08), 0 12px 32px -8px rgb(0 0 0 / 0.1)` |

---

### 2. Card Component (src/components/ui/card.tsx)

Update default styling for larger radius and softer shadow:

```text
// Before
"rounded-lg border bg-card text-card-foreground shadow-sm"

// After
"rounded-2xl border bg-card text-card-foreground shadow-md"
```

Update CardContent padding from `p-6` to `p-6 sm:p-8` for more spacious feel.

---

### 3. Button Component (src/components/ui/button.tsx)

- Default variant: ensure it uses the new `--primary` (verdant green) -- no code change needed since it references the CSS variable
- Increase default border-radius from `rounded-lg` to `rounded-xl`
- Update `lg` size from `h-12` to `h-14` with `rounded-2xl` for larger tap areas
- Update `xl` size to `h-16 rounded-2xl px-12 text-lg`

---

### 4. Bottom Navigation (src/components/app/AppBottomNav.tsx)

- Active tab highlight: already uses `text-primary` which will update automatically
- Update active pill background from `bg-primary/10` to `bg-primary/15` for more visible green tint
- No other changes needed -- the verdant green CSS variable cascades here

---

### 5. App Header (src/components/app/AppHeader.tsx)

- Background: change from `bg-background` to `bg-white` for cleaner look
- Border: soften to `border-border/50`
- No structural changes

---

### 6. Mobile Home (src/pages/app/AppHome.tsx)

- Change root background from `bg-zinc-950` to `bg-background` (white in light mode)
- Update text colors from hardcoded `text-white` / `text-zinc-*` to semantic tokens
- Update search bar from glassmorphic dark to clean white card with border
- Update service cards overlay gradients for light background
- Update top bar from dark gradient to clean white
- Update quick action cards from `bg-zinc-900/80` to `bg-card border border-border`

---

### 7. Desktop Home (src/components/home/NavBar.tsx)

- No structural changes needed -- already uses semantic tokens
- Active state colors will automatically update via `--primary`

---

### 8. Tailwind Config (tailwind.config.ts)

- Update `boxShadow.soft` to match new softer shadow system
- Add `"3xl"` border radius: `calc(var(--radius) + 24px)`

---

### Summary

| Item | Files Modified |
|------|---------------|
| CSS Variables | 1 (`src/index.css`) |
| Card component | 1 (`src/components/ui/card.tsx`) |
| Button component | 1 (`src/components/ui/button.tsx`) |
| Bottom nav | 1 (`src/components/app/AppBottomNav.tsx`) |
| App header | 1 (`src/components/app/AppHeader.tsx`) |
| Mobile home | 1 (`src/pages/app/AppHome.tsx`) |
| Tailwind config | 1 (`tailwind.config.ts`) |
| **Total** | **7 files** |

This is the foundation layer. Because the entire app uses CSS custom properties and semantic Tailwind classes, changing these 7 files will cascade the Verdant Green theme and white/clean aesthetic across all 100+ pages automatically. The mobile home page requires the most work since it uses hardcoded dark-mode colors instead of semantic tokens.

