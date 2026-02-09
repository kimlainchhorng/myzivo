

# Language & Currency Settings — `/account/preferences` Page

## Overview

Create a dedicated preferences page at `/account/preferences` where customers can select their preferred language and currency. Wire these selections to the existing i18n framework and CurrencyContext so menus, buttons, notifications, and prices update app-wide. Persist choices to the database via `usePersonalizationSettings`.

## Current State

- **CurrencySelector** exists and works well -- connected to `CurrencyContext`, persists to localStorage and URL params
- **LanguageSelector** exists but is purely local state -- selecting a language does nothing (no connection to i18n, no persistence)
- **i18n framework** (`src/lib/i18n.ts`) is fully functional with DB-backed translations via `ui_translations` table, but nothing triggers language changes from user settings
- **usePersonalizationSettings** stores `preferred_currency` and `preferred_language` in the `user_personalization_settings` table, but these values are never synced back to the CurrencyContext or i18n system on login
- **No `/account/preferences` route** exists

## What Changes

### 1. Create `src/pages/account/PreferencesPage.tsx` -- Settings page

A full preferences page with two sections:

**Language Section:**
- List of supported languages (from `useSupportedLanguages` or static list matching LanguageSelector)
- Each option shows flag, name, native name
- Selected language highlighted with check mark
- On select: calls `useI18n().changeLanguage()` AND persists via `usePersonalizationSettings`

**Currency Section:**
- Reuses the existing `CurrencySelector` component in `inline` variant (shows all currencies in a grid)
- On select: CurrencyContext already handles persistence, also saves to `usePersonalizationSettings`

**Layout:**
- Back button to `/profile` or `/account`
- Two card sections with clear headings
- Save confirmation toast on change

### 2. Update `src/components/shared/LanguageSelector.tsx` -- Connect to i18n

Replace local `useState` with `useI18n()` hook:
- `selected` comes from `currentLanguage` / `currentLanguageInfo`
- `setSelected` calls `changeLanguage()` which triggers i18n reload + re-render
- Also persist to `usePersonalizationSettings` when user is logged in

### 3. Create `src/hooks/usePreferencesSync.ts` -- Sync DB preferences to contexts on login

A hook used at the app level that:
- On auth state change (login), reads `usePersonalizationSettings`
- If `preferred_currency` differs from current CurrencyContext, calls `setCurrency()`
- If `preferred_language` differs from current i18n language, calls `changeLanguage()`
- Only runs once per session (flag in ref)

This ensures a user who set preferences on one device sees them applied on another.

### 4. Update `src/App.tsx` -- Add route and sync hook

- Add route: `/account/preferences` pointing to `PreferencesPage`
- Render `usePreferencesSync` inside the auth-aware provider tree

### 5. Update `src/pages/Profile.tsx` -- Add quick link to Preferences

Add a "Language & Currency" quick link in the existing `quickLinks` array pointing to `/account/preferences`.

## Technical Detail

### PreferencesPage structure

```text
/account/preferences
+----------------------------------+
| < Back     Preferences           |
+----------------------------------+
| Language                         |
| [flag] English        [check]    |
| [flag] Espanol                   |
| [flag] Francais                  |
| ...                              |
+----------------------------------+
| Currency                         |
| [USD $] [EUR] [GBP] [JPY] ...  |
| (inline CurrencySelector)       |
+----------------------------------+
```

### usePreferencesSync logic

```text
1. Watch auth user state
2. When user logs in and personalization settings load:
   a. If preferred_currency != current currency -> setCurrency(preferred_currency)
   b. If preferred_language != current language -> changeLanguage(preferred_language)
3. Skip if already synced this session (useRef flag)
```

### LanguageSelector update

Replace:
```text
const [selected, setSelected] = useState(languages[0]);
```

With:
```text
const { currentLanguage, changeLanguage } = useI18n();
const selected = languages.find(l => l.code === currentLanguage) || languages[0];
```

On select:
```text
changeLanguage(lang.code);
// If user is authenticated, also persist:
updateSettings({ preferred_language: lang.code });
```

### Currency persistence bridge

When the user changes currency via CurrencySelector or PreferencesPage, also call `updateSettings({ preferred_currency: code })` if authenticated. This can be done via a small wrapper or by adding an `onCurrencyChange` callback in the PreferencesPage.

## File Summary

| File | Action | What |
|---|---|---|
| `src/pages/account/PreferencesPage.tsx` | Create | Language and currency settings page at `/account/preferences` |
| `src/hooks/usePreferencesSync.ts` | Create | Syncs DB-stored preferences to CurrencyContext and i18n on login |
| `src/components/shared/LanguageSelector.tsx` | Update | Connect to `useI18n()` instead of local state, persist selection |
| `src/App.tsx` | Update | Add `/account/preferences` route, mount sync hook |
| `src/pages/Profile.tsx` | Update | Add "Language & Currency" quick link |

Two new files, three updates. No schema changes, no new edge functions.

