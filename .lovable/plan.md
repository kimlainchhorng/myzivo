

# Voice Search & Ordering — Implementation Plan

## Overview
Add voice-to-text capability to the Eats search bars (both desktop and mobile), enabling customers to speak queries like "Find pizza near me" or "Show burgers." Uses the browser's built-in Web Speech API (`SpeechRecognition`) — no external services or API keys needed. Includes a "Reorder my last order" voice command that navigates to order history.

---

## Current State

| What Exists | Details |
|-------------|---------|
| Desktop search bar | `EatsRestaurants.tsx` — text input with Search icon (line 103) |
| Mobile search bar | `MobileEatsPremium.tsx` — text input with Search icon (line 98) |
| `searchQuery` state | Both components filter restaurants by name/cuisine from this state |
| Order history | `EatsOrders.tsx` page at `/eats/orders` |

### What's Missing
- No microphone icon on either search bar
- No speech recognition integration
- No voice command parsing (e.g., "reorder last order")
- No fallback handling when mic is unavailable

---

## Implementation Plan

### 1) Create `useVoiceSearch` Hook

**New file:** `src/hooks/useVoiceSearch.ts`

Uses the browser's `webkitSpeechRecognition` / `SpeechRecognition` API (no external dependencies).

**Returns:**
```text
{
  isListening: boolean;       // Currently recording
  isSupported: boolean;       // Browser supports speech recognition
  transcript: string;         // Latest recognized text
  startListening: () => void; // Begin voice capture
  stopListening: () => void;  // Stop manually
  error: string | null;       // Permission denied, etc.
}
```

**Behavior:**
- Sets language to `en-US`
- Auto-stops after silence (built-in browser behavior)
- On result: sets transcript, calls `onResult` callback
- On error: sets error state, shows toast for permission issues
- Checks `window.SpeechRecognition || window.webkitSpeechRecognition` for support

### 2) Create `VoiceSearchButton` Component

**New file:** `src/components/eats/VoiceSearchButton.tsx`

A small mic icon button that:
- Shows a `Mic` icon (from lucide) when idle
- Pulses/animates red when listening
- Hidden entirely when `isSupported === false` (graceful fallback)
- Accepts `onTranscript(text: string)` callback

### 3) Add Voice Command Parser

Inside `useVoiceSearch` or as a utility, parse common voice commands:

| Voice Input | Action |
|-------------|--------|
| "Find pizza near me" | Sets search query to "pizza" |
| "Show burgers" | Sets search query to "burgers" |
| "Reorder my last order" | Navigates to `/eats/orders` |
| Any other phrase | Sets as search query directly |

Simple keyword matching — strips filler words like "find", "show", "search for", "near me".

### 4) Integrate into Desktop Search Bar

**File to modify:** `src/pages/EatsRestaurants.tsx`

Add `VoiceSearchButton` inside the search input container (next to the Search icon, on the right side). On transcript result:
- Parse voice command
- Set `searchQuery` state
- If "reorder" detected, navigate to `/eats/orders`

### 5) Integrate into Mobile Search Bar

**File to modify:** `src/components/eats/MobileEatsPremium.tsx`

Add `VoiceSearchButton` inside the mobile search bar container (right side of input). Same behavior as desktop.

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useVoiceSearch.ts` | Web Speech API hook with support detection and error handling |
| `src/components/eats/VoiceSearchButton.tsx` | Animated mic button with listening state |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/pages/EatsRestaurants.tsx` | Add VoiceSearchButton next to search input |
| `src/components/eats/MobileEatsPremium.tsx` | Add VoiceSearchButton next to mobile search input |

---

## Voice Search Flow

```text
User taps mic icon on search bar
       |
       v
  Browser requests microphone permission (first time only)
       |
       ├── Denied → Toast: "Microphone access needed for voice search"
       │             Mic icon stays hidden or shows disabled state
       │             Text input remains fully functional
       |
       ├── Granted → Mic icon pulses red, listening begins
       |
       v
  User speaks: "Find pizza near me"
       |
       v
  SpeechRecognition returns transcript
       |
       v
  Voice command parser:
       ├── Strips filler: "find", "show", "search for", "near me"
       ├── Result: "pizza"
       ├── Sets searchQuery → restaurants filter instantly
       |
       v
  Special commands:
       ├── "reorder" / "last order" → navigate to /eats/orders
       └── Everything else → search query
```

---

## Accessibility & Fallback

| Scenario | Behavior |
|----------|----------|
| Browser doesn't support Speech API | Mic button not rendered; text search works normally |
| Microphone permission denied | Toast notification; mic button shows disabled state |
| No speech detected (timeout) | Auto-stops, no change to search |
| Poor recognition | Transcript set as-is; user can edit in text field |
| Desktop Chrome/Edge | Full support via `webkitSpeechRecognition` |
| Safari/Firefox | Limited or no support; mic button hidden automatically |

---

## Design Details

### Desktop (EatsRestaurants)
```text
+------------------------------------------+
| [Search icon]  Search restaurants...  [Mic] |
+------------------------------------------+
```

### Mobile (MobileEatsPremium)
```text
+------------------------------------------+
| [Search]  Craving... (e.g. Ramen)   [Mic] |
+------------------------------------------+
```

### Listening State
- Mic icon turns orange/red with a pulse animation
- Placeholder text changes to "Listening..."
- Returns to normal after speech ends

