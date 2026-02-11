

## Fix: Back Button on Rides Page

**Problem**: The back button on the Rides page (`/rides`) calls `navigate(-1)` when on the request step, which fails silently if there's no browser history (e.g., when the user opened `/rides` directly or from a deep link).

**Solution**: Replace `navigate(-1)` with a safe fallback that navigates to the home page when there's no history to go back to.

---

### Changes

**File: `src/pages/Rides.tsx` (line 731)**

Update the back button handler for the `request` step:

```text
// Before
if (step === "request") {
  navigate(-1);
}

// After
if (step === "request") {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate("/");
  }
}
```

This checks if there is a previous history entry. If not, it navigates to the home page (`/`) as a safe fallback.

---

### Summary

| Item | Detail |
|------|--------|
| Files modified | 1 (`src/pages/Rides.tsx`) |
| Lines changed | ~3 (line 731) |
| Risk | None -- additive fallback logic only |

