
-- Backfill admin notifications for existing drivers so admin can see them
INSERT INTO public.admin_notifications (category, title, message, severity, entity_type, entity_id, link)
SELECT 
  CASE 
    WHEN d.onboarding_status = 'pending_review' THEN 'driver_onboarding'
    WHEN d.onboarding_status = 'approved' THEN 'driver_approved'
    ELSE 'driver_signup'
  END,
  CASE 
    WHEN d.onboarding_status = 'pending_review' THEN 'Application Ready: ' || COALESCE(d.full_name, d.email)
    WHEN d.onboarding_status = 'approved' THEN 'Driver Approved: ' || COALESCE(d.full_name, d.email)
    ELSE 'New Driver Signup: ' || COALESCE(d.full_name, d.email)
  END,
  'Driver ' || COALESCE(d.full_name, 'Unknown') || ' (' || COALESCE(d.email, '') || ') - Status: ' || d.onboarding_status,
  CASE WHEN d.onboarding_status = 'pending_review' THEN 'warning' ELSE 'info' END,
  'driver',
  d.id::text,
  '/admin/applications/drivers'
FROM public.drivers d
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_notifications n WHERE n.entity_id = d.id::text AND n.entity_type = 'driver'
);
;
