## Problem

In your screenshot, the "New Group" bottom sheet opens but the **Create Group button at the bottom is hidden behind the iOS home indicator / safe area** — you can only see the header, "Group name…" input, and the start of the friend list. The Create button is rendered off-screen at the bottom.

Root cause in `src/components/chat/CreateGroupModal.tsx`:

- The sheet is `max-h-[80vh]` and uses `items-end` on mobile, so it sticks to the bottom edge of the screen.
- The footer containing the Create button has only `p-4` — no `env(safe-area-inset-bottom)` padding, so iOS pushes it under the home indicator.
- There's also no top safe-area on the sheet itself, but since it's a bottom sheet that's fine; the real bug is the bottom.

## Fix

In `src/components/chat/CreateGroupModal.tsx`:

1. Add safe-area bottom padding to the Create Group footer so the button always clears the iOS home indicator:
   ```tsx
   // Before
   <div className="p-4 border-t border-border/30">
   // After
   <div className="p-4 border-t border-border/30 pb-[max(1rem,env(safe-area-inset-bottom))]">
   ```

2. Slightly reduce the sheet max-height to `max-h-[85dvh]` (using `dvh` instead of `vh`) so it correctly accounts for mobile browser chrome and never clips on small devices.

3. No design or logic changes — just safe-area handling.

## Audit — same pattern elsewhere

Quickly check other bottom-sheet modals in `src/components/chat/` (e.g. `AddContactSheet`, `ForwardPickerSheet`, `UsernameClaimSheet`) and apply the same `pb-[max(1rem,env(safe-area-inset-bottom))]` to any footer/action area that isn't already handling safe-area-bottom. Only fix files that actually have the bug — don't touch ones that already use `safe-area-bottom` or `pb-[env(...)]`.
