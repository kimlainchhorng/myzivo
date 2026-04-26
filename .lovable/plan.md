## Goal

Fix the "Create new Business" entry in the profile dropdown so that:
1. The icon and text render in true **black** (not the green seen in the screenshot).
2. The button is **always visible** — even when the user already owns one or more business pages — so they can create additional businesses (matching how Facebook lets users own multiple Pages).

## Changes

**File: `src/components/home/NavBar.tsx`**

1. Remove the `ownerStores.length === 0` gate so "Create new Business" always appears at the bottom of the business list.
2. Force the icon and label to render in true black with explicit color classes (`text-black` for both the `Building2` icon and the item), overriding any inherited green/primary token. Keep neutral hover styling (`focus:text-black`) so it doesn't flip to the accent color on hover.
3. Add a subtle top separator above the "Create new Business" row when there are existing stores, so it visually reads as a secondary action under the list of owned pages.

### Resulting markup (conceptual)

```tsx
{ownerStores.length > 0 && <DropdownMenuSeparator />}
<DropdownMenuItem
  onClick={() => navigate("/business/new")}
  className="cursor-pointer rounded-lg py-2 gap-2.5 text-black focus:text-black"
>
  <Building2 className="w-4 h-4 text-black" /> Create new Business
</DropdownMenuItem>
```

## Out of scope

- No changes to the `useOwnerStores` hook or the business creation wizard.
- No changes to other dropdown items (Business Page fallback, ZIVO+, Membership, etc.).