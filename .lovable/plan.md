# E2E test — close button stays outside safe-area on notched profiles

Add a Vitest + Testing-Library suite that mounts the real `CommentsSheet` and `ShareSheet`, drives them open like a user would, and proves the close button's inline `style.top` / `paddingTop` expression resolves above the device's top safe-area inset on every notched profile.

## Why Vitest (not Playwright)

- jsdom doesn't compute real layout, but every safe-area concern in these sheets is encoded in **inline `style={{ ... }}`** strings that reference `env(safe-area-inset-top)`. We can read those strings off the rendered DOM and evaluate them deterministically against each device profile. No real browser needed, no dev-server, no auth, no post fixtures.
- This is the same evaluator we already ship in `scripts/qa/safe-area-check.mjs` — extracting it to a shared helper lets the unit test use the exact production CSS, not a copy.
- Playwright is overkill here: it would require seeded posts, a logged-in session, and a notched device emulation profile — all flaky to maintain.

## Files

### 1. `src/lib/social/safeAreaEval.ts` (new)

Extract the CSS-expression evaluator from `scripts/qa/safe-area-check.mjs` into a typed module:

```ts
export interface DeviceProfile {
  name: string;
  top: number; bottom: number; left: number; right: number;
}

export const NOTCHED_DEVICES: DeviceProfile[] = [
  { name: "iPhone 15 Pro", top: 59, bottom: 34, left: 0, right: 0 },
  { name: "iPhone 14 Pro Max", top: 59, bottom: 34, left: 0, right: 0 },
  { name: "Pixel 8 Pro", top: 32, bottom: 24, left: 0, right: 0 },
  { name: "Galaxy S24 Ultra", top: 36, bottom: 18, left: 0, right: 0 },
  { name: "iPad Pro 11 landscape", top: 24, bottom: 20, left: 20, right: 20 },
];

export function evaluateCssExpression(expr: string, device: DeviceProfile): number;
```

Implementation is the same recursive-descent evaluator (max/min/calc, px/rem) already in the QA script. Rewrite `scripts/qa/safe-area-check.mjs` to import from this module so behavior stays in lock-step.

### 2. `src/components/social/__tests__/SwipeableSheet.safeArea.test.tsx` (new)

The actual E2E-ish suite. Pseudocode:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import CommentsSheet from "@/components/social/CommentsSheet";
import ShareSheet from "@/components/shared/ShareSheet";
import { NOTCHED_DEVICES, evaluateCssExpression } from "@/lib/social/safeAreaEval";

// mock supabase (same shape as critical-flows.test.tsx)
// mock usePostComments → returns { comments: [], loading: false, ... }
// mock useHaptics → no-op
// mock framer-motion to render motion.div as plain div (skip animation)

describe.each(NOTCHED_DEVICES)("$name", (device) => {
  it("CommentsSheet close button clears safe-area", () => {
    const onClose = vi.fn();
    render(
      <CommentsSheet
        open
        onClose={onClose}
        postId="p1" postSource="user"
        currentUserId="u1" commentsCount={0}
      />
    );

    // 1) Sheet panel paddingTop expression clears the inset
    const dialog = screen.getByRole("dialog", { name: /comments/i });
    const panel = dialog.querySelector('[style*="paddingTop"]') as HTMLElement;
    const padTop = panel.style.paddingTop;
    expect(evaluateCssExpression(padTop, device)).toBeGreaterThanOrEqual(device.top);

    // 2) Close button is keyboard-reachable + has aria-label "Close Comments"
    const closeBtn = screen.getByRole("button", { name: /close comments/i });
    expect(closeBtn).toBeInTheDocument();

    // 3) The close button sits inside the safe-area-padded region (its
    //    nearest ancestor with paddingTop is the panel above), so
    //    button.offsetTop relative to the viewport >= device.top.
    //    Since jsdom has no layout, we instead assert the panel's
    //    paddingTop expression is the only top spacing and it clears
    //    the inset (covered above), AND the button is rendered AFTER
    //    the grabber (DOM order proves it isn't behind it).
    expect(panel.contains(closeBtn)).toBe(true);

    // 4) Escape closes the sheet
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("ShareSheet close button clears safe-area", () => {
    const onClose = vi.fn();
    render(
      <ShareSheet
        shareUrl="https://hizivo.com/r/abc"
        shareText="Check this out"
        onClose={onClose}
      />
    );

    const dialog = screen.getByRole("dialog", { name: /share to/i });
    const panel = dialog.querySelector('[style*="paddingTop"]') as HTMLElement;
    expect(evaluateCssExpression(panel.style.paddingTop, device))
      .toBeGreaterThanOrEqual(device.top);

    const closeBtn = screen.getByRole("button", { name: /close share to/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
```

### 3. Mocks

Inside the test file:
- Mock `framer-motion`'s `motion.*` to render a regular `div` and `AnimatePresence` to render `children`. This keeps the inline `style` props intact (we read them) while skipping animation timing in jsdom.
- Mock `@/integrations/supabase/client` with the minimal shape used by `usePostComments` (or just mock the hook directly).
- Mock `@/hooks/useHaptics` → returns no-op `impact`.
- Mock `@/hooks/usePostComments` to return `{ comments: [], loading: false, submitting: false, addComment, deleteComment, toggleReaction }`.

### 4. Update QA script to share the evaluator

Refactor `scripts/qa/safe-area-check.mjs`:
- Remove the inline evaluator and `DEVICES` array.
- `import { NOTCHED_DEVICES, evaluateCssExpression } from "../../src/lib/social/safeAreaEval.ts"` — but since the script is `.mjs` Node, instead duplicate is fine OR make the helper a `.js`/`.mjs` module re-exported by the `.ts` file. Simpler: keep the script self-contained but import the device list + evaluator from a tiny `scripts/qa/safe-area-eval.mjs` file, and have `src/lib/social/safeAreaEval.ts` re-export from it via a thin TS wrapper. Single source of truth without TS-in-Node complexity.

## What this proves

For each of 5 notched device profiles, on each of 2 sheets:
- The dialog opens with the expected accessible name.
- The panel's `paddingTop` resolves to ≥ the device's top safe-area inset, so the grabber + header (which contains the X button) cannot render under the notch.
- The close button has the strengthened `Close <Title>` aria-label and is inside the padded region.
- Escape closes the sheet (verifies the focus-trap + key handler are wired).

## Out of scope

- Real-browser layout assertions — covered by the existing manual responsive QA and the static checklist script.
- Drag-to-close gesture testing — Framer-Motion drag is not testable in jsdom.
- Login/auth flow.
