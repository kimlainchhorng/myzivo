

# Upgrade Order Share to Social Share Sheet

## What Changes

Replace the basic "copy link" share button on the Eats Order Detail page with the full `SocialShareSheet` bottom-sheet component. This gives users options to share via Copy Link, WhatsApp, SMS, Facebook, and native share -- plus the referral CTA if logged in.

## Technical Details

**File:** `src/pages/EatsOrderDetail.tsx`

1. Import `SocialShareSheet` from `@/components/shared/SocialShareSheet`
2. Remove the `handleShareOrderLink` function (no longer needed)
3. Replace the share `<button>` element with `<SocialShareSheet>`, passing:
   - `title`: "My ZIVO Eats Order"
   - `text`: "Check out my order on ZIVO Eats!"
   - `url`: `/eats/orders/${id}`
   - `entityId`: order ID
   - `entityType`: "food_order"
   - `trigger`: the existing round share button (preserving the current icon style)

This follows the same pattern already used elsewhere in the app with `SocialShareSheet`.

