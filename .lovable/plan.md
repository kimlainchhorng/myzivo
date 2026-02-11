

## Add "My Reviews" History Page

Everything in the Ratings and Reviews system already exists except one piece: a dedicated page where users can browse their own past reviews across all service types.

---

### What Already Exists (no changes needed)

- Rating modals for rides, food, delivery, hotels, flights, cars
- Star rating component, review display component
- Eats reviews hook with `useMyOrderReviews()`
- Order rating hook with submission logic
- P2P review forms for vehicles and owners
- Trip rating widget for flights/hotels

---

### What Will Be Added

**1. New Page: `src/pages/account/MyReviewsPage.tsx`**

A full-screen review history page showing all past reviews the user has submitted. Accessible from Account settings.

Content:
- Header with back button and "My Reviews" title
- Summary card: total reviews count, average rating given, breakdown by service type
- Filter tabs: All / Rides / Food / Delivery / Hotels / Flights
- List of review cards, each showing:
  - Service type icon and name
  - Star rating given
  - Date submitted
  - Comment text (if any)
  - Tags selected (if any)
- Empty state with star icon and "No reviews yet" message
- Verdant green theme with rounded-2xl cards

Data source: Pulls from `useMyOrderReviews()` for eats reviews. For other service types (rides, hotels, flights), since those reviews are stored only via the generic RatingModal callbacks (no persistent storage hook exists for non-eats reviews), the page will show eats reviews from Supabase and use localStorage for any other service reviews submitted through the RatingModal.

**2. New Route**

Add `/account/reviews` route in `App.tsx`.

**3. Account Page Link**

Add a "My Reviews" menu item in the account/settings page that links to `/account/reviews`.

---

### Technical Details

**New files (1):**

| File | Purpose |
|------|---------|
| `src/pages/account/MyReviewsPage.tsx` | Review history page |

**Modified files (2):**

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/account/reviews` route |
| `src/pages/Account.tsx` | Add "My Reviews" menu item with Star icon |

**Hook usage:**
- `useMyOrderReviews()` from `useEatsReviews.ts` for food order reviews
- `useAuth()` for gating

**Card design:**
```text
+-------------------------------------------+
| [Utensils] Burger Palace          4.0 ★★★★|
| Feb 10, 2026                              |
| "Great food, fast delivery!"              |
| [Fresh food] [Good portions]              |
+-------------------------------------------+
```

Styled with `rounded-2xl` cards, verdant green accents, large star icons matching the existing RatingModal aesthetic.

