

## Diagnosis

I tested the Walmart search live by typing "milk" in the grocery page. **Products ARE appearing** -- 2 product cards rendered with images, names, prices, and "Add to Cart" buttons. The edge function is correctly called and returns data.

However, there are several issues to fix:

### Issues Found

1. **Product names still contain trailing price text** (e.g., "Crystal Creamery... Gallon128 fl oz $4.86 3.8 ¢/fl oz") -- the `cleanName` function in the edge function may not be deployed or the regex isn't matching all patterns
2. **Low result count** (only 2 products for "milk") -- the SERP API returns variable counts; we should log `body.productsCount` and consider pagination
3. **Debug banner renders BELOW products** instead of above them, making it hard to see
4. **Brand field is always empty** -- the API response doesn't include a `brand` field in this SERP format
5. **No `store` field** in the mapped response (requested in requirements)

### Plan

#### 1. Fix edge function product mapping
- Improve `cleanName` regex to handle more patterns (e.g., "128 fl oz $4.86 3.8 ¢/fl oz")
- Extract brand from product title if `brand` field is empty (first word/phrase before comma)
- Add `store: "Walmart"` to each mapped product
- Redeploy edge function

#### 2. Fix debug banner position
- Move the debug result count banner to render ABOVE the product grid, not below it

#### 3. Improve product name parsing
- Handle unit-price suffixes like "3.8 ¢/fl oz"
- Handle volume/size info concatenated without space (e.g., "Gallon128")

#### 4. Keep all existing functionality
- Debounced search (500ms) -- already working
- Loading spinner -- already working
- Error display -- already working
- Empty state -- already working
- Console logs -- already in place
- Cart integration -- already working

### Files to Change
- `supabase/functions/walmart-search/index.ts` -- fix name cleaning, brand extraction, add store field
- `src/pages/GroceryPage.tsx` -- move debug banner above product grid

