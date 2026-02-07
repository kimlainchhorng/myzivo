
# Rider Driver Rating System

## Summary

Enhance the ride completion flow to save driver ratings and optional feedback to the database. The receipt modal already has a star rating UI - we need to add a comment field and connect it to Supabase.

---

## Current State

| Component | Status |
|-----------|--------|
| `trips.rating` column | Exists (integer, nullable) |
| `trips.feedback` column | Does not exist |
| Star rating UI | Exists in `RideReceiptModal` (not connected to DB) |
| Comment/feedback field | Does not exist |
| Save rating function | Does not exist |

---

## Database Change Required

Add a `feedback` column to the `trips` table:

```sql
ALTER TABLE trips ADD COLUMN feedback TEXT;
```

This will store the optional text comment from the rider.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/supabaseRide.ts` | Modify | Add `saveRideRating()` function |
| `src/components/ride/RideReceiptModal.tsx` | Modify | Add feedback textarea, connect rating to DB |

---

## Technical Details

### 1. New Function: `saveRideRating`

Add to `src/lib/supabaseRide.ts`:

```typescript
export interface SaveRatingPayload {
  tripId: string;
  rating: number;      // 1-5
  feedback?: string;   // Optional comment
}

export const saveRideRating = async (
  payload: SaveRatingPayload
): Promise<UpdateRideResult> => {
  // Check online status
  if (!isOnline()) {
    return { success: false, error: { ... }, attempts: 0 };
  }

  try {
    const { error } = await supabase
      .from("trips")
      .update({ 
        rating: payload.rating,
        feedback: payload.feedback || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", payload.tripId);

    if (error) throw error;
    return { success: true, error: null, attempts: 1 };
  } catch (err) {
    return { success: false, error: categorizeError(err), attempts: 1 };
  }
};
```

### 2. Update RideReceiptModal

The modal already has star rating UI. We need to:

**Add state for feedback:**
```typescript
const [feedback, setFeedback] = useState("");
const [isSaving, setIsSaving] = useState(false);
const [ratingError, setRatingError] = useState<string | null>(null);
```

**Add new prop for tripId:**
```typescript
interface RideReceiptModalProps {
  // ... existing props
  tripId?: string; // Add this
}
```

**Add feedback textarea below star rating:**
```typescript
{/* Optional Comment */}
<div className="mt-4">
  <Textarea
    value={feedback}
    onChange={(e) => setFeedback(e.target.value)}
    placeholder="Tell us about your experience (optional)..."
    className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/40"
    maxLength={500}
  />
</div>
```

**Update rating handler to save to DB:**
```typescript
const handleRate = async (stars: number) => {
  setRating(stars);
  
  if (tripId) {
    setIsSaving(true);
    const result = await saveRideRating({ 
      tripId, 
      rating: stars, 
      feedback: feedback.trim() || undefined 
    });
    setIsSaving(false);
    
    if (!result.success) {
      setRatingError("Failed to save rating. Please try again.");
      return;
    }
  }
  
  setHasRated(true);
};
```

**Update submit button to also allow saving just feedback:**
```typescript
<Button
  onClick={handleSubmitRating}
  disabled={isSaving || rating === 0}
  className="w-full mt-2"
>
  {isSaving ? 'Saving...' : 'Submit Rating'}
</Button>
```

### 3. Pass tripId to RideReceiptModal

Update `RideTripPage.tsx` to pass the tripId:

```typescript
<RideReceiptModal
  isOpen={showReceipt}
  onClose={() => setShowReceipt(false)}
  tripElapsed={elapsed}
  distance={state.distance}
  price={state.price}
  rideName={state.rideName}
  onDone={handleReceiptDone}
  tripId={state.tripId || undefined}  // Add this
/>
```

---

## User Flow

```text
Trip completes
    |
    v
Receipt modal opens
    |
    v
User sees fare breakdown
    |
    v
"Rate your driver" section with 5 stars
    |
    v
User taps stars (1-5)
    |
    v
Optional: User types comment in textarea
    |
    v
User taps "Submit Rating" button
    |
    v
Rating + feedback saved to trips table
    |
    v
Show "Thanks for your feedback!" message
    |
    v
User taps "DONE" to close modal
```

---

## UI Mockup

```text
+----------------------------------+
|     [check] Trip Complete!       |
+----------------------------------+
| Base fare             $2.50      |
| Time (3:45)           $1.15      |
| Distance (2.4 mi)     $4.80      |
| Service fee           $1.50      |
|----------------------------------|
| Total                 $9.95      |
+----------------------------------+
| Rate your driver                 |
|   [*] [*] [*] [*] [*]           |
|                                  |
| +------------------------------+ |
| | Tell us about your           | |
| | experience (optional)...     | |
| +------------------------------+ |
|                                  |
| [     Submit Rating      ]       |
|  "Thanks for your feedback!"     |
+----------------------------------+
| Add a tip                        |
|   [$1] [$3] [$5]                |
+----------------------------------+
|       [     DONE     ]           |
+----------------------------------+
```

---

## Confirmation Message

After successful save, display an animated confirmation:

```typescript
<AnimatePresence>
  {hasRated && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center gap-2 text-green-400 mt-2"
    >
      <CheckCircle2 className="w-4 h-4" />
      <span className="text-sm">Thanks for your feedback!</span>
    </motion.div>
  )}
</AnimatePresence>
```

---

## Error Handling

If save fails (network error, etc.):
- Show error message: "Failed to save rating. Please try again."
- Allow user to retry by tapping stars again
- Don't block the DONE button - user can still dismiss modal

---

## Mobile-Friendly Considerations

- Textarea has `min-h-[80px]` for comfortable typing
- Touch-friendly star buttons with adequate spacing
- Clear disabled states during save
- Optimistic UI with loading indicator
