

# Fix Mobile App Updates — Implementation Plan

## Problem
The PWA is configured with `vite-plugin-pwa` and a service worker (`sw.js`), but **there is no code in the app that registers the service worker or detects updates**. This means:

1. The browser caches old app files
2. When you publish an update, customers keep seeing the old version
3. The only fix for customers right now is to delete and re-download the app

## Root Cause
- `vite-plugin-pwa` has `registerType: "autoUpdate"` and `strategies: "injectManifest"` configured
- The service worker has `skipWaiting()` and `clients.claim()` (good)
- But **no code in `src/`** actually calls `registerSW()` from the PWA plugin — so the browser never knows about updates

---

## Fix

### 1) Register the Service Worker with Update Detection

**New file:** `src/hooks/usePWAUpdate.ts`

Uses `virtual:pwa-register` (provided by vite-plugin-pwa) to:
- Register the service worker on app load
- Detect when a new version is available
- Auto-apply the update (call `updateSW(true)`) since `registerType` is `autoUpdate`
- Show a brief toast: "App updated! Refreshing..." before reload

### 2) Create Update Prompt Component

**New file:** `src/components/shared/PWAUpdatePrompt.tsx`

A small toast/banner that appears when a new version is ready:
- Shows: "A new version is available"
- Button: "Update now"
- On click: applies the update and reloads
- Auto-updates after 10 seconds if user doesn't interact (since autoUpdate is configured)

### 3) Wire into App Entry Point

**File to modify:** `src/App.tsx`

Add `PWAUpdatePrompt` component at the root level so it's always active, detecting updates on every page.

### 4) Fix Service Worker for Proper Cache Busting

**File to modify:** `public/sw.js`

Add a `message` listener for `SKIP_WAITING` (already exists) and ensure the activate event cleans old caches, so stale files don't persist.

---

## How It Works After the Fix

```text
You publish an update on Lovable
       |
       v
New service worker file is generated with new hash
       |
       v
Customer opens the app (or it checks in background)
       |
       v
vite-plugin-pwa detects new SW version
       |
       v
PWAUpdatePrompt shows: "A new version is available"
       |
       v
  Auto-updates after 10 seconds OR user taps "Update now"
       |
       v
  Page reloads with latest version — no delete/reinstall needed
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/usePWAUpdate.ts` | Registers SW and detects updates via `virtual:pwa-register` |
| `src/components/shared/PWAUpdatePrompt.tsx` | Banner/toast prompting user to update |

### Modified Files (1)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add `PWAUpdatePrompt` at root level |

---

## What Customers Will Experience

| Before (Current) | After (Fixed) |
|-------------------|---------------|
| Updates never appear | Updates detected automatically |
| Must delete and reinstall app | Quick reload applies update |
| Stale cached pages shown | Fresh content after brief reload |
| No feedback about versions | "A new version is available" prompt |

