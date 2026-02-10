

## Update Stripe to Live Mode

### What will change
Replace the current Stripe **test** publishable key with your **live** publishable key in `src/lib/stripe.ts`. This enables real payment processing across all verticals (Rides, Eats, Travel).

### Technical Details
- **File**: `src/lib/stripe.ts`
- **Change**: Replace `pk_test_51Stzp...` with `pk_live_51Stzp1QrpgPhUA5uEbfhsEXqg0JBPdluYSWudrUdp6XrfvQaZSVetKgFrfAp1hmq4f148EgEO3XBKCNp79AQcJ4B00mbtJpGLQ`
- **Impact**: All Stripe Elements and checkout flows across Rides, Eats, and Travel will use live mode
- No other files need changes -- all components already import from `src/lib/stripe.ts`

