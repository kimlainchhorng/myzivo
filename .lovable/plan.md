

## Add Dark Mode Support to Hizivo

### Current State

- The `.dark` CSS class with all dark theme variables (background, cards, borders, product colors, shadows) is **already fully defined** in `src/index.css` (lines 129-210) with verdant green primary accents
- `next-themes` is **already installed** as a dependency
- `sonner.tsx` already imports `useTheme` from `next-themes` and is ready
- The `tailwind.config.ts` already has `darkMode: ["class"]` configured
- **What is missing**: No `ThemeProvider` wraps the app, and no toggle UI exists anywhere

### Changes Required

**1. Wrap the app with next-themes ThemeProvider**

File: `src/App.tsx`

- Import `ThemeProvider` from `next-themes`
- Wrap the outermost provider tree with `<ThemeProvider attribute="class" defaultTheme="system" storageKey="hizovo-theme">`
- This enables the `dark` class to be toggled on `<html>`, activating all existing CSS variables

**2. Create a Theme Toggle component**

New file: `src/components/shared/ThemeToggle.tsx`

- Three-option selector: Light / Dark / System
- Uses `useTheme()` from `next-themes` to read and set theme
- Verdant green highlight on the active option
- Icons: Sun, Moon, Monitor (from Lucide)
- Compact pill-style toggle suitable for both settings page and header placement

**3. Add Appearance section to Preferences page**

File: `src/pages/account/PreferencesPage.tsx`

- Add a new "Appearance" card section (above Language) with the Palette icon
- Embed the ThemeToggle component inside it
- Three large tap-friendly buttons: Light, Dark, System
- Active state uses `bg-primary/10 text-primary` (matching existing language/currency selection pattern)

**4. Persist theme preference to database (for logged-in users)**

File: `src/pages/account/PreferencesPage.tsx`

- When theme changes, call `updateSettings({ preferred_theme: theme })` to sync to the personalization settings table (same pattern as language/currency)

File: `src/components/shared/PreferencesSync.tsx`

- Add theme sync: on login, read `settings.preferred_theme` and call `setTheme()` if it differs from the current theme

### What Does NOT Need to Change

- `index.css` -- dark variables are complete
- `tailwind.config.ts` -- `darkMode: ["class"]` is set
- All UI components using `bg-background`, `text-foreground`, `bg-card`, `border-border`, etc. will automatically respond to dark mode since they reference CSS variables
- Product accent colors (flights blue, hotels amber, eats red, etc.) already have dark variants defined

### Technical Notes

- `next-themes` handles SSR flash prevention, localStorage persistence, and system preference detection out of the box
- `storageKey: "hizovo-theme"` keeps the theme preference in localStorage for instant load
- The `attribute: "class"` setting matches the existing Tailwind `darkMode: ["class"]` configuration
- Components using hardcoded colors (e.g., `bg-black`, `text-white`, `bg-zinc-950`) in service-specific pages (Eats, Rides) are already dark-themed and will remain consistent

### Files Summary

| File | Action |
|------|--------|
| `src/App.tsx` | Add `ThemeProvider` wrapper |
| `src/components/shared/ThemeToggle.tsx` | New -- three-option theme selector |
| `src/pages/account/PreferencesPage.tsx` | Add Appearance section with theme toggle |
| `src/components/shared/PreferencesSync.tsx` | Sync DB theme preference on login |

