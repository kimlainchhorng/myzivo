-- Fix drivers stuck with onboarding_status = 'pending_review' but already verified
UPDATE drivers
SET onboarding_status = 'approved',
    status = 'verified',
    can_go_online = true
WHERE onboarding_status = 'pending_review'
  AND is_verified = true;;
