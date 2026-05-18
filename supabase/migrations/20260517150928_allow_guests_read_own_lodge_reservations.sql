-- The only existing SELECT policy on lodge_reservations restricts reads to
-- the property owner or platform admins. That meant a customer who just
-- created a booking could not load it back on the confirmation / "My trips"
-- screens — RLS would silently return zero rows.
--
-- Allow the authenticated user identified as the guest on a reservation to
-- read it. Writes are still gated by the existing owner/admin policy, so
-- guests can read but not modify rows.
CREATE POLICY "Guests read their own lodge reservations"
ON public.lodge_reservations
FOR SELECT
TO authenticated
USING (auth.uid() = guest_id);;
