
-- Clear stale test-mode Stripe accounts from drivers
UPDATE drivers
SET stripe_account_id = NULL,
    stripe_onboarding_complete = false
WHERE stripe_account_id IN ('acct_1T19ifJ8pLPrwCDX', 'acct_1Syco5J2GgWjyKvH');

-- Clear matching rows from driver_stripe_accounts
DELETE FROM driver_stripe_accounts
WHERE stripe_account_id IN ('acct_1T19ifJ8pLPrwCDX', 'acct_1Syco5J2GgWjyKvH');
;
