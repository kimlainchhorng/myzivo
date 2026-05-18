-- Allow drivers to SELECT their assigned trips / food orders based on drivers.user_id = auth.uid()

DO $$
BEGIN
  -- trips
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'trips'
      AND policyname = 'Drivers can view their assigned trips'
  ) THEN
    EXECUTE 'DROP POLICY "Drivers can view their assigned trips" ON public.trips';
  END IF;

  EXECUTE $sql$
    CREATE POLICY "Drivers can view their assigned trips"
    ON public.trips
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.drivers d
        WHERE d.id = trips.driver_id
          AND d.user_id = auth.uid()
      )
    );
  $sql$;

  -- food_orders
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'food_orders'
      AND policyname = 'Drivers can view their assigned food orders'
  ) THEN
    EXECUTE 'DROP POLICY "Drivers can view their assigned food orders" ON public.food_orders';
  END IF;

  EXECUTE $sql$
    CREATE POLICY "Drivers can view their assigned food orders"
    ON public.food_orders
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.drivers d
        WHERE d.id = food_orders.driver_id
          AND d.user_id = auth.uid()
      )
    );
  $sql$;
END $$;
;
