
-- Convert all public views to security_invoker = true
-- This ensures they respect RLS of the querying user

ALTER VIEW public.car_rentals_masked SET (security_invoker = true);
ALTER VIEW public.customer_feedback_masked SET (security_invoker = true);
ALTER VIEW public.customer_feedback_public SET (security_invoker = true);
ALTER VIEW public.customer_orders_masked SET (security_invoker = true);
ALTER VIEW public.customer_orders_view SET (security_invoker = true);
ALTER VIEW public.drivers_public SET (security_invoker = true);
ALTER VIEW public.food_orders_masked SET (security_invoker = true);
ALTER VIEW public.hotel_bookings_masked SET (security_invoker = true);
ALTER VIEW public.loyalty_members_masked SET (security_invoker = true);
ALTER VIEW public.public_profiles SET (security_invoker = true);
ALTER VIEW public.rental_cars_public SET (security_invoker = true);
ALTER VIEW public.reservations_masked SET (security_invoker = true);
ALTER VIEW public.restaurants_public SET (security_invoker = true);
ALTER VIEW public.square_connections_safe SET (security_invoker = true);
ALTER VIEW public.staff_members_masked SET (security_invoker = true);
ALTER VIEW public.system_settings_public SET (security_invoker = true);
ALTER VIEW public.user_credit_balances SET (security_invoker = true);
ALTER VIEW public.v_admin_phone_conflicts SET (security_invoker = true);
ALTER VIEW public.v_driver_dispatch_ready SET (security_invoker = true);
ALTER VIEW public.v_my_restaurant_rank SET (security_invoker = true);
ALTER VIEW public.v_restaurant_rank SET (security_invoker = true);
ALTER VIEW public.vehicles_public SET (security_invoker = true);
ALTER VIEW public.vehicles_safe SET (security_invoker = true);
ALTER VIEW public.waitlist_masked SET (security_invoker = true);
;
