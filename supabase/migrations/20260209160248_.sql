
-- Extend marketing_campaigns table
ALTER TABLE marketing_campaigns
  ADD COLUMN IF NOT EXISTS trigger_type text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS sms_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_message text,
  ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_interval text,
  ADD COLUMN IF NOT EXISTS next_run_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_executed_at timestamptz,
  ADD COLUMN IF NOT EXISTS trigger_config jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Extend campaign_deliveries table
ALTER TABLE campaign_deliveries
  ADD COLUMN IF NOT EXISTS channel text DEFAULT 'push',
  ADD COLUMN IF NOT EXISTS opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS clicked_at timestamptz;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_marketing_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_marketing_campaigns_updated_at ON marketing_campaigns;
CREATE TRIGGER trg_marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketing_campaigns_updated_at();
;
