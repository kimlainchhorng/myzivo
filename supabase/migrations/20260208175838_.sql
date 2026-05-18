-- Fix affected user's restaurant - mark as onboarding complete
UPDATE restaurants 
SET onboarding_completed_at = NOW(), onboarding_step = 4
WHERE id = 'da2f30e5-dde6-4718-9489-5d1c4e4fe091';;
