

## Problem Diagnosis

After testing the live Walmart store page, I found two root causes:

1. **The Walmart SERP API returns very few products for multi-word queries.** Queries like `"chicken beef pork"` and `"fresh fruit"` return only 2 results, while single-word queries like `"groceries"` return 50 products. The category browser fires 5+ parallel API calls with multi-word terms, each returning ~2 items.

2. **The main product grid is hidden when the category browser is visible.** Line 603 of `GroceryStorePage.tsx` shows the category browser only when `!query && !activeFilter`, and the product grid from the default query is pushed far below, behind the Store Hero card, Promo Banner, and Shopping List sections.

---

## Plan

### 1. Fix category search queries to use single high-yield terms
**File: `src/components/grocery/GroceryCategoryBrowser.tsx`**

Replace multi-word category queries with single terms that the Walmart SERP API handles better:
- `"fresh fruit"` → `"vegetables"` (Fresh Produce)
- `"chicken beef pork"` → `"meat"` (Meat & Seafood)
- `"milk cheese eggs"` → `"dairy"` (Dairy & Eggs)
- `"water juice soda"` → `"beverages"` (Beverages)
- `"chips snacks"` → `"snacks"` (Snacks)
- `"frozen meals"` → `"frozen"` (Frozen Foods)
- `"pasta rice cereal"` → `"pantry"` (Pantry Staples)
- `"cleaning supplies"` → `"household"` (Household)

Also apply same fix to `QUICK_FILTERS` in `GroceryStorePage.tsx`.

### 2. Show product grid immediately alongside category browser
**File: `src/pages/GroceryStorePage.tsx`**

- Remove the condition that hides the product grid when the category browser is showing (currently the grid only appears when `sortedProducts.length > 0` but the category browser replaces it when there's no active query)
- Always show the default product grid below the category browser so customers see a full grid of products on landing
- Move the category browser ABOVE the product grid but keep both visible

### 3. Streamline page layout — products first
**File: `src/pages/GroceryStorePage.tsx`**

Reorder page sections to show products sooner:
1. Header + search + quick filters (keep as-is, sticky)
2. Category browser (compact, always visible)
3. Product grid (always visible with default "groceries" results)
4. Store Hero card, Promo Banner, Shopping List → move below or collapse into a smaller inline section

### 4. Increase products per category to fill carousels
**File: `src/components/grocery/GroceryCategoryBrowser.tsx`**

- Increase default visible categories from 5 to all 8
- The single-word queries should naturally return 10+ products instead of 2, filling the horizontal carousels properly

### Technical Details

The Walmart SERP API (`walmart-api4.p.rapidapi.com/walmart-serp.php`) parses Walmart search result pages. Multi-word queries get treated as exact-match phrases, returning very few results. Single common terms like "meat", "dairy", "vegetables" match Walmart's department-level categories and return 10-50 products.

No edge function changes needed — the fix is entirely in the frontend query strings and page layout.

