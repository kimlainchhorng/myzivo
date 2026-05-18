-- App version config table for forced updates
CREATE TABLE IF NOT EXISTS public.app_version_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL DEFAULT 'all',
  min_version text NOT NULL DEFAULT '1.0.0',
  latest_version text NOT NULL DEFAULT '1.0.0',
  update_url text,
  force_update boolean NOT NULL DEFAULT false,
  update_message text DEFAULT 'A new version is available. Please update for the best experience.',
  update_message_km text DEFAULT 'កំណែថ្មីអាចប្រើបាន។ សូមធ្វើបច្ចុប្បន្នភាពសម្រាប់បទពិសោធន៍ល្អបំផុត។',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(platform)
);

INSERT INTO public.app_version_config (platform, min_version, latest_version, update_url, force_update)
VALUES 
  ('ios', '1.0.0', '1.0.0', 'https://apps.apple.com/us/app/zivodrivers/id6759507131', true),
  ('android', '1.0.0', '1.0.0', 'https://play.google.com/store/apps/details?id=com.zivo.driver', true),
  ('web', '1.0.0', '1.0.0', NULL, false)
ON CONFLICT (platform) DO NOTHING;

ALTER TABLE public.app_version_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app version config"
  ON public.app_version_config
  FOR SELECT
  TO authenticated
  USING (true);;
