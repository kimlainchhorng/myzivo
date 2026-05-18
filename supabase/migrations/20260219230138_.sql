
-- Create application records for all existing drivers that don't have one
INSERT INTO applications (id, type, applicant_user_id, status, current_step, checklist, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'driver',
  d.user_id,
  CASE
    WHEN d.status = 'verified' THEN 'approved'
    WHEN d.status = 'suspended' THEN 'rejected'
    ELSE 'submitted'
  END,
  CASE
    WHEN d.status = 'verified' THEN 7
    ELSE 1
  END,
  jsonb_build_object(
    'profile_completed', (d.full_name IS NOT NULL AND d.full_name != '' AND d.phone IS NOT NULL AND d.phone != ''),
    'vehicle_completed', (d.vehicle_type IS NOT NULL AND d.vehicle_type != '' AND d.vehicle_plate IS NOT NULL AND d.vehicle_plate != ''),
    'docs_uploaded', EXISTS (SELECT 1 FROM driver_documents dd WHERE dd.driver_id = d.id),
    'docs_approved', EXISTS (SELECT 1 FROM driver_documents dd WHERE dd.driver_id = d.id AND dd.status = 'approved'),
    'identity_verified', (d.verification_status = 'verified'),
    'background_check_passed', false,
    'stripe_payouts_ready', COALESCE(d.stripe_payouts_enabled, false)
  ),
  d.created_at,
  now()
FROM drivers d
WHERE NOT EXISTS (
  SELECT 1 FROM applications a WHERE a.applicant_user_id = d.user_id AND a.type = 'driver'
);

-- Now link drivers back to their application records
UPDATE drivers d
SET application_id = a.id
FROM applications a
WHERE a.applicant_user_id = d.user_id
  AND a.type = 'driver'
  AND d.application_id IS NULL;
;
