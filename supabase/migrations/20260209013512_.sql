-- Function to get IP addresses with multiple referrals in a time window
CREATE OR REPLACE FUNCTION get_referral_ip_groups(min_count integer DEFAULT 2, hours integer DEFAULT 24)
RETURNS TABLE(
  ip_address text,
  referral_count bigint,
  referral_ids uuid[]
) AS $$
  SELECT 
    ip_address::text,
    COUNT(*) as referral_count,
    array_agg(id) as referral_ids
  FROM referrals
  WHERE ip_address IS NOT NULL
    AND created_at > now() - make_interval(hours => hours)
  GROUP BY ip_address
  HAVING COUNT(*) >= min_count
  ORDER BY referral_count DESC
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to get device fingerprints with multiple referrals in a time window
CREATE OR REPLACE FUNCTION get_referral_device_groups(min_count integer DEFAULT 2, hours integer DEFAULT 168)
RETURNS TABLE(
  device_fingerprint text,
  referral_count bigint,
  referral_ids uuid[]
) AS $$
  SELECT 
    device_fingerprint,
    COUNT(*) as referral_count,
    array_agg(id) as referral_ids
  FROM referrals
  WHERE device_fingerprint IS NOT NULL
    AND created_at > now() - make_interval(hours => hours)
  GROUP BY device_fingerprint
  HAVING COUNT(*) >= min_count
  ORDER BY referral_count DESC
$$ LANGUAGE sql STABLE SECURITY DEFINER;;
