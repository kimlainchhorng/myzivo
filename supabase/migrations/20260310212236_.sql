UPDATE drivers SET
  documents_verified = true,
  is_verified = true,
  phone_verified = true,
  verification_status = 'verified',
  onboarding_status = 'approved',
  can_go_online = true,
  bank_connected = true,
  stripe_onboarding_complete = true,
  stripe_payouts_enabled = true,
  stripe_charges_enabled = true,
  stripe_details_submitted = true,
  compliance_status = 'ok'
WHERE user_id = '2e0e7bfe-edda-4369-8c87-3ad82bb52b1d';;
