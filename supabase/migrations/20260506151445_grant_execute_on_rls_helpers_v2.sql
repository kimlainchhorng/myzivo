GRANT EXECUTE ON FUNCTION public.is_customer(uuid)               TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_restaurant_member(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_rental_car_owner(uuid)        TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.can_view_channel(uuid, uuid)     TO authenticated, anon;;
