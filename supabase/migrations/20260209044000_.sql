-- Create function to notify merchants when a campaign targets their restaurant
CREATE OR REPLACE FUNCTION notify_merchant_campaign()
RETURNS trigger AS $$
DECLARE
  restaurant_owner_id uuid;
  campaign_start_display text;
BEGIN
  -- Only proceed if this campaign targets a specific restaurant
  IF NEW.target_restaurant_id IS NOT NULL THEN
    -- Get the restaurant owner
    SELECT owner_id INTO restaurant_owner_id
    FROM restaurants
    WHERE id = NEW.target_restaurant_id;
    
    -- If we found an owner, create the notification
    IF restaurant_owner_id IS NOT NULL THEN
      -- Format the start date display
      IF NEW.start_date > NOW() THEN
        campaign_start_display := 'starts on ' || to_char(NEW.start_date, 'Mon DD');
      ELSE
        campaign_start_display := 'is now active';
      END IF;
      
      -- Insert the notification
      INSERT INTO notifications (
        user_id,
        title,
        body,
        category,
        metadata,
        role,
        is_read
      ) VALUES (
        restaurant_owner_id,
        'Campaign Alert: ' || NEW.name,
        'A marketing campaign targeting your restaurant ' || campaign_start_display || '. Prepare for increased traffic!',
        'marketing',
        jsonb_build_object(
          'campaign_id', NEW.id,
          'campaign_name', NEW.name,
          'campaign_type', NEW.campaign_type,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date,
          'type', 'campaign_alert'
        ),
        'merchant',
        false
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new campaigns
DROP TRIGGER IF EXISTS trigger_notify_merchant_new_campaign ON marketing_campaigns;
CREATE TRIGGER trigger_notify_merchant_new_campaign
  AFTER INSERT ON marketing_campaigns
  FOR EACH ROW
  WHEN (NEW.status IN ('active', 'scheduled', 'running'))
  EXECUTE FUNCTION notify_merchant_campaign();

-- Create trigger for campaign status changes to active
DROP TRIGGER IF EXISTS trigger_notify_merchant_campaign_activated ON marketing_campaigns;
CREATE TRIGGER trigger_notify_merchant_campaign_activated
  AFTER UPDATE OF status ON marketing_campaigns
  FOR EACH ROW
  WHEN (
    OLD.status IS DISTINCT FROM NEW.status 
    AND NEW.status = 'active'
    AND (OLD.status IS NULL OR OLD.status NOT IN ('active'))
  )
  EXECUTE FUNCTION notify_merchant_campaign();;
