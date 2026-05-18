
-- Lost item return requests table
CREATE TABLE public.lost_item_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired')),
  item_description TEXT NOT NULL,
  customer_phone TEXT,
  pickup_address TEXT,
  dropoff_address TEXT,
  pickup_city TEXT,
  dropoff_city TEXT,
  distance_miles NUMERIC(6,2),
  fee_cents INTEGER NOT NULL DEFAULT 1500,
  fee_type TEXT NOT NULL DEFAULT 'same_city' CHECK (fee_type IN ('same_city', 'different_city')),
  driver_payout_cents INTEGER NOT NULL DEFAULT 1500,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_intent_id TEXT,
  customer_notes TEXT,
  driver_notes TEXT,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lost_item_requests ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own lost item requests
CREATE POLICY "Drivers can view own lost item requests"
  ON public.lost_item_requests FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid() OR customer_id = auth.uid());

-- Customers can create lost item requests
CREATE POLICY "Customers can insert lost item requests"
  ON public.lost_item_requests FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Drivers can update their own requests (accept/complete)
CREATE POLICY "Drivers can update own lost item requests"
  ON public.lost_item_requests FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid() OR customer_id = auth.uid());

-- Admins can manage all
CREATE POLICY "Admins can manage lost item requests"
  ON public.lost_item_requests FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_lost_item_requests_updated_at
  BEFORE UPDATE ON public.lost_item_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Notify driver when a new lost item request is created
CREATE OR REPLACE FUNCTION public.notify_driver_lost_item()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  driver_name TEXT;
  customer_name TEXT;
BEGIN
  SELECT full_name INTO driver_name FROM public.drivers WHERE id = NEW.driver_id;
  
  -- Create admin notification
  INSERT INTO public.admin_notifications (category, title, message, severity, entity_type, entity_id, link)
  VALUES ('lost_item', 'Lost Item Return Request',
    'Customer requested lost item return from driver ' || COALESCE(driver_name, 'Unknown') || '. Fee: $' || (NEW.fee_cents / 100.0)::TEXT,
    'info', 'lost_item', NEW.id::text, '/admin/lost-items');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'notify_driver_lost_item: %', SQLERRM; RETURN NEW;
END; $$;

CREATE TRIGGER trg_notify_driver_lost_item
  AFTER INSERT ON public.lost_item_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_driver_lost_item();

-- Notify when driver completes return - credit earnings
CREATE OR REPLACE FUNCTION public.complete_lost_item_return()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    NEW.completed_at = now();
    
    -- Credit driver earnings via wallet ledger
    INSERT INTO public.wallet_ledger (user_id, amount_cents, type, description, reference_id, reference_type)
    VALUES (NEW.driver_id, NEW.driver_payout_cents, 'credit', 
      'Lost item return - $' || (NEW.driver_payout_cents / 100.0)::TEXT,
      NEW.id::text, 'lost_item_return')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'complete_lost_item_return: %', SQLERRM; RETURN NEW;
END; $$;

CREATE TRIGGER trg_complete_lost_item_return
  BEFORE UPDATE ON public.lost_item_requests
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed')
  EXECUTE FUNCTION public.complete_lost_item_return();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_item_requests;
;
