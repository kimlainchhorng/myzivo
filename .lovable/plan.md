

## Add Multi-Language Support to Hizivo

### Current State

The i18n infrastructure is **fully built** but **not wired up**:

- `src/lib/i18n.ts` -- Translation engine with DB loading, interpolation, and English defaults for ~60 keys across common, flights, hotels, cars, and auth namespaces
- `src/hooks/useI18n.ts` -- React hook exposing `t()`, `changeLanguage()`, and language state
- `src/components/shared/LanguageSelector.tsx` -- Dropdown UI with flags and native names
- `supported_languages` table -- English (active), Spanish + 6 others (inactive)
- `ui_translations` table -- **Empty** (no Spanish translations seeded)
- `PreferencesSync.tsx` -- Already syncs language preference from DB on login
- `usePersonalizationSettings.ts` -- Already persists `preferred_language`

### What Needs to Happen

**1. Activate Spanish and seed translations (Database)**

Run SQL migration to:
- Set Spanish (`es`) to `is_active = true` in `supported_languages`
- Insert all ~60 Spanish translation rows into `ui_translations` matching the English keys in `src/lib/i18n.ts`

**2. Add Language Selector to Preferences Page**

File: `src/pages/account/PreferencesPage.tsx`

The existing Language section already has a hardcoded list of languages with selection UI. Replace it with the existing `LanguageSelector` component, or keep the current inline buttons but filter to only show active languages from the DB.

**3. Add Language Selection to Onboarding**

File: `src/pages/Setup.tsx`

Add a language picker step or a small language selector at the top of the setup page so first-time users can choose their language before completing onboarding.

**4. Wire up `t()` calls in key UI screens**

Replace hardcoded English strings with `t()` calls in the most visible components:

| Screen | File(s) | Key strings to translate |
|--------|---------|------------------------|
| Navigation | `Header.tsx`, `MobileNav.tsx` | Menu items (Home, Flights, Hotels, etc.) |
| Flight Search | `FlightSearchFormPro.tsx` | Form labels (From, To, Departure, Passengers) |
| Hotel Search | Hotel search form | Destination, Check-in, Check-out, Guests |
| Car Rental | Car search form | Pickup, Drop-off, dates |
| Auth | Login/Signup pages | Email, Password, buttons |
| Common actions | Buttons across app | Search, Book Now, Continue, Cancel, Save |
| Status messages | Toast/loading states | Loading, Success, Error messages |

Each component will import `useTranslation` from the hook and replace string literals with `t("key")`.

**5. Persist and restore language preference**

This is **already working** via:
- `usePersonalizationSettings` saves `preferred_language` to DB
- `PreferencesSync` restores it on login
- `LanguageSelector` calls `updateSettings` on change
- No additional work needed

### What Does NOT Change

- `src/lib/i18n.ts` -- Engine is complete
- `src/hooks/useI18n.ts` -- Hook is complete
- `PreferencesSync.tsx` -- Already syncs language
- Database schema -- Tables exist with RLS policies
- The `LanguageSelector` component -- Already built with verdant green theme

### Technical Notes

- The i18n engine falls back to English when a translation key is missing, so partial translations are safe
- Translations load from Supabase `ui_translations` table on language switch and are cached in memory
- Adding more languages later only requires inserting rows into `ui_translations` and setting `is_active = true` in `supported_languages`
- RTL support (for Arabic) is already accounted for in the `SupportedLanguage` type with a `direction` field

### Files Summary

| File | Action |
|------|--------|
| SQL Migration | Activate Spanish, seed ~60 translation rows |
| `src/pages/account/PreferencesPage.tsx` | Use `LanguageSelector` or filter to active languages |
| `src/pages/Setup.tsx` | Add language picker to onboarding |
| `src/components/Header.tsx` | Replace nav strings with `t()` calls |
| `src/components/search/FlightSearchFormPro.tsx` | Replace form labels with `t()` |
| Auth pages (Login, Signup) | Replace form labels with `t()` |
| Various button/action components | Replace common action strings with `t()` |

